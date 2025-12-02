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
import { PaymentComponent } from './component/payment/payment.component';
import { OrdersComponent } from './component/orders/orders.component';
import { CheckoutComponent } from './component/checkout/checkout.component';
import { ProfileComponent } from './component/profile/profile.component';
import { authGuard } from './garde/auth.guard';

export const routes: Routes = [
    {path:'',redirectTo:'home',pathMatch:'full'},
    {path:'home',component:HomeComponent},
    {path:'cart',component:CartComponent},
    {path:'checkout',component:CheckoutComponent},
    {path:'card',component:CardItemComponent},
    {path:'favorite',component:FavoriteComponent},
    {path:'payment',component:PaymentComponent},
    {path:'orders',component:OrdersComponent},
    {path:'profile',component:ProfileComponent, canActivate: [authGuard]},
    {path:'category/:id',component:CategoryComponent},
    {path:'details/:id',component:DetailComponent},
    {path:'login',component:LoginComponent},
    {path:'signup',component:SignupComponent},
    {path:'**',component:NotfoundComponent},
];
