import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../service/cart.service';
import { OrderService } from '../../service/order.service';
import { ToastrService } from 'ngx-toastr';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../.env/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  checkoutForm: FormGroup;
  cart: any[] = [];
  stripePromise: Promise<Stripe | null>;
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;
  isProcessing: boolean = false;
  currentStep: number = 1;
  cardMounted: boolean = false;
  
  countries: string[] = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Netherlands',
    'Belgium',
    'Switzerland',
    'Austria',
    'Sweden',
    'Norway',
    'Denmark',
    'Finland',
    'Ireland',
    'Portugal',
    'Greece',
    'Poland',
    'Czech Republic',
    'Hungary',
    'Romania',
    'Bulgaria',
    'Croatia',
    'Slovakia',
    'Slovenia',
    'Estonia',
    'Latvia',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Cyprus',
    'Iceland',
    'New Zealand',
    'Japan',
    'South Korea',
    'Singapore',
    'Hong Kong',
    'Taiwan',
    'Malaysia',
    'Thailand',
    'Indonesia',
    'Philippines',
    'Vietnam',
    'India',
    'China',
    'United Arab Emirates',
    'Saudi Arabia',
    'Qatar',
    'Kuwait',
    'Bahrain',
    'Oman',
    'Jordan',
    'Lebanon',
    'Israel',
    'Turkey',
    'Egypt',
    'South Africa',
    'Brazil',
    'Argentina',
    'Chile',
    'Colombia',
    'Peru',
    'Mexico',
    'Costa Rica',
    'Panama',
    'Uruguay',
    'Paraguay',
    'Ecuador',
    'Bolivia',
    'Venezuela',
    'Dominican Republic',
    'Puerto Rico',
    'Jamaica',
    'Trinidad and Tobago',
    'Bahamas',
    'Barbados',
    'Russia',
    'Ukraine',
    'Belarus',
    'Kazakhstan',
    'Uzbekistan',
    'Morocco',
    'Tunisia',
    'Algeria',
    'Kenya',
    'Nigeria',
    'Ghana',
    'Ethiopia',
    'Tanzania',
    'Uganda',
    'Zimbabwe',
    'Zambia',
    'Botswana',
    'Namibia',
    'Mozambique',
    'Rwanda',
    'Senegal',
    'Ivory Coast',
    'Cameroon',
    'Angola',
    'Pakistan',
    'Bangladesh',
    'Sri Lanka',
    'Nepal',
    'Afghanistan',
    'Myanmar',
    'Cambodia',
    'Laos',
    'Mongolia',
    'Brunei',
    'Maldives',
    'Mauritius',
    'Seychelles',
    'Fiji',
    'Papua New Guinea',
    'New Caledonia',
    'French Polynesia',
    'Samoa',
    'Tonga',
    'Vanuatu',
    'Solomon Islands',
    'Guam',
    'Northern Mariana Islands',
    'American Samoa',
    'Marshall Islands',
    'Micronesia',
    'Palau'
  ];

  constructor(
    private fb: FormBuilder,
    private _cart: CartService,
    private orderService: OrderService,
    private _toastr: ToastrService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.stripePromise = loadStripe(environment.stripePublicKey);
    
    this.checkoutForm = this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      
      // Shipping Address
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      country: ['United States', [Validators.required]],
      
      // Additional Options
      saveInfo: [false],
      newsletter: [false],
      termsAccepted: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    console.log('Checkout component initialized');
    
    this._cart.cart$.subscribe(items => {
      this.cart = items;
      console.log('Cart items:', this.cart);
      
      if (this.cart.length === 0) {
        this._toastr.warning('Your cart is empty', 'Redirecting...');
        setTimeout(() => this.router.navigate(['/cart']), 2000);
      }
    });

    // Load saved info if exists
    const savedInfo = localStorage.getItem('checkoutInfo');
    if (savedInfo) {
      const info = JSON.parse(savedInfo);
      this.checkoutForm.patchValue(info);
    }
    
    // Pre-load Stripe
    console.log('Pre-loading Stripe...');
    this.stripePromise.then(stripe => {
      this.stripe = stripe;
      if (stripe) {
        console.log('Stripe loaded successfully');
        this.elements = stripe.elements();
        console.log('Stripe Elements created');
      } else {
        console.error('Stripe failed to load');
      }
    }).catch(err => {
      console.error('Error loading Stripe:', err);
    });
  }

  ngAfterViewInit() {
    console.log('AfterViewInit called');
  }

  async mountCardElement() {
    console.log('=== mountCardElement called ===');
    
    if (typeof window === 'undefined') {
      console.log('Window undefined (SSR)');
      return;
    }
    
    // Unmount previous card if exists
    if (this.card) {
      try {
        console.log('Unmounting previous card...');
        this.card.unmount();
        this.card.destroy();
        this.card = null;
        this.cardMounted = false;
      } catch (e) {
        console.log('Card unmount error:', e);
      }
    }
    
    // Wait for DOM to be ready
    await this.ngZone.run(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    const cardElement = document.getElementById('card-element');
    console.log('Card element found:', !!cardElement);
    
    if (!cardElement) {
      console.error('❌ Card element NOT found in DOM!');
      this._toastr.error('Payment form not ready');
      return;
    }
    
    try {
      // Make sure stripe and elements are ready
      if (!this.stripe || !this.elements) {
        console.log('Loading Stripe and Elements...');
        this.stripe = await this.stripePromise;
        if (this.stripe) {
          this.elements = this.stripe.elements();
        }
      }
      
      if (!this.stripe || !this.elements) {
        console.error('❌ Stripe or Elements not available');
        this._toastr.error('Payment system not ready');
        return;
      }
      
      console.log('Creating card element...');
      this.card = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        },
        hidePostalCode: true
      });
      
      console.log('Mounting card to #card-element...');
      this.card.mount('#card-element');
      this.cardMounted = true;
      console.log('✅ Card mounted successfully!');
      
      // Listen for ready event
      this.card.on('ready', () => {
        console.log('✅✅✅ CARD IS READY FOR INPUT! ✅✅✅');
        this._toastr.success('You can now enter card details', '', { timeOut: 2000 });
      });
      
      // Listen for changes
      this.card.on('change', (event: any) => {
        console.log('Card change:', event);
        if (event.error) {
          this._toastr.error(event.error.message, 'Card Error');
        }
      });
      
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('❌ Error:', error);
      this._toastr.error('Failed to load payment form');
      this.cardMounted = false;
    }
  }

  get f() {
    return this.checkoutForm.controls;
  }

  getTotal() {
    return this._cart.getTotal();
  }

  getShipping() {
    return this.getTotal() > 100 ? 0 : 10;
  }

  getTax() {
    return this.getTotal() * 0.08; // 8% tax
  }

  getFinalTotal() {
    return this.getTotal() + this.getShipping() + this.getTax();
  }

  nextStep() {
    if (this.currentStep === 1) {
      // Validate personal info
      const personalFields = ['firstName', 'lastName', 'email', 'phone'];
      const isValid = personalFields.every(field => this.checkoutForm.get(field)?.valid);
      
      if (!isValid) {
        this._toastr.error('Please fill in all personal information correctly');
        return;
      }
      console.log('Moving to step 2');
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      // Validate shipping info
      const shippingFields = ['address', 'city', 'state', 'zipCode', 'country'];
      const isValid = shippingFields.every(field => this.checkoutForm.get(field)?.valid);
      
      if (!isValid) {
        this._toastr.error('Please fill in all shipping information correctly');
        return;
      }
      console.log('Moving to step 3 - mounting card element');
      this.currentStep = 3;
      
      // Mount card element when reaching payment step
      setTimeout(() => {
        console.log('Attempting to mount card element...');
        this.mountCardElement();
      }, 200);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  async processPayment() {
    if (!this.checkoutForm.valid) {
      this._toastr.error('Please fill in all required fields');
      return;
    }

    if (this.isProcessing) return;

    const stripe = await this.stripePromise;
    if (!stripe || !this.card) {
      this._toastr.error('Payment system not ready');
      return;
    }

    this.isProcessing = true;
    this._toastr.info('Processing your payment...', 'Please wait');

    try {
      const totalAmount = Math.round(this.getFinalTotal() * 100);

      // Save checkout info if requested
      if (this.checkoutForm.value.saveInfo) {
        const infoToSave = { ...this.checkoutForm.value };
        delete infoToSave.termsAccepted;
        localStorage.setItem('checkoutInfo', JSON.stringify(infoToSave));
      }

      // Create payment intent
      const res: any = await firstValueFrom(
        this.http.post('http://localhost:5000/create-payment-intent', { amount: totalAmount })
      );
      const clientSecret = res.clientSecret;

      // Confirm payment with billing details
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: `${this.checkoutForm.value.firstName} ${this.checkoutForm.value.lastName}`,
            email: this.checkoutForm.value.email,
            phone: this.checkoutForm.value.phone,
            address: {
              line1: this.checkoutForm.value.address,
              city: this.checkoutForm.value.city,
              state: this.checkoutForm.value.state,
              postal_code: this.checkoutForm.value.zipCode,
              country: 'US'
            }
          }
        }
      });

      if (result.error) {
        this._toastr.error(result.error.message || 'Payment failed', 'Error');
        console.error('Payment error:', result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Save order using OrderService
        const orderData = {
          orderId: result.paymentIntent.id,
          items: [...this.cart],
          subtotal: this.getTotal(),
          shipping: this.getShipping(),
          tax: this.getTax(),
          total: this.getFinalTotal(),
          status: 'completed',
          shippingInfo: {
            name: `${this.checkoutForm.value.firstName} ${this.checkoutForm.value.lastName}`,
            email: this.checkoutForm.value.email,
            phone: this.checkoutForm.value.phone,
            address: this.checkoutForm.value.address,
            city: this.checkoutForm.value.city,
            state: this.checkoutForm.value.state,
            zipCode: this.checkoutForm.value.zipCode,
            country: this.checkoutForm.value.country
          },
          paymentIntentId: result.paymentIntent.id
        };

        // Save order to backend or localStorage
        this.orderService.createOrder(orderData).subscribe({
          next: (response) => {
            console.log('Order created successfully:', response);
            
            // Clear cart
            this._cart.clearCart();

            // Show success message
            this._toastr.success(
              `Order ID: ${result.paymentIntent.id.substring(0, 20)}...\nTotal: $${this.getFinalTotal().toFixed(2)}`,
              '🎉 Payment Successful!',
              {
                timeOut: 5000,
                positionClass: 'toast-top-center',
                closeButton: true,
                progressBar: true,
              }
            );

            // Navigate to orders page
            setTimeout(() => {
              this.router.navigate(['/orders']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error saving order:', error);
            this._toastr.warning('Payment successful but order save failed');
          }
        });
      }
    } catch (error: any) {
      this._toastr.error('An error occurred during payment', 'Error');
      console.error('Payment error:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
