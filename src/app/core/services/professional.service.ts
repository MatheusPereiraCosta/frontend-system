import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Professional } from '../models/professional.model';
import { INITIAL_PROFESSIONALS } from './mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private professionalsSignal = signal<Professional[]>(INITIAL_PROFESSIONALS);
  public professionals = this.professionalsSignal.asReadonly();

  getProfessionals(): Observable<Professional[]> {
    return of(this.professionalsSignal());
  }

  getActiveProfessionals(): Observable<Professional[]> {
    return of(this.professionalsSignal().filter(p => p.active));
  }

  getProfessionalById(id: string): Observable<Professional | undefined> {
    return of(this.professionalsSignal().find(p => p.id === id));
  }

  addProfessional(item: Omit<Professional, 'id' | 'rating' | 'totalAppointments'>): Observable<Professional> {
    const newProfessional: Professional = {
      ...item,
      id: `pro-${Date.now()}`,
      rating: 5.0,
      totalAppointments: 0
    };
    this.professionalsSignal.update(list => [...list, newProfessional]);
    return of(newProfessional);
  }

  updateProfessional(id: string, updated: Partial<Professional>): Observable<Professional | null> {
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
  }

  deleteProfessional(id: string): Observable<boolean> {
    this.professionalsSignal.update(list => list.filter(p => p.id !== id));
    return of(true);
  }
}
