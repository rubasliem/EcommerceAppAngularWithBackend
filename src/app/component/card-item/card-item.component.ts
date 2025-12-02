import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FavoriteService } from '../../service/favorite.service';
import { CartService } from '../../service/cart.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HoverImageDirective } from '../../directive/hover-image.directive';

@Component({
  selector: 'app-card-item',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, HoverImageDirective],
  templateUrl: './card-item.component.html',
  styleUrls: ['./card-item.component.scss']
})
export class CardItemComponent {
  @Input() item: any;

  isFav: boolean = false;
  isInCart: boolean = false;

  constructor(
    private _FavService: FavoriteService,
    private _CartService: CartService,
    private _Toastr: ToastrService,
    private _Router: Router
  ) {}

  ngOnInit(): void {
    // تحقق من حالة المنتج في المفضلة والكارت عند التحميل (فقط في المتصفح)
    if (typeof window !== 'undefined') {
      this.isFav = this._FavService.getFavorites().some(p => p.id === this.item.id);
      this.isInCart = this._CartService.getCartItems().some(p => p.id === this.item.id);
    }
  }

  // تبديل حالة المفضلة
  toggleFav() {
    const added = this._FavService.toggleFavorite(this.item);
    this.isFav = added;

    if (added) {
      this._Toastr.success('Product added to favorites ❤️','success');
    } else {
      this._Toastr.warning('Product removed from favorites 💔','warning');
    }

    // تحديث Navbar أو أي Component آخر
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('favorite-updated'));
    }
  }

  // تبديل حالة الكارت
  toggleCart() {
    const added = this._CartService.toggleCart(this.item);
    this.isInCart = added;

    if (added) {
      this._Toastr.success('Product added to cart 🛒');
    } else {
      this._Toastr.warning('Product removed from cart ❌');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
  }

  // حفظ حالة المشاهدة والانتقال للصفحة
  markAsViewed(item: any) {
    // تحقق من وجود العنصر والـ ID
    if (!item || !item.id) return;
    // تحقق من وجود localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      this._Router.navigate(['/details', item.id]);
      return;
    }

    try {
      let viewed: number[] = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
      if (!viewed.includes(item.id)) {
        viewed.push(item.id);
        localStorage.setItem('viewedProducts', JSON.stringify(viewed));
      }

      window.dispatchEvent(new Event('view-added'));
      this._Router.navigate(['/details', item.id]);

    } catch (error) {
      console.error('Error saving viewed product:', error);
      this._Toastr.error('Failed to save viewed product. Please try again.');
    }
  }

  // تحقق إذا تم مشاهدة المنتج
  isViewed(id: number): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const viewed: number[] = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    return viewed.includes(id);
  } catch {
    return false;
  }
}

  // الحصول على التقييم
  getRating(): number {
    if (!this.item || !this.item.rating) return 0;
    return typeof this.item.rating === 'number' ? this.item.rating : this.item.rating.rate || 0;
  }

  // عدد النجوم الكاملة
  getFullStars(): number[] {
    const rating = this.getRating();
    return Array(Math.floor(rating)).fill(0);
  }

  // هل يوجد نصف نجمة
  hasHalfStar(): boolean {
    const rating = this.getRating();
    return rating % 1 >= 0.5;
  }

  // عدد النجوم الفارغة
  getEmptyStars(): number[] {
    const rating = this.getRating();
    const fullStars = Math.floor(rating);
    const halfStar = this.hasHalfStar() ? 1 : 0;
    return Array(5 - fullStars - halfStar).fill(0);
  }

  // عدد التقييمات
  getRatingCount(): number {
    if (!this.item || !this.item.rating) return 0;
    return typeof this.item.rating === 'object' ? this.item.rating.count || 0 : 0;
  }

}
