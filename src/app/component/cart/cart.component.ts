import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CartService } from '../../service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  cart: any[] = [];

  constructor(
    private _cart: CartService,
    private _toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Load cart initially
    this._cart.loadCart();
    
    // Subscribe to cart updates
    this._cart.cart$.subscribe(items => {
      this.cart = items;
    });
  }

  increase(item: any) {
    this._cart.increaseQty(item.id);
    this._toastr.success("Quantity increased");
  }

  decrease(item: any) {
    this._cart.decreaseQty(item.id);
    this._toastr.warning("Removed One");
  }

  remove(item: any) {
    this._cart.removeFromCart(item.id);
    this._toastr.error("Product removed from cart");
  }

  clearAll() {
    this._cart.clearCart();
    this._toastr.info("Cart cleared");
  }

  getTotal() {
    return this._cart.getTotal();
  }
}
