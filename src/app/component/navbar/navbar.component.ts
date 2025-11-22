import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FavoriteService } from '../../service/favorite.service';
import { count } from 'console';
import { CartService } from '../../service/cart.service';
import { ProductsService } from '../../service/products.service';
import { Category, Product } from '../../interface/iproduct';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

    @Input() item: any;
 favCount: number = 0;
viewCount: number = 0;
cartCount: number = 0;
categories: Category[] = [];


constructor(private _FavService: FavoriteService,
  private _CartService :CartService,
  private _CategoryService:ProductsService,
private _Router:Router) {}

  ngOnInit(): void {
    // initial load
    this.updateFavoritesCount();
    this.updateViewedCount();
    this.updateCartCount();

     this._CategoryService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => console.error(err)
    });

    // 🔔 listen for favorite updates
    window.addEventListener("favorite-updated", () => {
      this.updateFavoritesCount();
    });

    // 🔔 listen for viewed products updates
    window.addEventListener("view-added", () => {
      this.updateViewedCount();
    });

    // استماع لتحديثات الكارت
    window.addEventListener("cart-updated", () => {
      this.updateCartCount();
    });
  }

  updateFavoritesCount() {
    this.favCount = this._FavService.getFavorites().length;
  }

  updateViewedCount() {
    const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    this.viewCount = viewed.length;
  }

  updateCartCount() {
  this.cartCount = this._CartService.getTotalCount();
}

goToCategory(cat: Category) {
    this._Router.navigate(['/category', cat.id]);
  }


}
