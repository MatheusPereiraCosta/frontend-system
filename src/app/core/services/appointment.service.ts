import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
import { INITIAL_APPOINTMENTS, getTodayDateString } from './mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private appointmentsSignal = signal<Appointment[]>(INITIAL_APPOINTMENTS);
  public appointments = this.appointmentsSignal.asReadonly();

  public todayAppointments = computed(() => {
    const today = getTodayDateString();
    return this.appointmentsSignal().filter(a => a.date === today);
  });

  getAppointments(): Observable<Appointment[]> {
    return of(this.appointmentsSignal());
  }

  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return of(this.appointmentsSignal().filter(a => a.date === date));
  }

  getAppointmentsByDateRange(startDate: string, endDate: string): Observable<Appointment[]> {
    return of(
      this.appointmentsSignal().filter(a => a.date >= startDate && a.date <= endDate)
    );
  }

  createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Observable<Appointment> {
    // Check for conflict: same professional, same date, overlapping time, not cancelled
    const hasConflict = this.appointmentsSignal().some(a =>
      a.professionalId === appointment.professionalId &&
      a.date === appointment.date &&
      a.status !== 'CANCELLED' &&
      ((appointment.startTime >= a.startTime && appointment.startTime < a.endTime) ||
       (appointment.endTime > a.startTime && appointment.endTime <= a.endTime) ||
       (appointment.startTime <= a.startTime && appointment.endTime >= a.endTime))
    );

    if (hasConflict) {
      return throwError(() => new Error('Horário indisponível! Já existe um agendamento conflitante para este profissional.'));
    }

    const newAppointment: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.appointmentsSignal.update(list => [newAppointment, ...list]);
    return of(newAppointment);
  }

  updateStatus(id: string, status: AppointmentStatus): Observable<Appointment | null> {
    let updated: Appointment | null = null;
    this.appointmentsSignal.update(list =>
      list.map(a => {
        if (a.id === id) {
          updated = { ...a, status };
          return updated;
        }
        return a;
      })
    );
    return of(updated);
  }

  updateAppointment(id: string, data: Partial<Appointment>): Observable<Appointment | null> {
    let updated: Appointment | null = null;
    this.appointmentsSignal.update(list =>
      list.map(a => {
        if (a.id === id) {
          updated = { ...a, ...data };
          return updated;
        }
        return a;
      })
    );
    return of(updated);
  }

  deleteAppointment(id: string): Observable<boolean> {
    this.appointmentsSignal.update(list => list.filter(a => a.id !== id));
    return of(true);
  }

  getAvailableSlots(professionalId: string, date: string, durationMinutes: number): Observable<string[]> {
    // Generate slots from 09:00 to 19:00 in increments of 30 mins
    const slots: string[] = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    const currentAppointments = this.appointmentsSignal().filter(
      a => a.professionalId === professionalId && a.date === date && a.status !== 'CANCELLED'
    );

    const available = slots.filter(slot => {
      // Calculate slot end time
      const [h, m] = slot.split(':').map(Number);
      const totalMinutes = h * 60 + m + durationMinutes;
      const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
      const endM = String(totalMinutes % 60).padStart(2, '0');
      const slotEndTime = `${endH}:${endM}`;

      const collides = currentAppointments.some(a =>
        (slot >= a.startTime && slot < a.endTime) ||
        (slotEndTime > a.startTime && slotEndTime <= a.endTime) ||
        (slot <= a.startTime && slotEndTime >= a.endTime)
      );

      return !collides;
    });

    return of(available);
  }
}
