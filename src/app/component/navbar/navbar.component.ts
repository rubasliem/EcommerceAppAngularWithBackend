import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FavoriteService } from '../../service/favorite.service';
import { count } from 'console';
import { CartService } from '../../service/cart.service';
import { ProductsService } from '../../service/products.service';
import { Category, Product } from '../../interface/iproduct';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{

    @Input() item: any;
 favCount: number = 0;
viewCount: number = 0;
cartCount: number = 0;
categories: Category[] = [];
currentUser: any = null;
isLoggedIn: boolean = false;


constructor(private _FavService: FavoriteService,
private _CartService: CartService,
  private _CategoryService:ProductsService,
  private _AuthService: AuthService,
private _Router:Router) {}

  ngOnInit(): void {
    // Subscribe to cart updates
    this._CartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    });

    // Subscribe to favorites updates
    this._FavService.favorites$.subscribe(items => {
      this.favCount = items.length;
    });

    // Update viewed count
    this.updateViewedCount();

    this._CategoryService.getCategories().subscribe({
      next: (cats) => this.categories = cats.slice(0,5),
      error: (err) => console.error(err)
    });

    // Subscribe to auth state changes
    this._AuthService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });

    // 🔔 listen for viewed products updates
    window.addEventListener("view-added", () => {
      this.updateViewedCount();
    });
  }

  updateViewedCount() {
    if (typeof window === 'undefined' || !window.localStorage) {
    this.viewCount = 0;
    return;
  }
    const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    this.viewCount = viewed.length;
  }

  goToCategory(cat: Category) {
    this._Router.navigate(['/category', cat.id]);
  }

  logout() {
    this._AuthService.logout();
    this._Router.navigate(['/home']);
  }
}
