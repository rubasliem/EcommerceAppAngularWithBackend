import { Component, Input } from '@angular/core';
import { Product } from '../../interface/iproduct';
import { FavoriteService } from '../../service/favorite.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [CommonModule,CurrencyPipe],
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss'
})
export class FavoriteComponent  {
  @Input() item:any ;
   favorites: Product[] = [];

  constructor(private _FavoriteService: FavoriteService,private _Toastr:ToastrService) {}

  ngOnInit(): void {
    this.favorites = this._FavoriteService.getFavorites();
  }

  remove(id: number) {
  this._FavoriteService.removeFromFavorites(id);
  this.favorites = this._FavoriteService.getFavorites();
  this._Toastr.info('Removed from favorites 💔');
  }
}
