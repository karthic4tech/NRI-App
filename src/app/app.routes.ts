import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./nri-services/nri-services-page.component').then((m) => m.NriServicesPageComponent),
  },
  {
    path: 'services',
    loadComponent: () => import('./nri-services/nri-services-page.component').then((m) => m.NriServicesPageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register-page.component').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./auth/auth-callback-page.component').then((m) => m.AuthCallbackPageComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent),
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./tasks/tasks-page.component').then((m) => m.TasksPageComponent),
  },
  {
    path: 'tasks/new',
    canActivate: [authGuard],
    loadComponent: () => import('./tasks/create-task-page.component').then((m) => m.CreateTaskPageComponent),
  },
  {
    path: 'payment-status',
    canActivate: [authGuard],
    loadComponent: () => import('./payment-status/payment-status-page.component').then((m) => m.PaymentStatusPageComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact-us/contact-us-page.component').then((m) => m.ContactUsPageComponent),
  },
  {
    path: 'consultation',
    loadComponent: () => import('./consultation/consultation-page.component').then((m) => m.ConsultationPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
