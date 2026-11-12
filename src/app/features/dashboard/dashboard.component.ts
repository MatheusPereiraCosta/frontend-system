import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexFill,
  ApexTooltip,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexPlotOptions
} from 'ng-apexcharts';

import { DashboardService } from '../../core/services/dashboard.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { DashboardStats } from '../../core/models/dashboard.model';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { PhonePipe } from '../../shared/pipes/phone.pipe';

export type AreaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis[];
  legend: ApexLegend;
  fill: ApexFill;
  tooltip: ApexTooltip;
  colors: string[];
};

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  legend: ApexLegend;
  colors: string[];
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgApexchartsModule,
    StatusBadgeComponent,
    CurrencyBrlPipe,
    PhonePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Dashboard & Indicadores</h1>
          <p class="text-sm text-slate-500 mt-1">
            Acompanhe o faturamento, agendamentos e desempenho em tempo real.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/schedule"
            class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm rounded-xl transition-colors border border-indigo-200"
          >
            <i class="pi pi-calendar"></i>
            <span>Ver Agenda Completa</span>
          </a>
        </div>
      </div>

      <!-- KPI Stat Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <!-- Faturamento Hoje -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faturamento Hoje</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <i class="pi pi-dollar text-lg"></i>
            </div>
          </div>
          <div class="mt-4 flex items-baseline justify-between">
            <h3 class="text-2xl font-extrabold text-slate-900">
              {{ stats?.todayRevenue | currencyBrl }}
            </h3>
            <span class="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <i class="pi pi-arrow-up-right text-[10px]"></i>
              +14.8%
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Previsto para hoje</p>
        </div>

        <!-- Agendamentos Hoje -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agendamentos Hoje</span>
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <i class="pi pi-calendar text-lg"></i>
            </div>
          </div>
          <div class="mt-4 flex items-baseline justify-between">
            <h3 class="text-2xl font-extrabold text-slate-900">
              {{ stats?.todayAppointmentsCount || 0 }}
            </h3>
            <span class="text-xs font-semibold text-indigo-600 flex items-center gap-0.5">
              <i class="pi pi-check-circle text-[10px]"></i>
              Ativo
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Horários marcados</p>
        </div>

        <!-- Taxa de Cancelamento -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taxa de Cancelamento</span>
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <i class="pi pi-percentage text-lg"></i>
            </div>
          </div>
          <div class="mt-4 flex items-baseline justify-between">
            <h3 class="text-2xl font-extrabold text-slate-900">
              {{ stats?.cancellationRate || 0 }}%
            </h3>
          </div>
          <p class="text-xs text-slate-400 mt-1">Agendamentos cancelados no mês</p>
        </div>

        <!-- Faturamento Mensal -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faturamento Mês</span>
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <i class="pi pi-chart-line text-lg"></i>
            </div>
          </div>
          <div class="mt-4 flex items-baseline justify-between">
            <h3 class="text-2xl font-extrabold text-slate-900">
              {{ stats?.monthRevenue | currencyBrl }}
            </h3>
            <span class="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <i class="pi pi-arrow-up-right text-[10px]"></i>
              +18.2%
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">Meta de R$ 20.000 atingida em 76%</p>
        </div>
      </div>

      <!-- Charts Section: Main Evolution + Status Donut -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Area / Line Chart (2 Cols) -->
        <div class="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-slate-900">Movimentação Semanal</h2>
              <p class="text-xs text-slate-500">Comparativo de faturamento e volume de atendimentos</p>
            </div>
            <span class="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">Últimos 7 dias</span>
          </div>

          <div *ngIf="areaChartOptions" class="w-full">
            <apx-chart
              [series]="areaChartOptions.series"
              [chart]="areaChartOptions.chart"
              [xaxis]="areaChartOptions.xaxis"
              [yaxis]="areaChartOptions.yaxis"
              [stroke]="areaChartOptions.stroke"
              [dataLabels]="areaChartOptions.dataLabels"
              [legend]="areaChartOptions.legend"
              [fill]="areaChartOptions.fill"
              [tooltip]="areaChartOptions.tooltip"
              [colors]="areaChartOptions.colors"
            ></apx-chart>
          </div>
        </div>

        <!-- Donut Chart & Top Services (1 Col) -->
        <div class="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-bold text-slate-900">Status dos Horários</h2>
              <i class="pi pi-info-circle text-slate-400 text-sm" title="Distribuição do mês"></i>
            </div>

            <div *ngIf="donutChartOptions" class="flex justify-center">
              <apx-chart
                [series]="donutChartOptions.series"
                [chart]="donutChartOptions.chart"
                [labels]="donutChartOptions.labels"
                [legend]="donutChartOptions.legend"
                [colors]="donutChartOptions.colors"
                [plotOptions]="donutChartOptions.plotOptions"
                [responsive]="donutChartOptions.responsive"
              ></apx-chart>
            </div>
          </div>

          <!-- Top Services Mini Section -->
          <div class="mt-6 pt-5 border-t border-slate-100">
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Serviços Mais Procurados</h4>
            <div class="space-y-3">
              <div *ngFor="let srv of stats?.topServices" class="flex items-center justify-between text-xs">
                <span class="text-slate-700 font-medium truncate max-w-[170px]">{{ srv.name }}</span>
                <span class="text-slate-500 font-semibold">{{ srv.count }} agendamentos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Appointments Live Queue -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900">Próximos Atendimentos de Hoje</h2>
            <p class="text-xs text-slate-500 mt-0.5">Gerencie os status e clientes com horário marcado para hoje</p>
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs text-indigo-700 font-semibold bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
            <i class="pi pi-clock text-xs"></i>
            <span>{{ todayAppointments.length }} atendimentos hoje</span>
          </span>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-3 px-6">Horário</th>
                <th class="py-3 px-6">Cliente</th>
                <th class="py-3 px-6">Serviço</th>
                <th class="py-3 px-6">Profissional</th>
                <th class="py-3 px-6">Valor</th>
                <th class="py-3 px-6">Status</th>
                <th class="py-3 px-6 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let apt of todayAppointments" class="hover:bg-slate-50/60 transition-colors">
                <!-- Time -->
                <td class="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-xs font-mono font-bold">
                      {{ apt.startTime }} - {{ apt.endTime }}
                    </span>
                  </div>
                </td>

                <!-- Customer -->
                <td class="py-4 px-6">
                  <div class="font-medium text-slate-900">{{ apt.customerName }}</div>
                  <div class="text-xs text-slate-400 font-mono">{{ apt.customerPhone | phoneFormat }}</div>
                </td>

                <!-- Service -->
                <td class="py-4 px-6">
                  <div class="font-medium text-slate-800">{{ apt.serviceName }}</div>
                  <div class="text-xs text-slate-400">{{ apt.durationMinutes }} minutos</div>
                </td>

                <!-- Professional -->
                <td class="py-4 px-6 text-slate-700 font-medium">
                  {{ apt.professionalName }}
                </td>

                <!-- Price -->
                <td class="py-4 px-6 font-semibold text-slate-900">
                  {{ apt.price | currencyBrl }}
                </td>

                <!-- Status -->
                <td class="py-4 px-6">
                  <app-status-badge [status]="apt.status"></app-status-badge>
                </td>

                <!-- Actions -->
                <td class="py-4 px-6 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Confirm -->
                    <button
                      *ngIf="apt.status === 'PENDING'"
                      (click)="changeStatus(apt.id, 'CONFIRMED')"
                      title="Confirmar Agendamento"
                      class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <i class="pi pi-check"></i>
                    </button>

                    <!-- Start -->
                    <button
                      *ngIf="apt.status === 'CONFIRMED'"
                      (click)="changeStatus(apt.id, 'IN_PROGRESS')"
                      title="Iniciar Atendimento"
                      class="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <i class="pi pi-play"></i>
                    </button>

                    <!-- Complete -->
                    <button
                      *ngIf="apt.status === 'IN_PROGRESS'"
                      (click)="changeStatus(apt.id, 'COMPLETED')"
                      title="Concluir Atendimento"
                      class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <i class="pi pi-check-circle"></i>
                    </button>

                    <!-- Cancel -->
                    <button
                      *ngIf="apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'"
                      (click)="changeStatus(apt.id, 'CANCELLED')"
                      title="Cancelar"
                      class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <i class="pi pi-times"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="todayAppointments.length === 0">
                <td colspan="7" class="py-8 text-center text-slate-400 text-sm">
                  Nenhum agendamento marcado para hoje.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private appointmentService = inject(AppointmentService);

  public stats: DashboardStats | null = null;
  public todayAppointments: Appointment[] = [];

  public areaChartOptions: AreaChartOptions | null = null;
  public donutChartOptions: DonutChartOptions | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.dashboardService.getDashboardStats().subscribe((stats: DashboardStats) => {
      this.stats = stats;
      this.initAreaChart(stats);
      this.initDonutChart(stats);
    });

    // Sem data, a API devolve os agendamentos de hoje
    this.appointmentService.getAppointments().subscribe((list: Appointment[]) => {
      this.todayAppointments = list;
    });
  }

  changeStatus(id: string, status: AppointmentStatus): void {
    this.appointmentService.updateStatus(id, status).subscribe(() => {
      this.loadData();
    });
  }

  private initAreaChart(stats: DashboardStats): void {
    this.areaChartOptions = {
      series: [
        {
          name: 'Faturamento (R$)',
          type: 'area',
          data: stats.revenueByDay.series[0].data
        },
        {
          name: 'Agendamentos',
          type: 'column',
          data: stats.revenueByDay.series[1].data
        }
      ],
      chart: {
        height: 310,
        type: 'line',
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif'
      },
      stroke: {
        curve: 'smooth',
        width: [3, 0]
      },
      fill: {
        type: ['gradient', 'solid'],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      colors: ['#4f46e5', '#10b981'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: stats.revenueByDay.dates,
        labels: { style: { colors: '#64748b', fontSize: '12px' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: [
        {
          title: { text: 'Receita (R$)', style: { color: '#4f46e5', fontWeight: 600 } },
          labels: {
            formatter: (val: any) => `R$ ${val}`,
            style: { colors: '#64748b' }
          }
        },
        {
          opposite: true,
          title: { text: 'Agendamentos', style: { color: '#10b981', fontWeight: 600 } },
          labels: {
            formatter: (val: any) => `${val}`,
            style: { colors: '#64748b' }
          }
        }
      ],
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        labels: { colors: '#64748b' }
      },
      tooltip: {
        theme: 'light'
      }
    };
  }

  private initDonutChart(stats: DashboardStats): void {
    this.donutChartOptions = {
      series: stats.appointmentsByStatus.counts,
      labels: stats.appointmentsByStatus.labels,
      chart: {
        type: 'donut',
        height: 240,
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e'],
      legend: {
        position: 'bottom',
        labels: { colors: '#64748b' }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Mês',
                formatter: () => `${stats.monthAppointmentsCount}`
              }
            }
          }
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 260 },
            legend: { position: 'bottom' }
          }
        }
      ]
    };
  }
}
