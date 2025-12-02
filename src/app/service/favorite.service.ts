import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from '../interface/iproduct';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = 'http://localhost:5000/api/favorites';
  private key = 'favoriteProducts';
  private favoritesSubject = new BehaviorSubject<Product[]>([]);
  favorites$ = this.favoritesSubject.asObservable();
  private isBrowserPlatform: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowserPlatform = isPlatformBrowser(platformId);
    this.loadFavorites();
    
    // Listen for login event
    if (this.isBrowserPlatform) {
      window.addEventListener('user-logged-in', () => {
        this.loadFavorites();
      });
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.isBrowserPlatform ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private isLoggedIn(): boolean {
    return this.isBrowserPlatform && !!localStorage.getItem('token');
  }

  loadFavorites() {
    if (this.isLoggedIn()) {
      this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() })
        .subscribe({
          next: (response) => {
            const items = this.mapBackendToFrontend(response.favorites);
            this.favoritesSubject.next(items);
          },
          error: () => {
            this.loadFromLocalStorage();
          }
        });
    } else {
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage() {
    if (this.isBrowserPlatform) {
      const items = JSON.parse(localStorage.getItem(this.key) || '[]');
      this.favoritesSubject.next(items);
    }
  }

  private mapBackendToFrontend(backendFavorites: any[]): Product[] {
    return backendFavorites.map(item => ({
      id: item.productId || item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      images: item.images || (item.image ? [item.image] : []),
      category: item.category,
      description: item.description || ''
    }));
  }

  getFavorites(): any[] {
    return this.favoritesSubject.value;
  }

  isFavorite(id: number): boolean {
    return this.getFavorites().some(item => item.id === id);
  }

  addToFavorites(product: any) {
    if (this.isLoggedIn()) {
      const favItem = {
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.images?.[0] || product.image || '',
        images: product.images || (product.image ? [product.image] : []),
        category: typeof product.category === 'string' ? product.category : product.category?.name || ''
      };

      this.http.post<any>(`${this.apiUrl}/add`, favItem, { headers: this.getAuthHeaders() })
        .subscribe({
          next: (response) => {
            const items = this.mapBackendToFrontend(response.favorites);
            this.favoritesSubject.next(items);
          },
          error: (error) => console.error('Error adding to favorites:', error)
        });
    } else {
      const favs = this.getFavorites();
      favs.push(product);
      this.saveFavoritesLocal(favs);
    }
  }

  removeFromFavorites(id: number) {
    if (this.isLoggedIn()) {
      this.http.delete<any>(`${this.apiUrl}/remove/${id}`, { headers: this.getAuthHeaders() })
        .subscribe({
          next: (response) => {
            const items = this.mapBackendToFrontend(response.favorites);
            this.favoritesSubject.next(items);
          },
          error: (error) => console.error('Error removing from favorites:', error)
        });
    } else {
      const favs = this.getFavorites().filter(item => item.id !== id);
      this.saveFavoritesLocal(favs);
    }
  }

  private saveFavoritesLocal(items: Product[]) {
    if (this.isBrowserPlatform) {
      localStorage.setItem(this.key, JSON.stringify(items));
    }
    this.favoritesSubject.next(items);
  }

  toggleFavorite(product: any): boolean {
    if (this.isFavorite(product.id)) {
      this.removeFromFavorites(product.id);
      return false;
    } else {
      this.addToFavorites(product);
      return true;
    }
  }
}
