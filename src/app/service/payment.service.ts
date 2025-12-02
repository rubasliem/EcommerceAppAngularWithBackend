import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../.env/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

   stripe: any = (window as any).Stripe?.(environment.stripePublicKey);

  constructor(private http: HttpClient) {}

  createPaymentIntent(amount: number) {
    return this.http.post('http://localhost:3000/create-payment-intent', {
      amount: amount
    });
  }
}
// Stripe is expected to be loaded from Stripe.js at runtime (window.Stripe)

