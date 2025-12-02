import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category, Product } from '../interface/iproduct';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  
  private apiUrl = 'https://fakestoreapi.com/products';
  private apiUrlCat = 'https://fakestoreapi.com/products/categories';

  constructor(private http: HttpClient) {}

  // جلب جميع المنتجات
  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(products => products.map(p => this.mapFakeStoreProduct(p)))
    );
  }

  // جلب منتج واحد بناءً على id
  getProductById(id: number): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(p => this.mapFakeStoreProduct(p))
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<string[]>(this.apiUrlCat).pipe(
      map(categories => categories.map((name, index) => ({
        id: index + 1,
        name: name,
        image: `https://via.placeholder.com/300x200?text=${name}`
      })))
    );
  }

  getCategoryProducts(categoryId: number | string): Observable<any[]> {
    const categoryName = this.getCategoryName(categoryId);
    return this.http.get<any[]>(`${this.apiUrl}/category/${categoryName}`).pipe(
      map(products => products.map(p => this.mapFakeStoreProduct(p)))
    );
  }

  private mapFakeStoreProduct(product: any): Product {
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
      images: [product.image, product.image, product.image], // FakeStore has single image
      rating: product.rating ? {
        rate: product.rating.rate || 0,
        count: product.rating.count || 0
      } : { rate: 0, count: 0 }
    };
  }

  private getCategoryName(categoryId: number | string): string {
    const categoryMap: { [key: number]: string } = {
      1: 'electronics',
      2: 'jewelery',
      3: "men's clothing",
      4: "women's clothing"
    };
    return categoryMap[Number(categoryId)] || 'electronics';
  }
}