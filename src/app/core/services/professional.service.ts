import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Professional } from '../models/professional.model';
import { INITIAL_PROFESSIONALS } from './mock/mock-data';
import { fallbackTo, initialData } from './mock/mock-fallback';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { professionalFromApi } from './api-mappers';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private currentEstablishmentId(): string {
    return this.auth.establishmentId() ?? '';
  }

  private professionalsSignal = signal<Professional[]>(initialData(INITIAL_PROFESSIONALS));
  public professionals = this.professionalsSignal.asReadonly();

  getProfessionals(establishmentId: string = this.currentEstablishmentId()): Observable<Professional[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/establishments/${establishmentId}/professionals`).pipe(
      map(list => list.map(professionalFromApi)),
      tap(list => this.professionalsSignal.set(list)),
      catchError(fallbackTo(() => of(this.professionalsSignal())))
    );
  }

  getActiveProfessionals(establishmentId: string = this.currentEstablishmentId()): Observable<Professional[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/establishments/${establishmentId}/professionals?activeOnly=true`).pipe(
      map(list => list.map(professionalFromApi)),
      tap(list => this.professionalsSignal.set(list)),
      catchError(fallbackTo(() => of(this.professionalsSignal().filter(p => p.active))))
    );
  }

  getProfessionalsByService(serviceId: string, establishmentId: string = this.currentEstablishmentId()): Observable<Professional[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/establishments/${establishmentId}/professionals/by-service/${serviceId}`).pipe(
      map(list => list.map(professionalFromApi)),
      catchError(fallbackTo(() => of(this.professionalsSignal().filter(p => p.serviceIds?.includes(serviceId)))))
    );
  }

  getProfessionalById(id: string, establishmentId: string = this.currentEstablishmentId()): Observable<Professional | undefined> {
    return this.http.get<any>(`${environment.apiUrl}/establishments/${establishmentId}/professionals/${id}`).pipe(
      map(professionalFromApi),
      catchError(fallbackTo(() => of(this.professionalsSignal().find(p => p.id === id))))
    );
  }

  addProfessional(item: Omit<Professional, 'id' | 'rating' | 'totalAppointments'>, establishmentId: string = this.currentEstablishmentId()): Observable<Professional> {
    return this.http.post<any>(`${environment.apiUrl}/establishments/${establishmentId}/professionals`, item).pipe(
      map(professionalFromApi),
      tap(created => this.professionalsSignal.update(list => [...list, created])),
      catchError(fallbackTo(() => {
        const fallback: Professional = {
          ...item,
          id: `pro-${Date.now()}`,
          rating: 5.0,
          totalAppointments: 0
        };
        this.professionalsSignal.update(list => [...list, fallback]);
        return of(fallback);
      }))
    );
  }

  updateProfessional(id: string, updated: Partial<Professional>, establishmentId: string = this.currentEstablishmentId()): Observable<Professional | null> {
    return this.http.put<any>(`${environment.apiUrl}/establishments/${establishmentId}/professionals/${id}`, updated).pipe(
      map(professionalFromApi),
      tap(saved => {
        this.professionalsSignal.update(list => list.map(p => p.id === id ? saved : p));
      }),
      catchError(fallbackTo(() => {
        let result: Professional | null = null;
        this.professionalsSignal.update(list =>
          list.map(p => {
            if (p.id === id) {
              result = { ...p, ...updated };
              return result;
            }
            return p;
          })
        );
        return of(result);
      }))
    );
  }

  deleteProfessional(id: string, establishmentId: string = this.currentEstablishmentId()): Observable<boolean> {
    return this.http.delete<void>(`${environment.apiUrl}/establishments/${establishmentId}/professionals/${id}`).pipe(
      map(() => true),
      tap(() => this.professionalsSignal.update(list => list.filter(p => p.id !== id))),
      catchError(fallbackTo(() => {
        this.professionalsSignal.update(list => list.filter(p => p.id !== id));
        return of(true);
      }))
    );
  }
}
