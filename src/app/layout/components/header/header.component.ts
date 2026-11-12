import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BusinessService } from '../../../core/services/business.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <!-- Left side: Toggle button & Breadcrumb/Title -->
      <div class="flex items-center gap-3 sm:gap-4">
        <button
          (click)="toggleSidebar.emit()"
          class="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          title="Abrir Menu"
        >
          <i class="pi pi-bars text-lg"></i>
        </button>

        <div class="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span class="text-slate-500 font-semibold">{{ business().name || 'AgendaPro' }}</span>
          <i class="pi pi-chevron-right text-[10px] text-slate-300"></i>
          <span class="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">Painel de Controle</span>
        </div>
      </div>

      <!-- Right side: Quick Actions & Profile -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- New Appointment Action -->
        <button
          *ngIf="business().id"
          (click)="onNewAppointment()"
          class="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all active:scale-95"
        >
          <i class="pi pi-plus text-xs"></i>
          <span class="hidden sm:inline">Novo Agendamento</span>
          <span class="sm:hidden">Agendar</span>
        </button>

        <!-- Divider -->
        <div class="h-6 w-px bg-slate-200"></div>

        <!-- User Profile Pill & Logout -->
        <div class="flex items-center gap-2.5 pl-1">
          <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 ring-2 ring-indigo-100 flex items-center justify-center text-xs font-bold">
            {{ (currentUser()?.name || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="hidden md:block text-left">
            <div class="text-xs font-bold text-slate-800 leading-tight">{{ currentUser()?.name }}</div>
            <div class="text-[10px] text-slate-400 font-medium">{{ currentUser()?.role === 'ADMIN' ? 'Administrador' : 'Profissional' }}</div>
          </div>

          <!-- Logout button -->
          <button
            (click)="onLogout()"
            title="Sair do Sistema"
            class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
          >
            <i class="pi pi-sign-out text-sm"></i>
          </button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private router = inject(Router);
  private businessService = inject(BusinessService);
  private authService = inject(AuthService);

  public business = this.businessService.business;
  public currentUser = this.authService.currentUser;

  onNewAppointment(): void {
    this.router.navigate(['/admin/schedule'], { queryParams: { action: 'new' } });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
