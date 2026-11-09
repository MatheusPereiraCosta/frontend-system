import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardStats } from '../models/dashboard.model';
import { AppointmentService } from './appointment.service';
import { CustomerService } from './customer.service';
import { ServiceCatalogService } from './service-catalog.service';
import { getTodayDateString } from './mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private appointmentService = inject(AppointmentService);
  private customerService = inject(CustomerService);
  private serviceService = inject(ServiceCatalogService);

  getDashboardStats(): Observable<DashboardStats> {
    const appointments = this.appointmentService.appointments();
    const customers = this.customerService.customers();
    const services = this.serviceService.services();
    const today = getTodayDateString();

    const todayList = appointments.filter(a => a.date === today);
    const todayRevenue = todayList
      .filter(a => a.status === 'COMPLETED' || a.status === 'IN_PROGRESS' || a.status === 'CONFIRMED')
      .reduce((acc, curr) => acc + curr.price, 0);

    const monthRevenue = appointments
      .filter(a => a.status !== 'CANCELLED')
      .reduce((acc, curr) => acc + curr.price, 0) + 14850; // Base baseline for realistic mock

    const monthAppointmentsCount = appointments.filter(a => a.status !== 'CANCELLED').length + 185;

    // Build last 7 days chart data
    const last7DaysLabels: string[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hoje'];
    const revenueData: number[] = [1420, 1850, 1690, 2100, 2850, 3400, todayRevenue > 0 ? todayRevenue : 1950];
    const appointmentsData: number[] = [12, 16, 14, 18, 25, 30, todayList.length > 0 ? todayList.length : 18];

    // Status distribution
    const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length + 45;
    const completedCount = appointments.filter(a => a.status === 'COMPLETED').length + 130;
    const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length + 8;
    const pendingCount = appointments.filter(a => a.status === 'PENDING').length + 6;

    // Top services calculation
    const topServices = services.slice(0, 4).map((s, idx) => ({
      name: s.name,
      count: [85, 64, 52, 28][idx] || 20,
      revenue: ([85, 64, 52, 28][idx] || 20) * s.price
    }));

    const stats: DashboardStats = {
      todayRevenue: todayRevenue > 0 ? todayRevenue : 495,
      monthRevenue,
      revenueGrowthPercentage: 14.8,
      todayAppointmentsCount: todayList.length > 0 ? todayList.length : 8,
      monthAppointmentsCount,
      appointmentsGrowthPercentage: 11.2,
      totalCustomersCount: customers.length + 240,
      newCustomersThisMonth: 38,
      occupancyRate: 84,
      cancellationRate: 3.8,
      upcomingAppointments: todayList.length > 0 ? todayList : appointments.slice(0, 5),
      revenueByDay: {
        dates: last7DaysLabels,
        series: [
          { name: 'Faturamento (R$)', data: revenueData },
          { name: 'Agendamentos', data: appointmentsData }
        ]
      },
      appointmentsByStatus: {
        labels: ['Concluídos', 'Confirmados', 'Pendentes', 'Cancelados'],
        counts: [completedCount, confirmedCount, pendingCount, cancelledCount]
      },
      topServices
    };

    return of(stats);
  }
}
