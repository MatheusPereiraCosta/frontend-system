import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Customer } from '../models/customer.model';
import { INITIAL_CUSTOMERS } from './mock/mock-data';
import { environment } from '../../../environments/environment';

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
  private customersSignal = signal<Customer[]>(INITIAL_CUSTOMERS);
  public customers = this.customersSignal.asReadonly();

  public inactiveCustomers = computed(() =>
    this.customersSignal().filter(c => (c.daysSinceLastVisit ?? 0) >= 30 || c.status === 'INACTIVE')
  );

  getCustomers(establishmentId: string = environment.defaultEstablishmentId, search?: string, status?: string): Observable<Customer[]> {
    let url = `${environment.apiUrl}/establishments/${establishmentId}/customers?size=50`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'ALL') url += `&status=${status}`;

    return this.http.get<PageResponse<Customer> | Customer[]>(url).pipe(
      map(res => Array.isArray(res) ? res : res.content),
      tap(list => this.customersSignal.set(list)),
      catchError(() => of(this.customersSignal()))
    );
  }

  getInactiveCustomers(establishmentId: string = environment.defaultEstablishmentId, days: number = 30): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${environment.apiUrl}/establishments/${establishmentId}/customers/inactive?daysThreshold=${days}`).pipe(
      catchError(() => of(this.inactiveCustomers()))
    );
  }

  getCustomerById(id: string, establishmentId: string = environment.defaultEstablishmentId): Observable<Customer | undefined> {
    return this.http.get<Customer>(`${environment.apiUrl}/establishments/${establishmentId}/customers/${id}`).pipe(
      catchError(() => of(this.customersSignal().find(c => c.id === id)))
    );
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'totalAppointments' | 'totalSpent'>, establishmentId: string = environment.defaultEstablishmentId): Observable<Customer> {
    return this.http.post<Customer>(`${environment.apiUrl}/establishments/${establishmentId}/customers`, customer).pipe(
      tap(created => this.customersSignal.update(list => [created, ...list])),
      catchError(() => {
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
      })
    );
  }

  updateCustomer(id: string, updated: Partial<Customer>, establishmentId: string = environment.defaultEstablishmentId): Observable<Customer | null> {
    return this.http.put<Customer>(`${environment.apiUrl}/establishments/${establishmentId}/customers/${id}`, updated).pipe(
      tap(saved => {
        this.customersSignal.update(list => list.map(c => c.id === id ? saved : c));
      }),
      catchError(() => {
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
      })
    );
  }

  deleteCustomer(id: string, establishmentId: string = environment.defaultEstablishmentId): Observable<boolean> {
    return this.http.delete<void>(`${environment.apiUrl}/establishments/${establishmentId}/customers/${id}`).pipe(
      map(() => true),
      tap(() => this.customersSignal.update(list => list.filter(c => c.id !== id))),
      catchError(() => {
        this.customersSignal.update(list => list.filter(c => c.id !== id));
        return of(true);
      })
    );
  }
}
