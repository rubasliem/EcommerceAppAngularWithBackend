import { Injectable } from '@angular/core';
import { Product } from '../interface/iproduct';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

   private key = 'favoriteProducts';

  constructor() { }

  private isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

  getFavorites(): any[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }

  isFavorite(id: number): boolean {
    const favs = this.getFavorites();
    return favs.some(item => item.id === id);
  }

  addToFavorites(product: any) {
    const favs = this.getFavorites();
    favs.push(product);
    localStorage.setItem(this.key, JSON.stringify(favs));
  }

  removeFromFavorites(id: number) {
    const favs = this.getFavorites().filter(item => item.id !== id);
    localStorage.setItem(this.key, JSON.stringify(favs));
  }

  toggleFavorite(product: any): boolean {
    if (this.isFavorite(product.id)) {
      this.removeFromFavorites(product.id);
      return false; // تمت الإزالة
    } else {
      this.addToFavorites(product);
      return true; // تمت الإضافة
    }
  }
  
}
