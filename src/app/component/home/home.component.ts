import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../interface/iproduct';
import { ProductsService } from '../../service/products.service';
import { HttpClientModule } from '@angular/common/http';
import { CategoriesComponent } from '../categories/categories.component';
import { CardItemComponent } from '../card-item/card-item.component';
import { ToastrService } from 'ngx-toastr';

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
  { icon: '/assets/menClothes.png', name: 'Men clothes', count: 69 },
  { icon: '/assets/coat.svg', name: 'Winter wear', count: 58 },
  { icon: '/assets/glasses.svg', name: 'Glasses & lens', count: 68 },
  { icon: '/assets/shorts.svg', name: 'Shorts & jeans', count: 84 },
  { icon: '/assets/tee.svg', name: 'T-shirts', count: 35 },
  { icon: '/assets/jacket.svg', name: 'Jacket', count: 16 },
  { icon: '/assets/watch.svg', name: 'Watch', count: 27 },
  { icon: '/assets/hat.svg', name: 'Hat', count: 39 },
  { icon: '/assets/cap.png', name: 'Caps', count: 89},
  { icon: '/assets/bicycle.png', name: 'Bicycle', count: 19 },
  { icon: '/assets/Electronic.png', name: 'Electronics', count: 51 },
  { icon: '/assets/table.png', name: 'Tables', count: 56 },
  { icon: '/assets/sofa.png', name: 'Sofa', count: 39 },
  { icon: '/assets/chair.png', name: 'Chair', count: 50 },
  { icon: '/assets/femaleShoe.png', name: 'Women Shoes', count: 22 },
  { icon: '/assets/manShoes.png', name: 'Men shoes', count: 39 },
  { icon: '/assets/menShoes.png', name: 'shoes', count: 19 },





];

    protects:Product[]=[]

    constructor(private _ProductsService :ProductsService,private _Toastr: ToastrService){}
  ngOnInit():any {

    this._ProductsService.getProducts().subscribe({
      next:(data:any)=> {this.protects = data ?? [] ;

        console.log(data)
      },
      error:(err:any)=>{console.log('Error fetching Products :', err);},
      complete: () => {console.log('Successfully fetched Products');},

    })
  
  }

}
