import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

interface Order {
  orderId: string;
  date: string;
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  shippingInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentIntentId?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders';
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Listen for user login events to reload orders from backend
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('user-logged-in', () => {
        this.loadOrders();
      });
    }
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  // Load orders from backend or localStorage
  loadOrders(): void {
    if (this.isLoggedIn()) {
      // Load from backend
      this.http.get<{ orders: Order[] }>(this.apiUrl, { headers: this.getHeaders() })
        .subscribe({
          next: (response) => {
            this.ordersSubject.next(response.orders);
          },
          error: (error) => {
            console.error('Error loading orders from backend:', error);
            // Fallback to localStorage
            this.loadOrdersFromLocalStorage();
          }
        });
    } else {
      // Load from localStorage for guest users
      this.loadOrdersFromLocalStorage();
    }
  }

  private loadOrdersFromLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const ordersData = localStorage.getItem('orders');
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        this.ordersSubject.next(orders);
      } else {
        this.ordersSubject.next([]);
      }
    }
  }

  // Create a new order
  createOrder(orderData: {
    orderId: string;
    items: any[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    status?: string;
    shippingInfo: any;
    paymentIntentId?: string;
  }): Observable<any> {
    if (this.isLoggedIn()) {
      // Save to backend
      return new Observable(observer => {
        this.http.post<any>(`${this.apiUrl}/create`, orderData, { headers: this.getHeaders() })
          .subscribe({
            next: (response) => {
              // Reload orders from backend
              this.loadOrders();
              observer.next(response);
              observer.complete();
            },
            error: (error) => {
              console.error('Error creating order in backend:', error);
              // Fallback to localStorage
              this.saveOrderToLocalStorage(orderData);
              observer.next({ message: 'Order saved locally' });
              observer.complete();
            }
          });
      });
    } else {
      // Save to localStorage for guest users
      return new Observable(observer => {
        this.saveOrderToLocalStorage(orderData);
        observer.next({ message: 'Order saved locally' });
        observer.complete();
      });
    }
  }

  private saveOrderToLocalStorage(orderData: any): void {
    if (isPlatformBrowser(this.platformId)) {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push({
        ...orderData,
        date: orderData.date || new Date().toISOString()
      });
      localStorage.setItem('orders', JSON.stringify(orders));
      this.ordersSubject.next(orders);
    }
  }

  // Get all orders
  getOrders(): Order[] {
    return this.ordersSubject.value;
  }

  // Get specific order by ID
  getOrderById(orderId: string): Observable<any> {
    if (this.isLoggedIn()) {
      return this.http.get<any>(`${this.apiUrl}/${orderId}`, { headers: this.getHeaders() });
    } else {
      // Search in localStorage
      return new Observable(observer => {
        const orders = this.getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
          observer.next({ order });
        } else {
          observer.error({ message: 'Order not found' });
        }
        observer.complete();
      });
    }
  }

  // Clear all orders (for testing)
  clearOrders(): Observable<any> {
    if (this.isLoggedIn()) {
      return new Observable(observer => {
        this.http.delete<any>(this.apiUrl, { headers: this.getHeaders() })
          .subscribe({
            next: (response) => {
              this.ordersSubject.next([]);
              observer.next(response);
              observer.complete();
            },
            error: (error) => {
              console.error('Error clearing orders:', error);
              observer.error(error);
            }
          });
      });
    } else {
      return new Observable(observer => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('orders');
          this.ordersSubject.next([]);
          observer.next({ message: 'Orders cleared from localStorage' });
          observer.complete();
        }
      });
    }
  }

  // Sync localStorage orders to backend on login
  syncOrdersToBackend(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const localOrders = localStorage.getItem('orders');
    if (localOrders && this.isLoggedIn()) {
      const orders = JSON.parse(localOrders);
      
      // Send each order to backend
      orders.forEach((order: any) => {
        this.http.post<any>(`${this.apiUrl}/create`, order, { headers: this.getHeaders() })
          .subscribe({
            next: () => {
              console.log('Order synced to backend:', order.orderId);
            },
            error: (error) => {
              console.error('Error syncing order:', error);
            }
          });
      });
      
      // Clear localStorage after sync
      localStorage.removeItem('orders');
      
      // Reload from backend
      setTimeout(() => this.loadOrders(), 1000);
    }
  }
}
