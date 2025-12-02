import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../service/order.service';
import { ToastrService } from 'ngx-toastr';

interface Order {
  orderId: string;
  date: string;
  items: any[];
  total: number;
  status: string;
  subtotal?: number;
  shipping?: number;
  tax?: number;
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
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(
    private orderService: OrderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    // Load orders from backend or localStorage
    this.orderService.loadOrders();
    
    // Subscribe to orders updates
    this.orderService.orders$.subscribe(orders => {
      this.orders = orders;
    });
  }

  clearOrderHistory() {
    if (confirm('Are you sure you want to clear all order history?')) {
      this.orderService.clearOrders().subscribe({
        next: () => {
          this.orders = [];
          this.toastr.success('Order history cleared successfully');
        },
        error: (error) => {
          this.toastr.error('Failed to clear order history');
          console.error('Error clearing orders:', error);
        }
      });
    }
  }
}
