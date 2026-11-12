import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard, establishmentGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'cadastrar',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        // Única tela do painel acessível sem estabelecimento: é onde ele é cadastrado
        path: 'establishment',
        loadComponent: () =>
          import('./features/establishment/establishment.component').then(m => m.EstablishmentComponent)
      },
      {
        path: 'dashboard',
        canActivate: [establishmentGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'schedule',
        canActivate: [establishmentGuard],
        loadComponent: () =>
          import('./features/schedule/schedule.component').then(m => m.ScheduleComponent)
      },
      {
        path: 'customers',
        canActivate: [establishmentGuard],
        loadComponent: () =>
          import('./features/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'services',
        canActivate: [establishmentGuard],
        loadComponent: () =>
          import('./features/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'professionals',
        canActivate: [establishmentGuard],
        loadComponent: () =>
          import('./features/professionals/professionals.component').then(m => m.ProfessionalsComponent)
      },
      {
        path: 'retention',
        canActivate: [establishmentGuard],
        loadComponent: () =>
          import('./features/retention/retention.component').then(m => m.RetentionComponent)
      }
    ]
  },
  {
    path: 'b/:slug',
    loadComponent: () =>
      import('./features/public-booking/public-booking.component').then(m => m.PublicBookingComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
