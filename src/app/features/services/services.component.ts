import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ServiceCatalogService } from '../../core/services/service-catalog.service';
import { ServiceItem } from '../../core/models/service.model';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    CurrencyBrlPipe,
    DurationPipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Serviços</h1>
          <p class="text-sm text-slate-500 mt-0.5">Gerencie os procedimentos, preços e tempos de duração</p>
        </div>
        <button
          (click)="openModal()"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <i class="pi pi-plus text-xs"></i>
          <span>Novo Serviço</span>
        </button>
      </div>

      <!-- Categories Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          *ngFor="let cat of categories"
          (click)="selectedCategory = cat"
          [ngClass]="selectedCategory === cat ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
          class="px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let item of filteredServices"
          class="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
        >
          <div *ngIf="item.popular" class="absolute top-0 right-0">
            <span class="bg-gradient-to-l from-amber-500 to-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
              Destaque
            </span>
          </div>

          <div>
            <div class="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              {{ item.category }}
            </div>

            <h3 class="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {{ item.name }}
            </h3>

            <p class="text-xs text-slate-500 mt-2 leading-relaxed">
              {{ item.description }}
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400 font-medium flex items-center gap-1">
                <i class="pi pi-clock text-[10px]"></i>
                <span>{{ item.durationMinutes | duration }}</span>
              </div>
              <div class="text-lg font-extrabold text-slate-900 mt-0.5">
                {{ item.price | currencyBrl }}
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Toggle Active -->
              <button
                (click)="toggleActive(item)"
                [ngClass]="item.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'"
                class="p-2 rounded-xl transition-colors"
                [title]="item.active ? 'Serviço Ativo' : 'Serviço Inativo'"
              >
                <i [class]="item.active ? 'pi pi-check-circle text-lg' : 'pi pi-times-circle text-lg'"></i>
              </button>

              <!-- Edit -->
              <button
                (click)="openModal(item)"
                class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Editar"
              >
                <i class="pi pi-pencil text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal: Novo/Editar Serviço -->
      <p-dialog
        [(visible)]="showModal"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [header]="editingId ? 'Editar Serviço' : 'Novo Serviço'"
        [style]="{ width: '95vw', maxWidth: '480px' }"
      >
        <form [formGroup]="serviceForm" (ngSubmit)="saveService()" class="space-y-4 pt-2">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome do Serviço *</label>
            <input
              type="text"
              formControlName="name"
              placeholder="Ex: Corte Degrade Navalhado"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Categoria *</label>
            <input
              type="text"
              formControlName="category"
              placeholder="Ex: Cabelo, Barba, Estética, Sobrancelha"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                formControlName="price"
                placeholder="65.00"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Duração (Minutos) *</label>
              <input
                type="number"
                step="5"
                formControlName="durationMinutes"
                placeholder="45"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Descrição</label>
            <textarea
              formControlName="description"
              rows="3"
              placeholder="Explique os benefícios e detalhes do procedimento..."
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            ></textarea>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="popular"
              formControlName="popular"
              class="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
            />
            <label for="popular" class="text-xs font-medium text-slate-700">Destacar como serviço popular na página pública</label>
          </div>

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
              [disabled]="serviceForm.invalid"
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              Salvar Serviço
            </button>
          </div>
        </form>
      </p-dialog>
    </div>
  `
})
export class ServicesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private serviceCatalog = inject(ServiceCatalogService);

  public services: ServiceItem[] = [];
  public selectedCategory = 'Todas as Categorias';
  public categories: string[] = ['Todas as Categorias'];

  public showModal = false;
  public editingId: string | null = null;

  public serviceForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    price: [null, [Validators.required, Validators.min(0)]],
    durationMinutes: [30, [Validators.required, Validators.min(5)]],
    description: [''],
    popular: [false]
  });

  get filteredServices(): ServiceItem[] {
    if (this.selectedCategory === 'Todas as Categorias') {
      return this.services;
    }
    return this.services.filter(s => s.category === this.selectedCategory);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.serviceCatalog.getServices().subscribe((list: ServiceItem[]) => {
      this.services = list;
      const cats = Array.from(new Set(list.map((s: ServiceItem) => s.category)));
      this.categories = ['Todas as Categorias', ...cats];
    });
  }

  toggleActive(item: ServiceItem): void {
    this.serviceCatalog.updateService(item.id, { active: !item.active }).subscribe(() => {
      this.loadData();
    });
  }

  openModal(item?: ServiceItem): void {
    if (item) {
      this.editingId = item.id;
      this.serviceForm.patchValue({
        name: item.name,
        category: item.category,
        price: item.price,
        durationMinutes: item.durationMinutes,
        description: item.description,
        popular: !!item.popular
      });
    } else {
      this.editingId = null;
      this.serviceForm.reset({
        name: '',
        category: 'Cabelo',
        price: 60,
        durationMinutes: 45,
        description: '',
        popular: false
      });
    }
    this.showModal = true;
  }

  saveService(): void {
    if (this.serviceForm.invalid) return;

    const val = this.serviceForm.value;
    if (this.editingId) {
      this.serviceCatalog.updateService(this.editingId, val).subscribe(() => {
        this.showModal = false;
        this.loadData();
      });
    } else {
      this.serviceCatalog.addService({
        ...val,
        active: true
      }).subscribe(() => {
        this.showModal = false;
        this.loadData();
      });
    }
  }
}
