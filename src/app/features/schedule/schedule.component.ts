import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

import { AppointmentService } from '../../core/services/appointment.service';
import { ProfessionalService } from '../../core/services/professional.service';
import { ServiceCatalogService } from '../../core/services/service-catalog.service';
import { CustomerService } from '../../core/services/customer.service';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';
import { Professional } from '../../core/models/professional.model';
import { ServiceItem } from '../../core/models/service.model';
import { Customer } from '../../core/models/customer.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { PhonePipe } from '../../shared/pipes/phone.pipe';
import { getTodayDateString } from '../../core/services/mock/mock-data';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    StatusBadgeComponent,
    CurrencyBrlPipe,
    PhonePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Top Bar: Title & Controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Agenda de Atendimentos</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">Gerencie os horários e capacidade da sua equipe</p>
        </div>

        <!-- Date navigation controls -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              (click)="navigateDate(-1)"
              class="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
              title="Dia anterior"
            >
              <i class="pi pi-chevron-left text-xs"></i>
            </button>

            <button
              (click)="goToToday()"
              class="px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
            >
              Hoje
            </button>

            <button
              (click)="navigateDate(1)"
              class="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
              title="Próximo dia"
            >
              <i class="pi pi-chevron-right text-xs"></i>
            </button>
          </div>

          <!-- Current Selected Date Badge -->
          <div class="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs sm:text-sm font-bold flex items-center gap-2">
            <i class="pi pi-calendar text-xs"></i>
            <span>{{ formattedSelectedDate }}</span>
          </div>

          <!-- Professional Filter -->
          <select
            [(ngModel)]="selectedProfessionalFilter"
            (change)="filterAppointments()"
            class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos os Profissionais</option>
            <option *ngFor="let pro of professionals" [value]="pro.id">{{ pro.name }}</option>
          </select>

          <!-- New Appointment Button -->
          <button
            (click)="openNewAppointmentModal()"
            class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all"
          >
            <i class="pi pi-plus text-xs"></i>
            <span>Agendar</span>
          </button>
        </div>
      </div>

      <!-- Daily Schedule Grid / Kanban View by Professional -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let pro of filteredProfessionals"
          class="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden"
        >
          <!-- Column Header (Professional Card) -->
          <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img
                [src]="pro.avatarUrl"
                [alt]="pro.name"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
              />
              <div>
                <h3 class="text-sm font-bold text-slate-900">{{ pro.name }}</h3>
                <p class="text-xs text-slate-500">{{ pro.role }}</p>
              </div>
            </div>

            <span class="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg">
              {{ getAppointmentsForPro(pro.id).length }} agendados
            </span>
          </div>

          <!-- Appointments List for Professional -->
          <div class="p-4 flex-1 space-y-3 min-h-[380px] bg-slate-50/40">
            <div
              *ngFor="let apt of getAppointmentsForPro(pro.id)"
              (click)="openDetailsModal(apt)"
              class="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {{ apt.startTime }} - {{ apt.endTime }}
                </span>
                <app-status-badge [status]="apt.status"></app-status-badge>
              </div>

              <div class="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                {{ apt.customerName }}
              </div>

              <div class="text-xs text-slate-600 mt-0.5 font-medium flex items-center justify-between">
                <span>{{ apt.serviceName }}</span>
                <span class="font-bold text-slate-900">{{ apt.price | currencyBrl }}</span>
              </div>

              <div *ngIf="apt.notes" class="mt-2 text-[11px] text-slate-400 italic truncate bg-slate-50 p-1.5 rounded-lg">
                "{{ apt.notes }}"
              </div>
            </div>

            <!-- Empty slot state for this professional -->
            <div
              *ngIf="getAppointmentsForPro(pro.id).length === 0"
              class="h-full flex flex-col items-center justify-center p-8 text-center"
            >
              <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <i class="pi pi-calendar-plus text-xl"></i>
              </div>
              <p class="text-xs font-medium text-slate-500">Nenhum horário marcado neste dia.</p>
              <button
                (click)="openNewAppointmentModal(pro.id)"
                class="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                + Marcar horário
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal: Novo Agendamento -->
      <p-dialog
        [(visible)]="showNewModal"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        header="Novo Agendamento"
        [style]="{ width: '95vw', maxWidth: '540px' }"
      >
        <form [formGroup]="appointmentForm" (ngSubmit)="saveAppointment()" class="space-y-4 pt-2">
          <!-- Error alert -->
          <div *ngIf="errorMessage" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Professional Select -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Profissional *</label>
            <select
              formControlName="professionalId"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="" disabled>Selecione um profissional</option>
              <option *ngFor="let p of professionals" [value]="p.id">{{ p.name }} ({{ p.role }})</option>
            </select>
          </div>

          <!-- Service Select -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Serviço *</label>
            <select
              formControlName="serviceId"
              (change)="onServiceChange()"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="" disabled>Selecione um serviço</option>
              <option *ngFor="let s of services" [value]="s.id">
                {{ s.name }} — {{ s.price | currencyBrl }} ({{ s.durationMinutes }} min)
              </option>
            </select>
          </div>

          <!-- Customer details -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome do Cliente *</label>
              <input
                type="text"
                formControlName="customerName"
                placeholder="Ex: Carlos Silva"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Telefone/WhatsApp *</label>
              <input
                type="text"
                formControlName="customerPhone"
                placeholder="Ex: (11) 98765-4321"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <!-- Date & Time -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Data *</label>
              <input
                type="date"
                formControlName="date"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Horário de Início *</label>
              <select
                formControlName="startTime"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
              >
                <option *ngFor="let slot of timeSlots" [value]="slot">{{ slot }}</option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Observações (Opcional)</label>
            <textarea
              formControlName="notes"
              rows="2"
              placeholder="Ex: Preferência do cliente, detalhes adicionais..."
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            ></textarea>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              (click)="showNewModal = false"
              class="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="appointmentForm.invalid"
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </p-dialog>

      <!-- Modal: Detalhes do Agendamento & Ações de Status -->
      <p-dialog
        [(visible)]="showDetailsModal"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        header="Detalhes do Atendimento"
        [style]="{ width: '95vw', maxWidth: '480px' }"
      >
        <div *ngIf="selectedAppointment" class="space-y-4 pt-1">
          <div class="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div class="text-xs text-slate-400 font-medium">Data e Horário</div>
              <div class="font-bold text-slate-900 text-sm font-mono">
                {{ selectedAppointment.date }} • {{ selectedAppointment.startTime }} às {{ selectedAppointment.endTime }}
              </div>
            </div>
            <app-status-badge [status]="selectedAppointment.status"></app-status-badge>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">Cliente:</span>
              <span class="font-bold text-slate-900">{{ selectedAppointment.customerName }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">WhatsApp:</span>
              <span class="font-semibold text-slate-800 font-mono">{{ selectedAppointment.customerPhone | phoneFormat }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">Profissional:</span>
              <span class="font-semibold text-slate-800">{{ selectedAppointment.professionalName }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">Serviço:</span>
              <span class="font-semibold text-slate-800">{{ selectedAppointment.serviceName }} ({{ selectedAppointment.durationMinutes }} min)</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">Valor Total:</span>
              <span class="font-extrabold text-slate-900 text-base">{{ selectedAppointment.price | currencyBrl }}</span>
            </div>
            <div *ngIf="selectedAppointment.notes" class="py-1.5">
              <span class="text-slate-500 block text-xs">Observações:</span>
              <p class="text-slate-700 bg-slate-50 p-2.5 rounded-lg text-xs mt-1">{{ selectedAppointment.notes }}</p>
            </div>
          </div>

          <!-- Status Transition Quick Buttons -->
          <div class="pt-4 border-t border-slate-100 space-y-2">
            <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alterar Status</div>
            <div class="grid grid-cols-2 gap-2">
              <button
                *ngIf="selectedAppointment.status !== 'CONFIRMED'"
                (click)="updateStatus('CONFIRMED')"
                class="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 transition-colors"
              >
                Marcar Confirmado
              </button>
              <button
                *ngIf="selectedAppointment.status !== 'IN_PROGRESS'"
                (click)="updateStatus('IN_PROGRESS')"
                class="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-xl border border-purple-200 transition-colors"
              >
                Em Atendimento
              </button>
              <button
                *ngIf="selectedAppointment.status !== 'COMPLETED'"
                (click)="updateStatus('COMPLETED')"
                class="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl border border-emerald-200 transition-colors"
              >
                Concluir Atendimento
              </button>
              <button
                *ngIf="selectedAppointment.status !== 'CANCELLED'"
                (click)="updateStatus('CANCELLED')"
                class="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-colors"
              >
                Cancelar Horário
              </button>
            </div>
          </div>
        </div>
      </p-dialog>
    </div>
  `
})
export class ScheduleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private professionalService = inject(ProfessionalService);
  private serviceService = inject(ServiceCatalogService);
  private customerService = inject(CustomerService);

  public selectedDate: string = getTodayDateString();
  public selectedProfessionalFilter = 'ALL';

  public professionals: Professional[] = [];
  public services: ServiceItem[] = [];
  public appointments: Appointment[] = [];
  public filteredProfessionals: Professional[] = [];

  public showNewModal = false;
  public showDetailsModal = false;
  public selectedAppointment: Appointment | null = null;
  public errorMessage: string | null = null;

  public timeSlots: string[] = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  public appointmentForm: FormGroup = this.fb.group({
    professionalId: ['', Validators.required],
    serviceId: ['', Validators.required],
    customerName: ['', Validators.required],
    customerPhone: ['', Validators.required],
    date: [this.selectedDate, Validators.required],
    startTime: ['09:00', Validators.required],
    notes: ['']
  });

  get formattedSelectedDate(): string {
    const [year, month, day] = this.selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  ngOnInit(): void {
    this.loadData();

    // Check if queryParam action=new was passed from header
    this.route.queryParams.subscribe((params: any) => {
      if (params['action'] === 'new') {
        this.openNewAppointmentModal();
      }
    });
  }

  loadData(): void {
    this.professionalService.getActiveProfessionals().subscribe((proList: Professional[]) => {
      this.professionals = proList;
      this.filterAppointments();
    });

    this.serviceService.getActiveServices().subscribe((srvList: ServiceItem[]) => {
      this.services = srvList;
    });

    this.appointmentService.getAppointments().subscribe((aptList: Appointment[]) => {
      this.appointments = aptList;
      this.filterAppointments();
    });
  }

  filterAppointments(): void {
    if (this.selectedProfessionalFilter === 'ALL') {
      this.filteredProfessionals = this.professionals;
    } else {
      this.filteredProfessionals = this.professionals.filter(p => p.id === this.selectedProfessionalFilter);
    }
  }

  getAppointmentsForPro(proId: string): Appointment[] {
    return this.appointments
      .filter(a => a.professionalId === proId && a.date === this.selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  navigateDate(offset: number): void {
    const [year, month, day] = this.selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    dateObj.setDate(dateObj.getDate() + offset);

    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    this.selectedDate = `${y}-${m}-${d}`;
    this.appointmentForm.patchValue({ date: this.selectedDate });
  }

  goToToday(): void {
    this.selectedDate = getTodayDateString();
    this.appointmentForm.patchValue({ date: this.selectedDate });
  }

  openNewAppointmentModal(proId?: string): void {
    this.errorMessage = null;
    this.appointmentForm.reset({
      professionalId: proId || (this.professionals[0]?.id ?? ''),
      serviceId: this.services[0]?.id ?? '',
      customerName: '',
      customerPhone: '',
      date: this.selectedDate,
      startTime: '09:00',
      notes: ''
    });
    this.showNewModal = true;
  }

  onServiceChange(): void {
    // Optional helper when service changes
  }

  saveAppointment(): void {
    if (this.appointmentForm.invalid) return;

    this.errorMessage = null;
    const formVal = this.appointmentForm.value;
    const pro = this.professionals.find(p => p.id === formVal.professionalId);
    const srv = this.services.find(s => s.id === formVal.serviceId);

    if (!pro || !srv) return;

    // Calculate end time based on start time + service duration
    const [h, m] = formVal.startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + srv.durationMinutes;
    const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const endM = String(totalMinutes % 60).padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    this.appointmentService.createAppointment({
      customerId: `cli-guest-${Date.now()}`,
      customerName: formVal.customerName,
      customerPhone: formVal.customerPhone,
      professionalId: pro.id,
      professionalName: pro.name,
      serviceId: srv.id,
      serviceName: srv.name,
      price: srv.price,
      durationMinutes: srv.durationMinutes,
      date: formVal.date,
      startTime: formVal.startTime,
      endTime,
      status: 'CONFIRMED',
      notes: formVal.notes
    }).subscribe({
      next: () => {
        this.showNewModal = false;
        this.loadData();
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'Erro ao criar agendamento.';
      }
    });
  }

  openDetailsModal(apt: Appointment): void {
    this.selectedAppointment = apt;
    this.showDetailsModal = true;
  }

  updateStatus(status: AppointmentStatus): void {
    if (!this.selectedAppointment) return;

    this.appointmentService.updateStatus(this.selectedAppointment.id, status).subscribe((updated: Appointment | null) => {
      if (updated) {
        this.selectedAppointment = updated;
        this.loadData();
      }
    });
  }
}
