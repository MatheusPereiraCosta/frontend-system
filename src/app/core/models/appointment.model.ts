export type AppointmentStatus = 'CONFIRMED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  isPublicBooking?: boolean;
}
