import { Component } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {

  
  cart: any[] = [];

  constructor(
    private _cart: CartService,
    private _toastr: ToastrService
  ) {}

  ngOnInit(): void {
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
    this._toastr.warning("Quantity decreased");
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

