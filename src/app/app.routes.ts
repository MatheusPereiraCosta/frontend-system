import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./features/schedule/schedule.component').then(m => m.ScheduleComponent)
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'professionals',
        loadComponent: () =>
          import('./features/professionals/professionals.component').then(m => m.ProfessionalsComponent)
      },
      {
        path: 'retention',
        loadComponent: () =>
          import('./features/retention/retention.component').then(m => m.RetentionComponent)
      }
    ]
  },
  {
    path: 'agendar',
    loadComponent: () =>
      import('./features/public-booking/public-booking.component').then(m => m.PublicBookingComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
