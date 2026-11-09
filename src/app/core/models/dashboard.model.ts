import { Appointment } from './appointment.model';

export interface DashboardStats {
  todayRevenue: number;
  monthRevenue: number;
  revenueGrowthPercentage: number;
  todayAppointmentsCount: number;
  monthAppointmentsCount: number;
  appointmentsGrowthPercentage: number;
  totalCustomersCount: number;
  newCustomersThisMonth: number;
  occupancyRate: number; // e.g. 78%
  cancellationRate: number; // e.g. 4.2%
  upcomingAppointments: Appointment[];
  revenueByDay: {
    dates: string[];
    series: { name: string; data: number[] }[];
  };
  appointmentsByStatus: {
    labels: string[];
    counts: number[];
  };
  topServices: {
    name: string;
    count: number;
    revenue: number;
  }[];
}
