import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../interface/iproduct';
import { IProduct1 } from '../interface/iproduct1';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private _HttpClient:HttpClient) { }

  getProducts():Observable<IProduct[]>{
    return this._HttpClient.get<IProduct[]>('https://dummyjson.com/products')
  }

    getProducts1():Observable<IProduct1[]>{
    return this._HttpClient.get<IProduct1[]>('https://fakestoreapi.com/products')
  }
}
