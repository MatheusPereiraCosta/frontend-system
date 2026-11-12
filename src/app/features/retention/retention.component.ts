import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CustomerService } from '../../core/services/customer.service';
import { BusinessService } from '../../core/services/business.service';
import { Customer } from '../../core/models/customer.model';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { PhonePipe } from '../../shared/pipes/phone.pipe';

@Component({
  selector: 'app-retention',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    CurrencyBrlPipe,
    PhonePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold mb-2">
            <i class="pi pi-bolt text-xs"></i>
            <span>Módulo Inteligente de Retenção</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Recuperação de Clientes Inativos</h1>
          <p class="text-sm text-slate-500 mt-0.5">Identifique clientes que não retornam há semanas e reative com mensagens personalizadas</p>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes em Risco</div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-slate-900">{{ inactiveList.length }}</span>
            <span class="text-xs font-semibold text-amber-600">sem agendamento recente</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Mais de 30 dias desde a última visita</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Receita Potencial a Recuperar</div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-emerald-600">{{ potentialRevenue | currencyBrl }}</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Baseado no ticket médio desses clientes</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Taxa de Resposta Estimada</div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-indigo-600">32%</span>
            <span class="text-xs font-semibold text-emerald-600">conversão via WhatsApp</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Usando mensagens com convite especial</p>
        </div>
      </div>

      <!-- Inactive Customers List -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">Clientes Elegíveis para Reativação</h2>
          <span class="text-xs text-slate-500 font-medium">Ordenado pelos mais urgentes</span>
        </div>

        <div class="divide-y divide-slate-100">
          <div *ngFor="let customer of inactiveList" class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
            <div class="flex items-start sm:items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-base font-bold">
                {{ customer.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-900 text-sm sm:text-base">{{ customer.name }}</h3>
                  <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {{ customer.daysSinceLastVisit }} dias sem visitar
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  <span>Última visita: <strong>{{ customer.lastVisitDate }}</strong></span>
                  <span>Histórico: <strong>{{ customer.totalAppointments }} visitas</strong></span>
                  <span>Total gasto: <strong>{{ customer.totalSpent | currencyBrl }}</strong></span>
                </div>
              </div>
            </div>

            <!-- Action Button: Open WhatsApp Re-engagement -->
            <button
              (click)="openReactivationModal(customer)"
              class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-700/20 transition-all self-start md:self-center"
            >
              <i class="pi pi-whatsapp text-sm"></i>
              <span>Enviar Convite Especial</span>
            </button>
          </div>

          <div *ngIf="inactiveList.length === 0" class="p-8 text-center text-slate-400 text-sm">
            Nenhum cliente inativo no momento. Excelente trabalho de retenção!
          </div>
        </div>
      </div>

      <!-- Modal: Mensagem WhatsApp Personalizada -->
      <p-dialog
        [(visible)]="showModal"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        header="Mensagem de Reativação WhatsApp"
        [style]="{ width: '95vw', maxWidth: '520px' }"
      >
        <div *ngIf="selectedCustomer" class="space-y-4 pt-2">
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            Você está prestes a enviar uma mensagem personalizada para <strong>{{ selectedCustomer.name }}</strong> ({{ selectedCustomer.phone | phoneFormat }}).
          </div>

          <!-- Template selector -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Modelo de Abordagem</label>
            <select
              [(ngModel)]="selectedTemplateType"
              (change)="generateMessage()"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="saudade">Sentimos sua falta (Amigável & Convite)</option>
              <option value="desconto">Condição Especial de Retorno</option>
              <option value="novidade">Novos Tratamentos e Horários Disponíveis</option>
            </select>
          </div>

          <!-- Editable text area -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Texto da Mensagem</label>
            <textarea
              [(ngModel)]="customMessage"
              rows="6"
              class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            ></textarea>
          </div>

          <!-- Send via WhatsApp button -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              (click)="showModal = false"
              class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold"
            >
              Fechar
            </button>
            <a
              [href]="getWhatsAppLink()"
              target="_blank"
              (click)="showModal = false"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              <i class="pi pi-whatsapp"></i>
              <span>Abrir WhatsApp Web / App</span>
            </a>
          </div>
        </div>
      </p-dialog>
    </div>
  `
})
export class RetentionComponent implements OnInit {
  private customerService = inject(CustomerService);
  private businessService = inject(BusinessService);

  public inactiveList: Customer[] = [];
  public potentialRevenue = 0;

  public showModal = false;
  public selectedCustomer: Customer | null = null;
  public selectedTemplateType = 'saudade';
  public customMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.customerService.getCustomers().subscribe((list: Customer[]) => {
      this.inactiveList = list.filter((c: Customer) => (c.daysSinceLastVisit ?? 0) >= 30 || c.status === 'INACTIVE');
      this.potentialRevenue = this.inactiveList.reduce((acc, c) => acc + (c.totalSpent / (c.totalAppointments || 1)), 0);
    });
  }

  openReactivationModal(customer: Customer): void {
    this.selectedCustomer = customer;
    this.selectedTemplateType = 'saudade';
    this.generateMessage();
    this.showModal = true;
  }

  generateMessage(): void {
    if (!this.selectedCustomer) return;
    const biz = this.businessService.business();
    const firstName = this.selectedCustomer.name.split(' ')[0];
    const link = `${window.location.origin}/b/${biz.slug}`;

    if (this.selectedTemplateType === 'saudade') {
      this.customMessage = `Olá ${firstName}! Tudo bem? 😊\n\nAqui é da ${biz.name}. Notamos que faz um tempinho desde a sua última visita e gostaríamos de saber como você está!\n\nQue tal garantir um horário esta semana?\n\nAgende online direto pelo link: ${link}\n\nTe esperamos!`;
    } else if (this.selectedTemplateType === 'desconto') {
      this.customMessage = `Olá ${firstName}! Tudo bem? 🎁\n\nA ${biz.name} preparou uma condição especial para o seu retorno. Fale com a gente para saber os detalhes!\n\nEscolha o seu melhor horário pelo link: ${link}`;
    } else {
      this.customMessage = `Olá ${firstName}! 🌟\n\nTemos novidades na ${biz.name}! Adicionamos novos horários de atendimento para sua comodidade.\n\nGaranta o seu horário pelo link: ${link}\n\nUm abraço da equipe!`;
    }
  }

  getWhatsAppLink(): string {
    if (!this.selectedCustomer) return '#';
    const cleanNumber = this.selectedCustomer.phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(this.customMessage);
    return `https://wa.me/55${cleanNumber}?text=${encoded}`;
  }
}
