import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { PhonePipe } from '../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    StatusBadgeComponent,
    CurrencyBrlPipe,
    PhonePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Base de Clientes</h1>
          <p class="text-sm text-slate-500 mt-0.5">Histórico, frequência de visitas e fidelização</p>
        </div>
        <button
          (click)="openCustomerModal()"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <i class="pi pi-user-plus text-xs"></i>
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      <!-- Filters & Search Bar -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div class="relative w-full md:w-80">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="filterCustomers()"
            placeholder="Buscar por nome, telefone ou e-mail..."
            class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            *ngFor="let tab of statusTabs"
            (click)="selectStatusTab(tab.value)"
            [ngClass]="selectedTab === tab.value ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Customers Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-3 px-6">Cliente</th>
                <th class="py-3 px-6">Contato</th>
                <th class="py-3 px-6">Última Visita</th>
                <th class="py-3 px-6">Atendimentos</th>
                <th class="py-3 px-6">Total Investido</th>
                <th class="py-3 px-6">Perfil</th>
                <th class="py-3 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let customer of filteredList" class="hover:bg-slate-50/60 transition-colors">
                <!-- Name & Avatar -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <img
                      [src]="customer.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'"
                      [alt]="customer.name"
                      class="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div class="font-bold text-slate-900">{{ customer.name }}</div>
                      <div class="text-xs text-slate-400">Cliente desde {{ customer.createdAt }}</div>
                    </div>
                  </div>
                </td>

                <!-- Contact -->
                <td class="py-4 px-6">
                  <div class="font-medium text-slate-800">{{ customer.email }}</div>
                  <div class="text-xs text-slate-400 font-mono">{{ customer.phone | phoneFormat }}</div>
                </td>

                <!-- Last Visit -->
                <td class="py-4 px-6">
                  <div *ngIf="customer.lastVisitDate" class="text-slate-800 font-medium">
                    {{ customer.lastVisitDate }}
                  </div>
                  <div class="text-xs text-slate-400">
                    {{ customer.daysSinceLastVisit ? 'Há ' + customer.daysSinceLastVisit + ' dias' : 'Sem registro' }}
                  </div>
                </td>

                <!-- Total Appointments -->
                <td class="py-4 px-6">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {{ customer.totalAppointments }} visitas
                  </span>
                </td>

                <!-- Total Spent -->
                <td class="py-4 px-6 font-semibold text-slate-900">
                  {{ customer.totalSpent | currencyBrl }}
                </td>

                <!-- Status -->
                <td class="py-4 px-6">
                  <app-status-badge [status]="customer.status"></app-status-badge>
                </td>

                <!-- Actions -->
                <td class="py-4 px-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <!-- WhatsApp Direct -->
                    <a
                      [href]="'https://wa.me/55' + cleanPhone(customer.phone)"
                      target="_blank"
                      title="Chamar no WhatsApp"
                      class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    >
                      <i class="pi pi-whatsapp text-base"></i>
                    </a>

                    <!-- Edit -->
                    <button
                      (click)="openCustomerModal(customer)"
                      title="Editar Cliente"
                      class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    >
                      <i class="pi pi-pencil text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredList.length === 0">
                <td colspan="7" class="py-8 text-center text-slate-400 text-sm">
                  Nenhum cliente encontrado com os filtros atuais.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal: Cadastro/Edição de Cliente -->
      <p-dialog
        [(visible)]="showModal"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [header]="editingId ? 'Editar Cliente' : 'Novo Cliente'"
        [style]="{ width: '95vw', maxWidth: '480px' }"
      >
        <form [formGroup]="customerForm" (ngSubmit)="saveCustomer()" class="space-y-4 pt-2">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome Completo *</label>
            <input
              type="text"
              formControlName="name"
              placeholder="Ex: Roberto Carlos"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Telefone/WhatsApp *</label>
              <input
                type="text"
                formControlName="phone"
                placeholder="(11) 98765-4321"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">E-mail</label>
              <input
                type="email"
                formControlName="email"
                placeholder="cliente@email.com"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Classificação</label>
            <select
              formControlName="status"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="REGULAR">Recorrente</option>
              <option value="VIP">Cliente VIP</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Observações e Preferências</label>
            <textarea
              formControlName="notes"
              rows="3"
              placeholder="Ex: Preferências de atendimento, restrições ou hábitos..."
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            ></textarea>
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
              [disabled]="customerForm.invalid"
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      </p-dialog>
    </div>
  `
})
export class CustomersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);

  public customers: Customer[] = [];
  public filteredList: Customer[] = [];
  public searchTerm = '';
  public selectedTab = 'ALL';

  public showModal = false;
  public editingId: string | null = null;

  public statusTabs = [
    { label: 'Todos', value: 'ALL' },
    { label: 'VIP', value: 'VIP' },
    { label: 'Recorrentes', value: 'REGULAR' },
    { label: 'Inativos', value: 'INACTIVE' }
  ];

  public customerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: [''],
    phone: ['', Validators.required],
    status: ['REGULAR', Validators.required],
    notes: ['']
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.customerService.getCustomers().subscribe((list: Customer[]) => {
      this.customers = list;
      this.filterCustomers();
    });
  }

  selectStatusTab(tab: string): void {
    this.selectedTab = tab;
    this.filterCustomers();
  }

  filterCustomers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredList = this.customers.filter(c => {
      const matchSearch = !term ||
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.email && c.email.toLowerCase().includes(term));

      const matchTab = this.selectedTab === 'ALL' || c.status === this.selectedTab;
      return matchSearch && matchTab;
    });
  }

  cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  openCustomerModal(customer?: Customer): void {
    if (customer) {
      this.editingId = customer.id;
      this.customerForm.patchValue({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        notes: customer.notes || ''
      });
    } else {
      this.editingId = null;
      this.customerForm.reset({
        name: '',
        email: '',
        phone: '',
        status: 'REGULAR',
        notes: ''
      });
    }
    this.showModal = true;
  }

  saveCustomer(): void {
    if (this.customerForm.invalid) return;

    const val = this.customerForm.value;
    if (this.editingId) {
      this.customerService.updateCustomer(this.editingId, val).subscribe(() => {
        this.showModal = false;
        this.loadData();
      });
    } else {
      this.customerService.addCustomer(val).subscribe(() => {
        this.showModal = false;
        this.loadData();
      });
    }
  }
}
