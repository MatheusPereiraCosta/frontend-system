import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
import { INITIAL_APPOINTMENTS, getTodayDateString } from './mock/mock-data';
import { environment } from '../../../environments/environment';

interface AvailabilityResponse {
  date: string;
  availableTimes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private appointmentsSignal = signal<Appointment[]>(INITIAL_APPOINTMENTS);
  public appointments = this.appointmentsSignal.asReadonly();

  public todayAppointments = computed(() => {
    const today = getTodayDateString();
    return this.appointmentsSignal().filter(a => a.date === today);
  });

  getAppointments(establishmentId: string = environment.defaultEstablishmentId, date?: string): Observable<Appointment[]> {
    let url = `${environment.apiUrl}/establishments/${establishmentId}/appointments`;
    if (date) url += `?date=${date}`;

    return this.http.get<Appointment[]>(url).pipe(
      tap(list => this.appointmentsSignal.set(list)),
      catchError(() => of(this.appointmentsSignal()))
    );
  }

  getAppointmentsByDate(date: string, establishmentId: string = environment.defaultEstablishmentId): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${environment.apiUrl}/establishments/${establishmentId}/appointments?date=${date}`).pipe(
      catchError(() => of(this.appointmentsSignal().filter(a => a.date === date)))
    );
  }

  getAppointmentsByDateRange(startDate: string, endDate: string, establishmentId: string = environment.defaultEstablishmentId): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${environment.apiUrl}/establishments/${establishmentId}/appointments?startDate=${startDate}&endDate=${endDate}`).pipe(
      catchError(() => of(this.appointmentsSignal().filter(a => a.date >= startDate && a.date <= endDate)))
    );
  }

  createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>, establishmentId: string = environment.defaultEstablishmentId): Observable<Appointment> {
    const payload = {
      professionalId: appointment.professionalId,
      serviceId: appointment.serviceId,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      customerEmail: appointment.customerEmail,
      appointmentDate: appointment.date,
      startTime: appointment.startTime,
      notes: appointment.notes,
      isPublicBooking: appointment.isPublicBooking || false
    };

    return this.http.post<Appointment>(`${environment.apiUrl}/establishments/${establishmentId}/appointments`, payload).pipe(
      tap(created => this.appointmentsSignal.update(list => [created, ...list])),
      catchError((error) => {
        // Se a API retornou erro específico (ex: 409 Conflict), repassa a mensagem
        if (error.status === 409 || error.error?.detail) {
          return throwError(() => new Error(error.error?.detail || 'Horário indisponível! Já existe um agendamento conflitante.'));
        }

        // Fallback local se o servidor estiver offline
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
      })
    );
  }

  updateStatus(id: string, status: AppointmentStatus, establishmentId: string = environment.defaultEstablishmentId): Observable<Appointment | null> {
    return this.http.patch<Appointment>(`${environment.apiUrl}/establishments/${establishmentId}/appointments/${id}/status`, { status }).pipe(
      tap(saved => {
        this.appointmentsSignal.update(list => list.map(a => a.id === id ? saved : a));
      }),
      catchError(() => {
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
      })
    );
  }

  deleteAppointment(id: string, establishmentId: string = environment.defaultEstablishmentId): Observable<boolean> {
    return this.http.delete<void>(`${environment.apiUrl}/establishments/${establishmentId}/appointments/${id}`).pipe(
      map(() => true),
      tap(() => this.appointmentsSignal.update(list => list.filter(a => a.id !== id))),
      catchError(() => {
        this.appointmentsSignal.update(list => list.filter(a => a.id !== id));
        return of(true);
      })
    );
  }

  getAvailableSlots(
    professionalId: string,
    date: string,
    durationMinutes: number,
    serviceId?: string,
    establishmentId: string = environment.defaultEstablishmentId
  ): Observable<string[]> {
    if (serviceId) {
      return this.http.get<AvailabilityResponse>(
        `${environment.apiUrl}/establishments/${establishmentId}/availability?professionalId=${professionalId}&serviceId=${serviceId}&date=${date}`
      ).pipe(
        map(res => res.availableTimes),
        catchError(() => this.getMockSlots(professionalId, date, durationMinutes))
      );
    }
    return this.getMockSlots(professionalId, date, durationMinutes);
  }

  private getMockSlots(professionalId: string, date: string, durationMinutes: number): Observable<string[]> {
    const slots: string[] = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];

    const currentAppointments = this.appointmentsSignal().filter(
      a => a.professionalId === professionalId && a.date === date && a.status !== 'CANCELLED'
    );

    const available = slots.filter(slot => {
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
