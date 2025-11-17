import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IProduct } from '../../interface/iproduct';
import { IProduct1 } from '../../interface/iproduct1';

@Component({
  selector: 'app-card-item',
  standalone: true,
  imports: [CurrencyPipe,CommonModule],
  templateUrl: './card-item.component.html',
  styleUrl: './card-item.component.scss'
})
export class CardItemComponent {
    @Input() item:any

getStars(rate: number | undefined): number[] {
  if (!rate) return [];             // إذا كان undefined أو 0
  const fullStars = Math.floor(rate); // تقطيع العدد لأرضى عدد صحيح
  return Array(fullStars).fill(0);    // مصفوفة عددها fullStars
}


getRatingRate(item: any): number {
  if (!item.rating) return 0;
  if (typeof item.rating === 'number') return item.rating;
  return item.rating.rate || 0;
}


}
