import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Customer } from '../models/customer.model';
import { INITIAL_CUSTOMERS } from './mock/mock-data';
import { fallbackTo, initialData } from './mock/mock-fallback';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { customerFromApi } from './api-mappers';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private currentEstablishmentId(): string {
    return this.auth.establishmentId() ?? '';
  }

  private customersSignal = signal<Customer[]>(initialData(INITIAL_CUSTOMERS));
  public customers = this.customersSignal.asReadonly();

  public inactiveCustomers = computed(() =>
    this.customersSignal().filter(c => (c.daysSinceLastVisit ?? 0) >= 30 || c.status === 'INACTIVE')
  );

  getCustomers(establishmentId: string = this.currentEstablishmentId(), search?: string, status?: string): Observable<Customer[]> {
    let url = `${environment.apiUrl}/establishments/${establishmentId}/customers?size=50`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'ALL') url += `&status=${status}`;

    return this.http.get<PageResponse<any> | any[]>(url).pipe(
      map(res => (Array.isArray(res) ? res : res.content).map(customerFromApi)),
      tap(list => this.customersSignal.set(list)),
      catchError(fallbackTo(() => of(this.customersSignal())))
    );
  }

  getInactiveCustomers(establishmentId: string = this.currentEstablishmentId(), days: number = 30): Observable<Customer[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/establishments/${establishmentId}/customers/inactive?daysThreshold=${days}`).pipe(
      map(list => list.map(customerFromApi)),
      catchError(fallbackTo(() => of(this.inactiveCustomers())))
    );
  }

  getCustomerById(id: string, establishmentId: string = this.currentEstablishmentId()): Observable<Customer | undefined> {
    return this.http.get<any>(`${environment.apiUrl}/establishments/${establishmentId}/customers/${id}`).pipe(
      map(customerFromApi),
      catchError(fallbackTo(() => of(this.customersSignal().find(c => c.id === id))))
    );
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'totalAppointments' | 'totalSpent'>, establishmentId: string = this.currentEstablishmentId()): Observable<Customer> {
    return this.http.post<any>(`${environment.apiUrl}/establishments/${establishmentId}/customers`, customer).pipe(
      map(customerFromApi),
      tap(created => this.customersSignal.update(list => [created, ...list])),
      catchError(fallbackTo(() => {
        const newCustomer: Customer = {
          ...customer,
          id: `cli-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
          totalAppointments: 0,
          totalSpent: 0,
          status: customer.status || 'REGULAR'
        };
        this.customersSignal.update(list => [newCustomer, ...list]);
        return of(newCustomer);
      }))
    );
  }

  updateCustomer(id: string, updated: Partial<Customer>, establishmentId: string = this.currentEstablishmentId()): Observable<Customer | null> {
    return this.http.put<any>(`${environment.apiUrl}/establishments/${establishmentId}/customers/${id}`, updated).pipe(
      map(customerFromApi),
      tap(saved => {
        this.customersSignal.update(list => list.map(c => c.id === id ? saved : c));
      }),
      catchError(fallbackTo(() => {
        let result: Customer | null = null;
        this.customersSignal.update(list =>
          list.map(c => {
            if (c.id === id) {
              result = { ...c, ...updated };
              return result;
            }
            return c;
          })
        );
        return of(result);
      }))
    );
  }

  deleteCustomer(id: string, establishmentId: string = this.currentEstablishmentId()): Observable<boolean> {
    return this.http.delete<void>(`${environment.apiUrl}/establishments/${establishmentId}/customers/${id}`).pipe(
      map(() => true),
      tap(() => this.customersSignal.update(list => list.filter(c => c.id !== id))),
      catchError(fallbackTo(() => {
        this.customersSignal.update(list => list.filter(c => c.id !== id));
        return of(true);
      }))
    );
  }
}
