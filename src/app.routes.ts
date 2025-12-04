
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { VirtualTryOnComponent } from './components/virtual-try-on/virtual-try-on.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { AdminComponent } from './components/admin/admin.component';
import { OrderTrackingComponent } from './components/order-tracking/order-tracking.component';
import { SoulboundJewelsComponent } from './components/soulbound-jewels/soulbound-jewels.component';
import { DesignStudioComponent } from './components/design-studio/design-studio.component';
import { AppointmentComponent } from './components/appointment/appointment.component';
import { MarketWatchComponent } from './components/market-watch/market-watch.component';
import { ClientLedgerComponent } from './components/client-ledger/client-ledger.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent, title: 'Madni Jewellers - AI Hub' },
  { path: 'products', component: ProductsComponent, title: 'Madni Jewellers - Collections' },
  { path: 'products/:id', component: ProductDetailComponent, title: 'Madni Jewellers - Product Details' },
  { path: 'virtual-try-on', component: VirtualTryOnComponent, title: 'Madni Jewellers - Virtual Try-On' },
  { path: 'design-studio', component: DesignStudioComponent, title: 'Madni Jewellers - Design Studio' },
  { path: 'soulbound-jewels', component: SoulboundJewelsComponent, title: 'Madni Jewellers - AI Soulbound Jewels' },
  { path: 'market-watch', component: MarketWatchComponent, title: 'Madni Jewellers - Stellar Market Watch' },
  { path: 'client-ledger', component: ClientLedgerComponent, title: 'Madni Jewellers - Client Ledger' },
  { path: 'order-tracking', component: OrderTrackingComponent, title: 'Madni Jewellers - Track Your Order' },
  { path: 'admin', component: AdminComponent, title: 'Madni Jewellers - Admin Panel' },
  { path: 'appointment', component: AppointmentComponent, title: 'Madni Jewellers - Schedule Appointment' },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
