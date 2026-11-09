import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Professional } from '../models/professional.model';
import { INITIAL_PROFESSIONALS } from './mock/mock-data';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private http = inject(HttpClient);
  private professionalsSignal = signal<Professional[]>(INITIAL_PROFESSIONALS);
  public professionals = this.professionalsSignal.asReadonly();

  getProfessionals(establishmentId: string = environment.defaultEstablishmentId): Observable<Professional[]> {
    return this.http.get<Professional[]>(`${environment.apiUrl}/establishments/${establishmentId}/professionals`).pipe(
      tap(list => this.professionalsSignal.set(list)),
      catchError(() => of(this.professionalsSignal()))
    );
  }

  getActiveProfessionals(establishmentId: string = environment.defaultEstablishmentId): Observable<Professional[]> {
    return this.http.get<Professional[]>(`${environment.apiUrl}/establishments/${establishmentId}/professionals?activeOnly=true`).pipe(
      tap(list => this.professionalsSignal.set(list)),
      catchError(() => of(this.professionalsSignal().filter(p => p.active)))
    );
  }

  getProfessionalsByService(serviceId: string, establishmentId: string = environment.defaultEstablishmentId): Observable<Professional[]> {
    return this.http.get<Professional[]>(`${environment.apiUrl}/establishments/${establishmentId}/professionals/by-service/${serviceId}`).pipe(
      catchError(() => of(this.professionalsSignal().filter(p => p.serviceIds?.includes(serviceId))))
    );
  }

  getProfessionalById(id: string, establishmentId: string = environment.defaultEstablishmentId): Observable<Professional | undefined> {
    return this.http.get<Professional>(`${environment.apiUrl}/establishments/${establishmentId}/professionals/${id}`).pipe(
      catchError(() => of(this.professionalsSignal().find(p => p.id === id)))
    );
  }

  addProfessional(item: Omit<Professional, 'id' | 'rating' | 'totalAppointments'>, establishmentId: string = environment.defaultEstablishmentId): Observable<Professional> {
    return this.http.post<Professional>(`${environment.apiUrl}/establishments/${establishmentId}/professionals`, item).pipe(
      tap(created => this.professionalsSignal.update(list => [...list, created])),
      catchError(() => {
        const fallback: Professional = {
          ...item,
          id: `pro-${Date.now()}`,
          rating: 5.0,
          totalAppointments: 0
        };
        this.professionalsSignal.update(list => [...list, fallback]);
        return of(fallback);
      })
    );
  }

  updateProfessional(id: string, updated: Partial<Professional>, establishmentId: string = environment.defaultEstablishmentId): Observable<Professional | null> {
    return this.http.put<Professional>(`${environment.apiUrl}/establishments/${establishmentId}/professionals/${id}`, updated).pipe(
      tap(saved => {
        this.professionalsSignal.update(list => list.map(p => p.id === id ? saved : p));
      }),
      catchError(() => {
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
      })
    );
  }

  deleteProfessional(id: string, establishmentId: string = environment.defaultEstablishmentId): Observable<boolean> {
    return this.http.delete<void>(`${environment.apiUrl}/establishments/${establishmentId}/professionals/${id}`).pipe(
      map(() => true),
      tap(() => this.professionalsSignal.update(list => list.filter(p => p.id !== id))),
      catchError(() => {
        this.professionalsSignal.update(list => list.filter(p => p.id !== id));
        return of(true);
      })
    );
  }
}
