import { Injectable } from '@angular/core';
import { Product } from '../interface/iproduct';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor() { }
  private key = 'cartItems';
  private cartSubject = new BehaviorSubject<Product[]>(this.getCartItems());
  cart$ = this.cartSubject.asObservable();

  getCartItems(): Product[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }

  saveCart(items: Product[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.key, JSON.stringify(items));
    this.cartSubject.next(items);
  }

  toggleCart(item: Product): boolean {
    let cart = this.getCartItems();
    const index = cart.findIndex(p => p.id === item.id);

    if (index > -1) {
      cart.splice(index, 1);
      this.saveCart(cart);
      return false;
    } else {
      cart.push({ ...item, quantity: 1 });
      this.saveCart(cart);
      return true;
    }
  }

  increaseQty(id: number) {
    let cart = this.getCartItems();
    cart = cart.map(item =>
      item.id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    );
    this.saveCart(cart);
  }

  decreaseQty(id: number) {
    let cart = this.getCartItems();
    cart = cart
      .map(item =>
        item.id === id ? { ...item, quantity: (item.quantity || 1) - 1 } : item
      )
      .filter(item => item.quantity > 0);
    this.saveCart(cart);
  }

  removeFromCart(id: number) {
    let cart = this.getCartItems().filter(p => p.id !== id);
    this.saveCart(cart);
  }

  clearCart() {
    this.saveCart([]);
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