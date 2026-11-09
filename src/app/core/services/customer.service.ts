import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Customer } from '../models/customer.model';
import { INITIAL_CUSTOMERS } from './mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customersSignal = signal<Customer[]>(INITIAL_CUSTOMERS);
  public customers = this.customersSignal.asReadonly();

  public inactiveCustomers = computed(() =>
    this.customersSignal().filter(c => (c.daysSinceLastVisit ?? 0) >= 30 || c.status === 'INACTIVE')
  );

  getCustomers(): Observable<Customer[]> {
    return of(this.customersSignal());
  }

  getCustomerById(id: string): Observable<Customer | undefined> {
    return of(this.customersSignal().find(c => c.id === id));
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'totalAppointments' | 'totalSpent'>): Observable<Customer> {
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
  }

  updateCustomer(id: string, updated: Partial<Customer>): Observable<Customer | null> {
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
  }

  deleteCustomer(id: string): Observable<boolean> {
    this.customersSignal.update(list => list.filter(c => c.id !== id));
    return of(true);
  }
}
