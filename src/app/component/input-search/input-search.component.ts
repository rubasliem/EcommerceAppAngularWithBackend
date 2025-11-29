import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SearchPipe } from '../../pipe/search.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-search',
  standalone: true,
  imports: [CommonModule,FormsModule,SearchPipe],
  templateUrl: './input-search.component.html',
  styleUrl: './input-search.component.scss'
})
export class InputSearchComponent {
  term:any = '' 
}
