import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ServiceItem } from '../models/service.model';
import { INITIAL_SERVICES } from './mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class ServiceCatalogService {
  private servicesSignal = signal<ServiceItem[]>(INITIAL_SERVICES);
  public services = this.servicesSignal.asReadonly();

  getServices(): Observable<ServiceItem[]> {
    return of(this.servicesSignal());
  }

  getActiveServices(): Observable<ServiceItem[]> {
    return of(this.servicesSignal().filter(s => s.active));
  }

  getServiceById(id: string): Observable<ServiceItem | undefined> {
    return of(this.servicesSignal().find(s => s.id === id));
  }

  addService(item: Omit<ServiceItem, 'id'>): Observable<ServiceItem> {
    const newService: ServiceItem = {
      ...item,
      id: `srv-${Date.now()}`
    };
    this.servicesSignal.update(list => [...list, newService]);
    return of(newService);
  }

  updateService(id: string, updated: Partial<ServiceItem>): Observable<ServiceItem | null> {
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
  }

  deleteService(id: string): Observable<boolean> {
    this.servicesSignal.update(list => list.filter(s => s.id !== id));
    return of(true);
  }
}
