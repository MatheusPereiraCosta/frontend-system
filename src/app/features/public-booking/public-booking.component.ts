import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BusinessService } from '../../core/services/business.service';
import { ServiceCatalogService } from '../../core/services/service-catalog.service';
import { ProfessionalService } from '../../core/services/professional.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { BusinessInfo } from '../../core/models/business.model';
import { ServiceItem } from '../../core/models/service.model';
import { Professional } from '../../core/models/professional.model';
import { Appointment } from '../../core/models/appointment.model';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { PhonePipe } from '../../shared/pipes/phone.pipe';
import { getTodayDateString, getDateOffsetString } from '../../core/services/mock/mock-data';

@Component({
  selector: 'app-public-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CurrencyBrlPipe,
    DurationPipe
  ],
  template: `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <!-- Top banner & Establishment Header -->
      <header class="relative">
        <div class="h-44 sm:h-56 w-full relative overflow-hidden">
          <img
            [src]="business.bannerUrl"
            [alt]="business.name"
            class="w-full h-full object-cover opacity-40 scale-105 filter blur-xs"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>

        <div class="max-w-3xl mx-auto px-4 -mt-20 relative z-10">
          <div class="bg-slate-800/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            <img
              [src]="business.logoUrl"
              [alt]="business.name"
              class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-indigo-500/30 border-2 border-slate-700 shadow-lg"
            />
            <div class="flex-1">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {{ business.category | uppercase }}
                </span>
                <span class="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <i class="pi pi-star-fill text-[10px]"></i>
                  {{ business.rating }} ({{ business.totalReviews }} avaliações)
                </span>
              </div>

              <h1 class="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">{{ business.name }}</h1>
              <p class="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">{{ business.tagline }}</p>

              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/60">
                <span class="flex items-center gap-1.5">
                  <i class="pi pi-map-marker text-indigo-400 text-xs"></i>
                  {{ business.address.street }}, {{ business.address.number }} - {{ business.address.city }}/{{ business.address.state }}
                </span>
                <span class="flex items-center gap-1.5">
                  <i class="pi pi-whatsapp text-emerald-400 text-xs"></i>
                  {{ business.whatsapp }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Step-by-Step Booking Form Container -->
      <main class="max-w-3xl w-full mx-auto px-4 py-8 flex-1">
        <!-- Progress Steps Bar -->
        <div *ngIf="currentStep < 4" class="mb-8">
          <div class="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span [ngClass]="currentStep >= 1 ? 'text-indigo-400 font-extrabold' : ''">1. Serviço</span>
            <span [ngClass]="currentStep >= 2 ? 'text-indigo-400 font-extrabold' : ''">2. Profissional</span>
            <span [ngClass]="currentStep >= 3 ? 'text-indigo-400 font-extrabold' : ''">3. Data & Horário</span>
            <span [ngClass]="currentStep >= 4 ? 'text-indigo-400 font-extrabold' : ''">4. Confirmação</span>
          </div>
          <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              class="bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
              [style.width]="(currentStep / 4) * 100 + '%'"
            ></div>
          </div>
        </div>

        <!-- ================= STEP 1: Select Service ================= -->
        <div *ngIf="currentStep === 1" class="space-y-4">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h2 class="text-lg font-bold text-white">Escolha o serviço desejado</h2>
              <p class="text-xs text-slate-400">Toque no serviço para prosseguir com o agendamento</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <div
              *ngFor="let srv of activeServices"
              (click)="selectService(srv)"
              [ngClass]="selectedService?.id === srv.id ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50' : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-700'"
              class="p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group"
            >
              <div class="flex-1 pr-4">
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{{ srv.name }}</h3>
                  <span *ngIf="srv.popular" class="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                    POPULAR
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{{ srv.description }}</p>
                <div class="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  <i class="pi pi-clock text-[10px] text-indigo-400"></i>
                  <span>{{ srv.durationMinutes | duration }}</span>
                </div>
              </div>

              <div class="text-right">
                <div class="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">
                  {{ srv.price | currencyBrl }}
                </div>
                <button class="mt-2 px-3 py-1 bg-indigo-600 group-hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs">
                  Escolher
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= STEP 2: Select Professional ================= -->
        <div *ngIf="currentStep === 2" class="space-y-4">
          <div class="flex items-center justify-between mb-2">
            <div>
              <button (click)="currentStep = 1" class="text-xs text-indigo-400 hover:underline mb-1 flex items-center gap-1">
                <i class="pi pi-arrow-left text-[10px]"></i> Voltar para serviços
              </button>
              <h2 class="text-lg font-bold text-white">Com quem você deseja ser atendido?</h2>
              <p class="text-xs text-slate-400">Serviço selecionado: <strong class="text-indigo-300">{{ selectedService?.name }}</strong></p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              *ngFor="let pro of availableProfessionals"
              (click)="selectProfessional(pro)"
              [ngClass]="selectedProfessional?.id === pro.id ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50' : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-700'"
              class="p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 group"
            >
              <img
                [src]="pro.avatarUrl"
                [alt]="pro.name"
                class="w-14 h-14 rounded-2xl object-cover border border-slate-700"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors truncate">{{ pro.name }}</h3>
                  <span class="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <i class="pi pi-star-fill text-[10px]"></i>
                    {{ pro.rating }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5 truncate">{{ pro.role }}</p>
                <div class="mt-2 text-xs text-indigo-400 font-medium">Selecionar</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= STEP 3: Date, Time & Client Info ================= -->
        <div *ngIf="currentStep === 3" class="space-y-6">
          <div>
            <button (click)="currentStep = 2" class="text-xs text-indigo-400 hover:underline mb-1 flex items-center gap-1">
              <i class="pi pi-arrow-left text-[10px]"></i> Voltar para profissional
            </button>
            <h2 class="text-lg font-bold text-white">Escolha a data e horário ideal</h2>
            <p class="text-xs text-slate-400">
              Atendimento com <strong class="text-indigo-300">{{ selectedProfessional?.name }}</strong> para <strong class="text-indigo-300">{{ selectedService?.name }}</strong>
            </p>
          </div>

          <!-- Date Selector Pills (Next 7 days) -->
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Selecione o Dia</label>
            <div class="grid grid-cols-4 sm:grid-cols-7 gap-2">
              <button
                *ngFor="let d of nextDays"
                type="button"
                (click)="onSelectDate(d.dateStr)"
                [ngClass]="selectedDate === d.dateStr ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'"
                class="py-3 px-2 rounded-2xl text-center transition-all flex flex-col items-center justify-center"
              >
                <span class="text-[10px] uppercase font-bold text-slate-400">{{ d.weekday }}</span>
                <span class="text-base font-extrabold mt-0.5">{{ d.dayNum }}</span>
                <span class="text-[10px] text-slate-400">{{ d.monthShort }}</span>
              </button>
            </div>
          </div>

          <!-- Time Slots Grid -->
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Horários Disponíveis</label>
            <div *ngIf="availableSlots.length > 0" class="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <button
                *ngFor="let slot of availableSlots"
                type="button"
                (click)="selectedTime = slot"
                [ngClass]="selectedTime === slot ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 shadow-md' : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'"
                class="py-2.5 rounded-xl text-center text-xs font-mono font-semibold transition-all"
              >
                {{ slot }}
              </button>
            </div>

            <div *ngIf="availableSlots.length === 0" class="p-6 bg-slate-800/60 rounded-2xl border border-slate-700 text-center text-xs text-slate-400">
              Não encontramos horários livres para este dia com o profissional selecionado. Por favor, escolha outra data.
            </div>
          </div>

          <!-- Client Info Form -->
          <form [formGroup]="clientForm" class="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="pi pi-user text-indigo-400"></i>
              <span>Seus Dados para Contato</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="Ex: Gabriel Martins"
                  class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">WhatsApp para Confirmação *</label>
                <input
                  type="text"
                  formControlName="phone"
                  placeholder="Ex: (11) 98888-7777"
                  class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Alguma observação especial? (Opcional)</label>
              <input
                type="text"
                formControlName="notes"
                placeholder="Ex: Primeira vez no estabelecimento"
                class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </form>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              (click)="confirmBooking()"
              [disabled]="clientForm.invalid || !selectedTime"
              class="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white text-base font-bold rounded-2xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2"
            >
              <i class="pi pi-check text-lg"></i>
              <span>Confirmar Agendamento</span>
            </button>
          </div>
        </div>

        <!-- ================= STEP 4: Success Screen ================= -->
        <div *ngIf="currentStep === 4 && confirmedAppointment" class="max-w-lg mx-auto bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl text-center space-y-6">
          <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40">
            <i class="pi pi-check text-3xl"></i>
          </div>

          <div>
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">Agendamento Confirmado!</span>
            <h2 class="text-2xl font-black text-white mt-1">Tudo pronto para o seu atendimento</h2>
            <p class="text-xs text-slate-300 mt-2">
              Enviamos um resumo dos detalhes para o WhatsApp <strong class="text-white">{{ confirmedAppointment.customerPhone }}</strong>.
            </p>
          </div>

          <!-- Summary Ticket -->
          <div class="bg-slate-900/90 rounded-2xl p-5 border border-slate-700/80 text-left space-y-3 text-xs sm:text-sm">
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Serviço:</span>
              <span class="font-bold text-white">{{ confirmedAppointment.serviceName }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Profissional:</span>
              <span class="font-bold text-white">{{ confirmedAppointment.professionalName }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Data e Horário:</span>
              <span class="font-bold text-indigo-400 font-mono">{{ confirmedAppointment.date }} às {{ confirmedAppointment.startTime }}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-slate-800">
              <span class="text-slate-400">Local:</span>
              <span class="font-medium text-slate-200">{{ business.address.street }}, {{ business.address.number }}</span>
            </div>
            <div class="flex justify-between py-1 pt-2 text-base font-extrabold">
              <span class="text-slate-300">Valor a pagar no local:</span>
              <span class="text-emerald-400">{{ confirmedAppointment.price | currencyBrl }}</span>
            </div>
          </div>

          <div class="space-y-3">
            <button
              (click)="resetFlow()"
              class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            >
              Fazer Novo Agendamento
            </button>

            <a
              routerLink="/admin/dashboard"
              class="block text-xs text-slate-400 hover:text-white transition-colors"
            >
              Voltar ao Painel Administrativo
            </a>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="py-6 border-t border-slate-800 text-center text-xs text-slate-400">
        <p>© 2026 {{ business.name }} — Plataforma de Agendamentos desenvolvida com AgendaPro</p>
      </footer>
    </div>
  `
})
export class PublicBookingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);
  private serviceService = inject(ServiceCatalogService);
  private professionalService = inject(ProfessionalService);
  private appointmentService = inject(AppointmentService);

  public business: BusinessInfo = this.businessService.business();
  public activeServices: ServiceItem[] = [];
  public availableProfessionals: Professional[] = [];

  public currentStep = 1;
  public selectedService: ServiceItem | null = null;
  public selectedProfessional: Professional | null = null;
  public selectedDate: string = getTodayDateString();
  public selectedTime: string | null = null;
  public availableSlots: string[] = [];

  public nextDays: Array<{ dateStr: string; weekday: string; dayNum: string; monthShort: string }> = [];
  public confirmedAppointment: Appointment | null = null;

  public clientForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    notes: ['']
  });

  ngOnInit(): void {
    this.business = this.businessService.business();
    this.generateNextDays();

    this.serviceService.getActiveServices().subscribe((list: ServiceItem[]) => {
      this.activeServices = list;
    });

    this.professionalService.getActiveProfessionals().subscribe((list: Professional[]) => {
      this.availableProfessionals = list;
    });
  }

  generateNextDays(): void {
    this.nextDays = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      this.nextDays.push({
        dateStr,
        weekday: i === 0 ? 'Hoje' : weekdays[d.getDay()],
        dayNum: day,
        monthShort: months[d.getMonth()]
      });
    }
  }

  selectService(srv: ServiceItem): void {
    this.selectedService = srv;
    this.currentStep = 2;
  }

  selectProfessional(pro: Professional): void {
    this.selectedProfessional = pro;
    this.currentStep = 3;
    this.onSelectDate(this.selectedDate);
  }

  onSelectDate(dateStr: string): void {
    this.selectedDate = dateStr;
    this.selectedTime = null;
    if (this.selectedProfessional && this.selectedService) {
      this.appointmentService.getAvailableSlots(
        this.selectedProfessional.id,
        this.selectedDate,
        this.selectedService.durationMinutes
      ).subscribe((slots: string[]) => {
        this.availableSlots = slots;
        if (slots.length > 0) {
          this.selectedTime = slots[0];
        }
      });
    }
  }

  confirmBooking(): void {
    if (this.clientForm.invalid || !this.selectedService || !this.selectedProfessional || !this.selectedTime) {
      return;
    }

    const [h, m] = this.selectedTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + this.selectedService.durationMinutes;
    const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const endM = String(totalMinutes % 60).padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    const formVal = this.clientForm.value;

    this.appointmentService.createAppointment({
      customerId: `cli-web-${Date.now()}`,
      customerName: formVal.name,
      customerPhone: formVal.phone,
      professionalId: this.selectedProfessional.id,
      professionalName: this.selectedProfessional.name,
      serviceId: this.selectedService.id,
      serviceName: this.selectedService.name,
      price: this.selectedService.price,
      durationMinutes: this.selectedService.durationMinutes,
      date: this.selectedDate,
      startTime: this.selectedTime,
      endTime,
      status: 'CONFIRMED',
      notes: formVal.notes || 'Agendado online',
      isPublicBooking: true
    }).subscribe({
      next: (apt: Appointment) => {
        this.confirmedAppointment = apt;
        this.currentStep = 4;
      },
      error: (err: Error) => {
        alert(err.message || 'Erro ao realizar o agendamento.');
      }
    });
  }

  resetFlow(): void {
    this.currentStep = 1;
    this.selectedService = null;
    this.selectedProfessional = null;
    this.selectedTime = null;
    this.confirmedAppointment = null;
    this.clientForm.reset();
  }
}
