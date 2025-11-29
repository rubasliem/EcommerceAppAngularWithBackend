import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {
  transform(product: any[], term: string): any[] {
    if (!term) return product; // لو مفيش بحث رجّع الكل
    return product.filter(prod =>
      prod.title?.toLowerCase().includes(term.toLowerCase())
    );
  }

}
