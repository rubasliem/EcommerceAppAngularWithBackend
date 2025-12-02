import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Product } from '../../interface/iproduct';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../service/products.service';
import { CartService } from '../../service/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class DetailComponent {

  product: Product | undefined;
  selectedImage: string = '';   // الصورة المعروضة
  isFav: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsService,
    private _cart: CartService,
    private _toastr: ToastrService
  ) {}


  ngOnInit(): void {
    const { id } = this.route.snapshot.params;  // أخذ الـ ID من الرابط
    console.log('id:', id);

    this.loadDetails(id);
  }

  // دالة لتحميل تفاصيل المنتج
  loadDetails(id: string) {
    this.productService.getProductById(Number(id)).subscribe({
      next: (data) => {
        this.product = data;
        this.selectedImage = data.images?.[0] || data.image || ''; // الصورة الافتراضية
        window.scrollTo({ top: 0, behavior: 'smooth' }); // تمرير الصفحة لأعلى
      },
      error: (err) => console.error(err)
    });
  }

  changeImage(img: string) {
    this.selectedImage = img;
  }

   addToCart() {
    if (!this.product) return;
    
    const added = this._cart.toggleCart(this.product);

    if (added) {
      this._toastr.success('Product added to cart 🛒');
    } else {
      this._toastr.warning('Product removed from cart ❌');
    }

    window.dispatchEvent(new Event('cart-updated'));
  }
}