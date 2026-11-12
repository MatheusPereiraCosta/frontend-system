import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ServiceItem } from '../models/service.model';
import { INITIAL_SERVICES } from './mock/mock-data';
import { fallbackTo, initialData } from './mock/mock-fallback';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceCatalogService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private currentEstablishmentId(): string {
    return this.auth.establishmentId() ?? '';
  }

  private servicesSignal = signal<ServiceItem[]>(initialData(INITIAL_SERVICES));
  public services = this.servicesSignal.asReadonly();

  getServices(establishmentId: string = this.currentEstablishmentId()): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${environment.apiUrl}/establishments/${establishmentId}/services`).pipe(
      tap(list => this.servicesSignal.set(list)),
      catchError(fallbackTo(() => of(this.servicesSignal())))
    );
  }

  getActiveServices(establishmentId: string = this.currentEstablishmentId()): Observable<ServiceItem[]> {
    return this.http.get<ServiceItem[]>(`${environment.apiUrl}/establishments/${establishmentId}/services?activeOnly=true`).pipe(
      tap(list => this.servicesSignal.set(list)),
      catchError(fallbackTo(() => of(this.servicesSignal().filter(s => s.active))))
    );
  }

  getServiceById(id: string, establishmentId: string = this.currentEstablishmentId()): Observable<ServiceItem | undefined> {
    return this.http.get<ServiceItem>(`${environment.apiUrl}/establishments/${establishmentId}/services/${id}`).pipe(
      catchError(fallbackTo(() => of(this.servicesSignal().find(s => s.id === id))))
    );
  }

  addService(item: Omit<ServiceItem, 'id'>, establishmentId: string = this.currentEstablishmentId()): Observable<ServiceItem> {
    return this.http.post<ServiceItem>(`${environment.apiUrl}/establishments/${establishmentId}/services`, item).pipe(
      tap(created => this.servicesSignal.update(list => [...list, created])),
      catchError(fallbackTo(() => {
        const fallback: ServiceItem = { ...item, id: `srv-${Date.now()}` };
        this.servicesSignal.update(list => [...list, fallback]);
        return of(fallback);
      }))
    );
  }

  updateService(id: string, updated: Partial<ServiceItem>, establishmentId: string = this.currentEstablishmentId()): Observable<ServiceItem | null> {
    return this.http.put<ServiceItem>(`${environment.apiUrl}/establishments/${establishmentId}/services/${id}`, updated).pipe(
      tap(saved => {
        this.servicesSignal.update(list => list.map(s => s.id === id ? saved : s));
      }),
      catchError(fallbackTo(() => {
        let result: ServiceItem | null = null;
        this.servicesSignal.update(list =>
          list.map(s => {
            if (s.id === id) {
              result = { ...s, ...updated };
              return result;
            }
            return s;
          })
        );
        return of(result);
      }))
    );
  }

  deleteService(id: string, establishmentId: string = this.currentEstablishmentId()): Observable<boolean> {
    return this.http.delete<void>(`${environment.apiUrl}/establishments/${establishmentId}/services/${id}`).pipe(
      map(() => true),
      tap(() => this.servicesSignal.update(list => list.filter(s => s.id !== id))),
      catchError(fallbackTo(() => {
        this.servicesSignal.update(list => list.filter(s => s.id !== id));
        return of(true);
      }))
    );
  }
}
