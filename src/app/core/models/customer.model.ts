export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  createdAt: string;
  lastVisitDate?: string;
  totalAppointments: number;
  totalSpent: number;
  status: 'VIP' | 'REGULAR' | 'INACTIVE';
  notes?: string;
  daysSinceLastVisit?: number;
}
