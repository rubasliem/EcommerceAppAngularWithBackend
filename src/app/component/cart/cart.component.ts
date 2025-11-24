import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CartService } from '../../service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { loadStripe, Stripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {

  cart: any[] = [];
  stripePromise: Promise<Stripe | null>;

  constructor(
    private _cart: CartService,
    private _toastr: ToastrService
  ) {
    // تحميل Stripe
    this.stripePromise = loadStripe('pk_test_your_public_key_here');
  }

  ngOnInit(): void {
    this._cart.cart$.subscribe(items => {
      this.cart = items;
    });
  }

  // زيادة الكمية
  increase(item: any) {
    this._cart.increaseQty(item.id);
    this._toastr.success("Quantity increased");
  }

  // تقليل الكمية
  decrease(item: any) {
    this._cart.decreaseQty(item.id);
    this._toastr.warning("Removed One");
  }

  // إزالة منتج
  remove(item: any) {
    this._cart.removeFromCart(item.id);
    this._toastr.error("Product removed from cart");
  }

  // مسح جميع المنتجات
  clearAll() {
    this._cart.clearCart();
    this._toastr.info("Cart cleared");
  }

  // إجمالي السعر
  getTotal() {
    return this._cart.getTotal();
  }

  // الدفع الآن عبر Stripe
  async buyNow() {
    const stripe = await this.stripePromise;

    if (!stripe) {
      console.error('Stripe failed to load');
      return;
    }

    try {
      // استدعاء endpoint على السيرفر لإنشاء Checkout Session
      const response = await fetch('http://localhost:3000/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: this.cart })
      });

      const session = await response.json();

      // استخدام redirectToCheckout مع تجاوز TypeScript
      const { error } = await (stripe as any).redirectToCheckout({
        sessionId: session.id
      });

      if (error) {
        console.error(error.message);
        this._toastr.error(error.message);
      }
    } catch (err: any) {
      console.error(err);
      this._toastr.error("Failed to initiate checkout");
    }
  }
}
