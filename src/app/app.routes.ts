import { Routes } from '@angular/router';

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
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent),
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks-page.component').then((m) => m.TasksPageComponent),
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./tasks/create-task-page.component').then((m) => m.CreateTaskPageComponent),
  },
  {
    path: 'payment-status',
    loadComponent: () => import('./payment-status/payment-status-page.component').then((m) => m.PaymentStatusPageComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact-us/contact-us-page.component').then((m) => m.ContactUsPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
