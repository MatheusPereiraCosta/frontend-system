import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BusinessInfo } from '../models/business.model';
import { INITIAL_BUSINESS } from './mock/mock-data';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private http = inject(HttpClient);
  private businessSignal = signal<BusinessInfo>(INITIAL_BUSINESS);
  public business = this.businessSignal.asReadonly();

  getBusinessInfo(slug: string = environment.defaultEstablishmentSlug): Observable<BusinessInfo> {
    return this.http.get<BusinessInfo>(`${environment.apiUrl}/establishments/slug/${slug}`).pipe(
      tap(data => this.businessSignal.set(data)),
      catchError(() => {
        // Fallback para mock caso backend esteja offline
        return of(this.businessSignal());
      })
    );
  }

  updateBusinessInfo(id: string, updated: Partial<BusinessInfo>): Observable<BusinessInfo> {
    return this.http.put<BusinessInfo>(`${environment.apiUrl}/establishments/${id}`, updated).pipe(
      tap(data => this.businessSignal.set(data)),
      catchError(() => {
        const merged = { ...this.businessSignal(), ...updated };
        this.businessSignal.set(merged);
        return of(merged);
      })
    );
  }
}
