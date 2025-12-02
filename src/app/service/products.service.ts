import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category, Product } from '../interface/iproduct';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  
  private apiUrl = 'https://api.escuelajs.co/api/v1/products';
  private apiUrlCat = 'https://api.escuelajs.co/api/v1/categories';

  constructor(private http: HttpClient) {}

  // جلب جميع المنتجات
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // جلب منتج واحد بناءً على id
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrlCat);
  }

  getCategoryProducts(categoryId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlCat}/${categoryId}/products`);
  }
}