import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { FavoriteComponent } from './component/favorite/favorite.component';
import { LoginComponent } from './component/login/login.component';
import { SignupComponent } from './component/signup/signup.component';
import { NotfoundComponent } from './component/notfound/notfound.component';
import { DetailComponent } from './component/detail/detail.component';
import { CartComponent } from './component/cart/cart.component';
import { CardItemComponent } from './component/card-item/card-item.component';
import { CategoryComponent } from './component/category/category.component';

export const routes: Routes = [
    {path:'',redirectTo:'home',pathMatch:'full'},
    {path:'home',component:HomeComponent},
    {path:'cart',component:CartComponent},
    {path:'card',component:CardItemComponent},
    {path:'favorite',component:FavoriteComponent},
    {path:'category/:id',component:CategoryComponent},
    {path:'details/:id',component:DetailComponent},
    {path:'login',component:LoginComponent},
    {path:'signup',component:SignupComponent},
    {path:'**',component:NotfoundComponent},
];
