import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
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
    path: '**',
    redirectTo: '',
  },
];
