import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentStatus } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="badgeClass" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide">
      <span [ngClass]="dotClass" class="w-1.5 h-1.5 rounded-full animate-pulse"></span>
      {{ label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status: AppointmentStatus | 'VIP' | 'REGULAR' | 'INACTIVE' | 'ACTIVE' = 'CONFIRMED';

  get label(): string {
    switch (this.status) {
      case 'CONFIRMED': return 'Confirmado';
      case 'PENDING': return 'Pendente';
      case 'IN_PROGRESS': return 'Em Atendimento';
      case 'COMPLETED': return 'Concluído';
      case 'CANCELLED': return 'Cancelado';
      case 'VIP': return 'Cliente VIP';
      case 'REGULAR': return 'Recorrente';
      case 'INACTIVE': return 'Inativo';
      case 'ACTIVE': return 'Ativo';
      default: return this.status;
    }
  }

  get badgeClass(): string {
    switch (this.status) {
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'IN_PROGRESS':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'VIP':
        return 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
      case 'REGULAR':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'INACTIVE':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  get dotClass(): string {
    switch (this.status) {
      case 'CONFIRMED': return 'bg-blue-500';
      case 'PENDING': return 'bg-amber-500';
      case 'IN_PROGRESS': return 'bg-purple-500';
      case 'COMPLETED': return 'bg-emerald-500';
      case 'CANCELLED': return 'bg-rose-500';
      case 'VIP': return 'bg-amber-500';
      case 'REGULAR': return 'bg-indigo-500';
      case 'INACTIVE': return 'bg-slate-400';
      case 'ACTIVE': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  }
}
