import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BusinessService } from '../../../core/services/business.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { CustomerService } from '../../../core/services/customer.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: () => number | string | null;
  badgeClass?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      class="fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800"
      [class.-translate-x-full]="!isOpen"
    >
      <!-- Brand Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-primary-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <i class="pi pi-calendar-clock text-lg"></i>
          </div>
          <div>
            <h1 class="text-base font-bold text-white tracking-tight leading-none">AgendaPro</h1>
            <p class="text-[11px] text-slate-400 font-medium truncate max-w-[140px] mt-1">{{ business().name }}</p>
          </div>
        </div>

        <!-- Close button for mobile -->
        <button
          (click)="closeSidebar.emit()"
          class="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Gestão Principal
        </div>

        <a
          *ngFor="let item of primaryNavItems"
          [routerLink]="item.route"
          routerLinkActive="bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30"
          [routerLinkActiveOptions]="{ exact: item.route === '/admin/dashboard' }"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
        >
          <div class="flex items-center gap-3">
            <i [class]="'pi ' + item.icon + ' text-slate-400 group-hover:text-white transition-colors'"></i>
            <span>{{ item.label }}</span>
          </div>

          <span
            *ngIf="item.badge && item.badge()"
            [ngClass]="item.badgeClass || 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'"
            class="text-xs px-2 py-0.5 rounded-full font-bold"
          >
            {{ item.badge() }}
          </span>
        </a>

        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 pt-6 mb-2">
          Cadastros & Configuração
        </div>

        <a
          *ngFor="let item of secondaryNavItems"
          [routerLink]="item.route"
          routerLinkActive="bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30"
          (click)="onLinkClick()"
          class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
        >
          <div class="flex items-center gap-3">
            <i [class]="'pi ' + item.icon + ' text-slate-400 group-hover:text-white transition-colors'"></i>
            <span>{{ item.label }}</span>
          </div>

          <span
            *ngIf="item.badge && item.badge()"
            [ngClass]="item.badgeClass || 'bg-amber-500/20 text-amber-300 border border-amber-500/30'"
            class="text-xs px-2 py-0.5 rounded-full font-bold"
          >
            {{ item.badge() }}
          </span>
        </a>
      </div>

      <!-- Public Booking Link -->
      <div *ngIf="business().slug" class="p-4 border-t border-slate-800 bg-slate-950/30">
        <a
          [routerLink]="['/b', business().slug]"
          target="_blank"
          class="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-900/30 transition-all text-center"
        >
          <i class="pi pi-external-link text-xs"></i>
          <span>Ver Página Pública</span>
        </a>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = true;
  @Output() closeSidebar = new EventEmitter<void>();

  private businessService = inject(BusinessService);
  private appointmentService = inject(AppointmentService);
  private customerService = inject(CustomerService);

  public business = this.businessService.business;

  public primaryNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi-chart-bar',
      route: '/admin/dashboard'
    },
    {
      label: 'Agenda',
      icon: 'pi-calendar',
      route: '/admin/schedule',
      badge: () => {
        const todayCount = this.appointmentService.todayAppointments().length;
        return todayCount > 0 ? todayCount : null;
      },
      badgeClass: 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30'
    },
    {
      label: 'Clientes',
      icon: 'pi-users',
      route: '/admin/customers'
    },
    {
      label: 'Retenção & Reativação',
      icon: 'pi-bolt',
      route: '/admin/retention',
      badge: () => {
        const inactiveCount = this.customerService.inactiveCustomers().length;
        return inactiveCount > 0 ? inactiveCount : null;
      },
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    }
  ];

  public secondaryNavItems: NavItem[] = [
    {
      label: 'Meu Estabelecimento',
      icon: 'pi-building',
      route: '/admin/establishment'
    },
    {
      label: 'Serviços & Preços',
      icon: 'pi-tag',
      route: '/admin/services'
    },
    {
      label: 'Profissionais & Horários',
      icon: 'pi-id-card',
      route: '/admin/professionals'
    }
  ];

  onLinkClick(): void {
    if (window.innerWidth < 1024) {
      this.closeSidebar.emit();
    }
  }
}
