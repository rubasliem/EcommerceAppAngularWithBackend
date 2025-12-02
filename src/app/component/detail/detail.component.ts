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
  selectedImageIndex: number = 0;  // رقم الصورة المختارة
  isFav: boolean = false;
  displayImages: string[] = [];  // الصور الثلاث للعرض

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
        const mainImage = data.images?.[0] || data.image || '';
        
        // إنشاء الصور الثلاث
        this.createImageVariants(mainImage);
        
        window.scrollTo({ top: 0, behavior: 'smooth' }); // تمرير الصفحة لأعلى
      },
      error: (err) => console.error(err)
    });
  }

  // دالة لإنشاء 3 صور: الأصلية، النصف الأيمن، النصف الأيسر
  createImageVariants(imageUrl: string) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      const width = img.width;
      const height = img.height;
      const halfWidth = width / 2;

      // الصورة الأولى: الصورة الكاملة الأصلية
      this.displayImages[0] = imageUrl;

      // الصورة الثانية: النصف الأيمن
      canvas.width = halfWidth;
      canvas.height = height;
      ctx.drawImage(img, halfWidth, 0, halfWidth, height, 0, 0, halfWidth, height);
      this.displayImages[1] = canvas.toDataURL();

      // الصورة الثالثة: النصف الأيسر
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, halfWidth, height, 0, 0, halfWidth, height);
      this.displayImages[2] = canvas.toDataURL();

      // تعيين الصورة المختارة الافتراضية
      this.selectedImage = this.displayImages[0];
      this.selectedImageIndex = 0;
    };
    
    img.onerror = () => {
      // في حالة فشل التحميل، استخدم الصورة الأصلية للجميع
      this.displayImages = [imageUrl, imageUrl, imageUrl];
      this.selectedImage = imageUrl;
      this.selectedImageIndex = 0;
    };
    
    img.src = imageUrl;
  }

  changeImage(index: number) {
    this.selectedImage = this.displayImages[index];
    this.selectedImageIndex = index;
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