import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
import { INITIAL_APPOINTMENTS, getTodayDateString } from './mock/mock-data';
import { MOCK_ENABLED, fallbackTo, initialData } from './mock/mock-fallback';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { appointmentFromApi, apiErrorMessage } from './api-mappers';

interface AvailabilityResponse {
  date: string;
  availableTimes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private currentEstablishmentId(): string {
    return this.auth.establishmentId() ?? '';
  }

  private appointmentsSignal = signal<Appointment[]>(initialData(INITIAL_APPOINTMENTS));
  public appointments = this.appointmentsSignal.asReadonly();

  public todayAppointments = computed(() => {
    const today = getTodayDateString();
    return this.appointmentsSignal().filter(a => a.date === today);
  });

  getAppointments(establishmentId: string = this.currentEstablishmentId(), date?: string): Observable<Appointment[]> {
    let url = `${environment.apiUrl}/establishments/${establishmentId}/appointments`;
    if (date) url += `?date=${date}`;

    return this.http.get<any[]>(url).pipe(
      map(list => list.map(appointmentFromApi)),
      tap(list => this.appointmentsSignal.set(list)),
      catchError(fallbackTo(() => of(this.appointmentsSignal())))
    );
  }

  getAppointmentsByDate(date: string, establishmentId: string = this.currentEstablishmentId()): Observable<Appointment[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/establishments/${establishmentId}/appointments?date=${date}`).pipe(
      map(list => list.map(appointmentFromApi)),
      catchError(fallbackTo(() => of(this.appointmentsSignal().filter(a => a.date === date))))
    );
  }

  getAppointmentsByDateRange(startDate: string, endDate: string, establishmentId: string = this.currentEstablishmentId()): Observable<Appointment[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/establishments/${establishmentId}/appointments?startDate=${startDate}&endDate=${endDate}`).pipe(
      map(list => list.map(appointmentFromApi)),
      catchError(fallbackTo(() => of(this.appointmentsSignal().filter(a => a.date >= startDate && a.date <= endDate))))
    );
  }

  createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>, establishmentId: string = this.currentEstablishmentId()): Observable<Appointment> {
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

    return this.http.post<any>(`${environment.apiUrl}/establishments/${establishmentId}/appointments`, payload).pipe(
      map(appointmentFromApi),
      tap(created => this.appointmentsSignal.update(list => [created, ...list])),
      catchError((error) => {
        // Erros de regra de negócio da API (409 conflito, 400 horário inválido, 404 etc.) trazem a mensagem pronta
        if (error.error?.detail || error.error?.fields) {
          return throwError(() => new Error(apiErrorMessage(error, 'Não foi possível salvar o agendamento.')));
        }

        if (!MOCK_ENABLED) {
          return throwError(() => new Error('Não foi possível salvar o agendamento. Verifique a conexão com o servidor e tente novamente.'));
        }

        // Fallback local se o servidor estiver offline (somente com useMockFallback = true)
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

  updateStatus(id: string, status: AppointmentStatus, establishmentId: string = this.currentEstablishmentId()): Observable<Appointment | null> {
    return this.http.patch<any>(`${environment.apiUrl}/establishments/${establishmentId}/appointments/${id}/status`, { status }).pipe(
      map(appointmentFromApi),
      tap(saved => {
        this.appointmentsSignal.update(list => list.map(a => a.id === id ? saved : a));
      }),
      catchError(fallbackTo(() => {
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
      }))
    );
  }

  deleteAppointment(id: string, establishmentId: string = this.currentEstablishmentId()): Observable<boolean> {
    return this.http.delete<void>(`${environment.apiUrl}/establishments/${establishmentId}/appointments/${id}`).pipe(
      map(() => true),
      tap(() => this.appointmentsSignal.update(list => list.filter(a => a.id !== id))),
      catchError(fallbackTo(() => {
        this.appointmentsSignal.update(list => list.filter(a => a.id !== id));
        return of(true);
      }))
    );
  }

  getAvailableSlots(
    professionalId: string,
    date: string,
    durationMinutes: number,
    serviceId?: string,
    establishmentId: string = this.currentEstablishmentId()
  ): Observable<string[]> {
    if (serviceId) {
      return this.http.get<AvailabilityResponse>(
        `${environment.apiUrl}/establishments/${establishmentId}/availability?professionalId=${professionalId}&serviceId=${serviceId}&date=${date}`
      ).pipe(
        map(res => res.availableTimes),
        catchError(fallbackTo(() => this.getMockSlots(professionalId, date, durationMinutes)))
      );
    }
    return MOCK_ENABLED ? this.getMockSlots(professionalId, date, durationMinutes) : of([]);
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
