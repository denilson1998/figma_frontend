import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  // { path: 'login', component: LoginComponent},
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'canva/:roomId', loadComponent: () => import('./components/canva/canva.component').then(m => m.CanvaComponent) },
  { path: '**', redirectTo: 'login' }             
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
