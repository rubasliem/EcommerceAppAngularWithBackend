import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from '../interface/iproduct';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:5000/api/cart';
  private key = 'cartItems';
  private cartSubject = new BehaviorSubject<Product[]>([]);
  cart$ = this.cartSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadCart();
    
    // Listen for login event
    if (this.isBrowser) {
      window.addEventListener('user-logged-in', () => {
        this.loadCart();
      });
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.isBrowser ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private isLoggedIn(): boolean {
    return this.isBrowser && !!localStorage.getItem('token');
  }

  loadCart() {
    if (this.isLoggedIn()) {
      this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() })
        .subscribe({
          next: (response) => {
            const items = this.mapBackendToFrontend(response.cart);
            this.cartSubject.next(items);
          },
          error: () => {
            this.loadFromLocalStorage();
          }
        });
    } else {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    if (this.isBrowser) {
      const items = JSON.parse(localStorage.getItem(this.key) || '[]');
      this.cartSubject.next(items);
    }
  }

  private mapBackendToFrontend(backendCart: any[]): Product[] {
    return backendCart.map(item => ({
      id: item.productId || item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      images: item.images || (item.image ? [item.image] : []),
      category: item.category,
      quantity: item.quantity || 1,
      description: item.description || ''
    }));
  }

  getCartItems(): Product[] {
    return this.cartSubject.value;
  }

  toggleCart(item: Product): boolean {
    if (this.isLoggedIn()) {
      const exists = this.getCartItems().some(p => p.id === item.id);
      if (exists) {
        this.removeFromCart(item.id);
        return false;
      } else {
        this.addToCart(item);
        return true;
      }
    } else {
      return this.toggleCartLocal(item);
    }
  }

  private toggleCartLocal(item: Product): boolean {
    let cart = this.getCartItems();
    const index = cart.findIndex(p => p.id === item.id);

    if (index > -1) {
      cart.splice(index, 1);
      this.saveCartLocal(cart);
      return false;
    } else {
      cart.push({ ...item, quantity: 1 });
      this.saveCartLocal(cart);
      return true;
    }
  }

  private saveCartLocal(items: Product[]) {
    if (this.isBrowser) {
      localStorage.setItem(this.key, JSON.stringify(items));
    }
    this.cartSubject.next(items);
  }

  addToCart(item: Product) {
    if (this.isLoggedIn()) {
      const cartItem = {
        productId: item.id,
        title: item.title,
        price: item.price,
        image: item.images?.[0] || item.image || '',
        images: item.images || (item.image ? [item.image] : []),
        category: typeof item.category === 'string' ? item.category : item.category?.name || '',
        quantity: 1
      };

      this.http.post<any>(`${this.apiUrl}/add`, cartItem, { headers: this.getAuthHeaders() })
        .subscribe({
          next: (response) => {
            const items = this.mapBackendToFrontend(response.cart);
            this.cartSubject.next(items);
          },
          error: (error) => console.error('Error adding to cart:', error)
        });
    } else {
      this.toggleCartLocal(item);
    }
  }

  increaseQty(id: number) {
    if (this.isLoggedIn()) {
      const item = this.getCartItems().find(p => p.id === id);
      if (item) {
        const newQty = (item.quantity || 1) + 1;
        this.http.put<any>(`${this.apiUrl}/update/${id}`, { quantity: newQty }, { headers: this.getAuthHeaders() })
          .subscribe({
            next: (response) => {
              const items = this.mapBackendToFrontend(response.cart);
              this.cartSubject.next(items);
            },
            error: (error) => console.error('Error updating cart:', error)
          });
      }
    } else {
      let cart = this.getCartItems();
      cart = cart.map(item =>
        item.id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      );
      this.saveCartLocal(cart);
    }
  }

  decreaseQty(id: number) {
    if (this.isLoggedIn()) {
      const item = this.getCartItems().find(p => p.id === id);
      if (item) {
        const newQty = (item.quantity || 1) - 1;
        if (newQty > 0) {
          this.http.put<any>(`${this.apiUrl}/update/${id}`, { quantity: newQty }, { headers: this.getAuthHeaders() })
            .subscribe({
              next: (response) => {
                const items = this.mapBackendToFrontend(response.cart);
                this.cartSubject.next(items);
              },
              error: (error) => console.error('Error updating cart:', error)
            });
        } else {
          this.removeFromCart(id);
        }
      }
    } else {
      let cart = this.getCartItems();
      cart = cart
        .map(item =>
          item.id === id ? { ...item, quantity: (item.quantity || 1) - 1 } : item
        )
        .filter(item => (item.quantity || 0) > 0);
      this.saveCartLocal(cart);
    }
  }

  removeFromCart(id: number) {
    if (this.isLoggedIn()) {
      this.http.delete<any>(`${this.apiUrl}/remove/${id}`, { headers: this.getAuthHeaders() })
        .subscribe({
          next: (response) => {
            const items = this.mapBackendToFrontend(response.cart);
            this.cartSubject.next(items);
          },
          error: (error) => console.error('Error removing from cart:', error)
        });
    } else {
      let cart = this.getCartItems().filter(p => p.id !== id);
      this.saveCartLocal(cart);
    }
  }

  clearCart() {
    if (this.isLoggedIn()) {
      this.http.delete<any>(`${this.apiUrl}/clear`, { headers: this.getAuthHeaders() })
        .subscribe({
          next: () => {
            this.cartSubject.next([]);
          },
          error: (error) => console.error('Error clearing cart:', error)
        });
    } else {
      this.saveCartLocal([]);
    }
  }

  getTotal(): number {
    return this.getCartItems().reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
  }

  getTotalCount(): number {
    return this.getCartItems().reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );
  }
}