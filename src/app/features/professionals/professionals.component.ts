import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ProfessionalService } from '../../core/services/professional.service';
import { ServiceCatalogService } from '../../core/services/service-catalog.service';
import { Professional, WorkingHour } from '../../core/models/professional.model';
import { apiErrorMessage } from '../../core/services/api-mappers';
import { ServiceItem } from '../../core/models/service.model';
import { PhonePipe } from '../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-professionals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    PhonePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Equipe & Profissionais</h1>
          <p class="text-sm text-slate-500 mt-0.5">Gestão de colaboradores, horários de expediente e especialidades</p>
        </div>
        <button
          (click)="openModal()"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <i class="pi pi-user-plus text-xs"></i>
          <span>Novo Profissional</span>
        </button>
      </div>

      <!-- Professionals Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let pro of professionals"
          class="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
        >
          <div>
            <!-- Header of card -->
            <div class="flex items-start gap-4">
              <img
                *ngIf="pro.avatarUrl; else noAvatar"
                [src]="pro.avatarUrl"
                [alt]="pro.name"
                class="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-50 border border-slate-200 shadow-xs"
              />
              <ng-template #noAvatar>
                <div class="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-black">
                  {{ pro.name.charAt(0).toUpperCase() }}
                </div>
              </ng-template>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-bold text-slate-900 truncate">{{ pro.name }}</h3>
                </div>
                <p class="text-xs text-indigo-600 font-semibold mt-0.5">{{ pro.role }}</p>
                <p class="text-xs text-slate-400 font-mono mt-1">{{ pro.phone | phoneFormat }}</p>
              </div>
            </div>

            <!-- Bio -->
            <p class="text-xs text-slate-600 mt-4 leading-relaxed line-clamp-2">
              {{ pro.bio }}
            </p>

            <!-- Working hours badge summary -->
            <div class="mt-4 pt-3 border-t border-slate-100">
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dias de Atendimento</div>
              <div class="flex flex-wrap gap-1">
                <span
                  *ngFor="let wh of pro.workingHours"
                  [ngClass]="wh.enabled ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' : 'bg-slate-50 text-slate-300 border-slate-100 line-through'"
                  class="text-[10px] px-2 py-0.5 rounded-md border"
                  [title]="wh.enabled ? wh.dayName + ': ' + wh.startTime + ' às ' + wh.endTime : wh.dayName + ': Folga'"
                >
                  {{ wh.dayName.substring(0, 3) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer stats & actions -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500 font-medium">
              <strong class="text-slate-800 font-bold">{{ pro.totalAppointments }}</strong> atendimentos
            </span>

            <div class="flex items-center gap-2">
              <button
                (click)="toggleActive(pro)"
                [ngClass]="pro.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'"
                class="p-2 rounded-xl transition-colors"
                [title]="pro.active ? 'Profissional Ativo' : 'Profissional Inativo'"
              >
                <i [class]="pro.active ? 'pi pi-check-circle text-base' : 'pi pi-times-circle text-base'"></i>
              </button>

              <button
                (click)="openModal(pro)"
                class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Editar Profissional"
              >
                <i class="pi pi-pencil text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal: Novo/Editar Profissional -->
      <p-dialog
        [(visible)]="showModal"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [header]="editingId ? 'Editar Profissional' : 'Novo Profissional'"
        [style]="{ width: '95vw', maxWidth: '520px' }"
      >
        <form [formGroup]="proForm" (ngSubmit)="saveProfessional()" class="space-y-4 pt-2">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome Completo *</label>
            <input
              type="text"
              formControlName="name"
              placeholder="Ex: Ana Souza"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Cargo / Especialidade *</label>
              <input
                type="text"
                formControlName="role"
                placeholder="Ex: Cabeleireira, Dentista, Personal"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Telefone *</label>
              <input
                type="text"
                formControlName="phone"
                placeholder="(11) 98111-2233"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">E-mail</label>
              <input
                type="email"
                formControlName="email"
                placeholder="profissional@exemplo.com"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Link da foto (opcional)</label>
              <input
                type="text"
                formControlName="avatarUrl"
                placeholder="https://..."
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Biografia / Resumo Profissional</label>
            <textarea
              formControlName="bio"
              rows="3"
              placeholder="Descreva a experiência e as especialidades do profissional..."
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            ></textarea>
          </div>

          <!-- Serviços que o profissional realiza -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Serviços que realiza *</label>
            <p *ngIf="availableServices.length === 0" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
              Cadastre pelo menos um serviço em "Serviços & Preços" para vincular ao profissional.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <label *ngFor="let s of availableServices" class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" [checked]="selectedServiceIds.has(s.id)" (change)="toggleService(s.id)" class="w-4 h-4 rounded" />
                <span class="truncate">{{ s.name }}</span>
              </label>
            </div>
          </div>

          <!-- Horários de atendimento -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Horários de atendimento</label>
            <div class="space-y-1.5">
              <div *ngFor="let wh of workingHours" class="grid grid-cols-12 items-center gap-2 text-sm">
                <label class="col-span-5 flex items-center gap-2 cursor-pointer text-slate-700">
                  <input type="checkbox" [checked]="wh.enabled" (change)="wh.enabled = !wh.enabled" class="w-4 h-4 rounded" />
                  <span>{{ wh.dayName }}</span>
                </label>
                <input type="time" [value]="wh.startTime" (change)="wh.startTime = $any($event.target).value" [disabled]="!wh.enabled"
                  class="col-span-3 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs disabled:opacity-40" />
                <span class="col-span-1 text-center text-slate-400 text-xs">às</span>
                <input type="time" [value]="wh.endTime" (change)="wh.endTime = $any($event.target).value" [disabled]="!wh.enabled"
                  class="col-span-3 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs disabled:opacity-40" />
              </div>
            </div>
          </div>

          <div *ngIf="errorMessage" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{{ errorMessage }}</div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              (click)="showModal = false"
              class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="proForm.invalid || selectedServiceIds.size === 0 || saving"
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              Salvar Profissional
            </button>
          </div>
        </form>
      </p-dialog>
    </div>
  `
})
export class ProfessionalsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private professionalService = inject(ProfessionalService);
  private serviceService = inject(ServiceCatalogService);

  public professionals: Professional[] = [];
  public availableServices: ServiceItem[] = [];

  public showModal = false;
  public editingId: string | null = null;
  public saving = false;
  public errorMessage: string | null = null;
  public selectedServiceIds = new Set<string>();
  public workingHours: WorkingHour[] = this.defaultWorkingHours();

  public proForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    role: ['', Validators.required],
    email: [''],
    phone: ['', Validators.required],
    avatarUrl: [''],
    bio: ['']
  });

  /** Segunda a sexta, 09:00–18:00; sábado e domingo de folga. O dono ajusta no formulário. */
  private defaultWorkingHours(): WorkingHour[] {
    const days: Array<[number, string]> = [
      [1, 'Segunda-feira'], [2, 'Terça-feira'], [3, 'Quarta-feira'], [4, 'Quinta-feira'],
      [5, 'Sexta-feira'], [6, 'Sábado'], [0, 'Domingo']
    ];
    return days.map(([dayOfWeek, dayName]) => ({
      dayOfWeek, dayName, enabled: dayOfWeek >= 1 && dayOfWeek <= 5, startTime: '09:00', endTime: '18:00'
    }));
  }

  toggleService(id: string): void {
    if (this.selectedServiceIds.has(id)) this.selectedServiceIds.delete(id);
    else this.selectedServiceIds.add(id);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.professionalService.getProfessionals().subscribe((list: Professional[]) => {
      this.professionals = list;
    });

    this.serviceService.getActiveServices().subscribe((srvs: ServiceItem[]) => {
      this.availableServices = srvs;
    });
  }

  toggleActive(pro: Professional): void {
    this.professionalService.updateProfessional(pro.id, { active: !pro.active }).subscribe(() => {
      this.loadData();
    });
  }

  openModal(pro?: Professional): void {
    this.errorMessage = null;
    if (pro) {
      this.editingId = pro.id;
      this.proForm.patchValue({
        name: pro.name,
        role: pro.role,
        email: pro.email,
        phone: pro.phone,
        avatarUrl: pro.avatarUrl,
        bio: pro.bio
      });
      this.selectedServiceIds = new Set(pro.serviceIds ?? []);
      // Mantém a ordem segunda → domingo e completa dias que não vieram da API
      const defaults = this.defaultWorkingHours();
      this.workingHours = defaults.map(d => {
        const saved = pro.workingHours?.find(h => h.dayOfWeek === d.dayOfWeek);
        return saved ? { ...d, ...saved, dayName: d.dayName, startTime: saved.startTime.substring(0, 5), endTime: saved.endTime.substring(0, 5) } : { ...d, enabled: false };
      });
    } else {
      this.editingId = null;
      this.proForm.reset({ name: '', role: '', email: '', phone: '', avatarUrl: '', bio: '' });
      this.selectedServiceIds = new Set();
      this.workingHours = this.defaultWorkingHours();
    }
    this.showModal = true;
  }

  saveProfessional(): void {
    if (this.proForm.invalid || this.selectedServiceIds.size === 0 || this.saving) return;

    const invalidDay = this.workingHours.find(h => h.enabled && (!h.startTime || !h.endTime || h.startTime >= h.endTime));
    if (invalidDay) {
      this.errorMessage = `Confira o horário de ${invalidDay.dayName}: o início precisa ser antes do término.`;
      return;
    }

    const val = this.proForm.value;
    const payload = {
      ...val,
      email: val.email || null,
      avatarUrl: val.avatarUrl || null,
      serviceIds: Array.from(this.selectedServiceIds),
      workingHours: this.workingHours
    };

    this.saving = true;
    this.errorMessage = null;
    const request$ = this.editingId
      ? this.professionalService.updateProfessional(this.editingId, payload)
      : this.professionalService.addProfessional({ ...payload, active: true });

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.loadData();
      },
      error: err => {
        this.saving = false;
        this.errorMessage = apiErrorMessage(err, 'Não foi possível salvar o profissional.');
      }
    });
  }
}
