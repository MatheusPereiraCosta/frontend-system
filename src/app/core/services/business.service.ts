import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BusinessInfo } from '../models/business.model';
import { INITIAL_BUSINESS } from './mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private businessSignal = signal<BusinessInfo>(INITIAL_BUSINESS);
  public business = this.businessSignal.asReadonly();

  getBusinessInfo(): Observable<BusinessInfo> {
    return of(this.businessSignal());
  }

  updateBusinessInfo(updated: Partial<BusinessInfo>): Observable<BusinessInfo> {
    const current = this.businessSignal();
    const merged = { ...current, ...updated };
    this.businessSignal.set(merged);
    return of(merged);
  }
}
