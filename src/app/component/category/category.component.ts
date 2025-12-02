import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../service/products.service';
import { CommonModule } from '@angular/common';
import { CardItemComponent } from "../card-item/card-item.component";
import { SearchPipe } from '../../pipe/search.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, CardItemComponent, SearchPipe],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {
   products: any[] = [];
    term: string = '';

  constructor(private route: ActivatedRoute, private categoryService: ProductsService) {}

  ngOnInit(): void {
     this.route.params.subscribe(params => {
      const catId = +params['id'];
      this.categoryService.getCategoryProducts(catId).subscribe({
        next: (prods) => this.products = prods,
        error: (err) => console.error(err)
      });
    });
  }

}
