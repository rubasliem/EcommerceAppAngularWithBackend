import { Component, OnInit } from '@angular/core';
import { CardItemComponent } from '../card-item/card-item.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IProduct } from '../../interface/iproduct';
import { ProductsService } from '../../service/products.service';
import { Observable } from 'rxjs';
import { error } from 'console';
import { HttpClientModule } from '@angular/common/http';
import { CategoriesComponent } from '../categories/categories.component';
import { IProduct1 } from '../../interface/iproduct1';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardItemComponent,FormsModule,HttpClientModule,CategoriesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  categories = [
  { icon: '/assets/dress.svg', name: 'Dress & frock', count: 53 },
  { icon: '/assets/coat.svg', name: 'Winter wear', count: 58 },
  { icon: '/assets/glasses.svg', name: 'Glasses & lens', count: 68 },
  { icon: '/assets/shorts.svg', name: 'Shorts & jeans', count: 84 },
  { icon: '/assets/tee.svg', name: 'T-shirts', count: 35 },
  { icon: '/assets/jacket.svg', name: 'Jacket', count: 16 },
  { icon: '/assets/watch.svg', name: 'Watch', count: 27 },
  { icon: '/assets/hat.svg', name: 'Hat & caps', count: 39 },
];

    protects:IProduct[]=[]
    protects1:IProduct1[]=[]

    constructor(private _ProductsService :ProductsService){}
  ngOnInit():any {
     this._ProductsService.getProducts1().subscribe({
      next:(data:any)=> {this.protects1= data;
         console.log(data)
      },
      error:(err:any)=>{console.log('Error fetching trending movies:', err);},
      complete: () => {console.log('Successfully fetched trending movies');},


    })

    this._ProductsService.getProducts().subscribe({
      next:(data:any)=> {this.protects= data.products.slice(0,4);
        console.log(data)
      },
      error:(err:any)=>{console.log('Error fetching trending movies:', err);},
      complete: () => {console.log('Successfully fetched trending movies');},


    })

   
  }

}
