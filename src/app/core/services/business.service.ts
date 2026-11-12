import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { BusinessInfo, BusinessSummary, Page } from '../models/business.model';
import { INITIAL_BUSINESS } from './mock/mock-data';
import { MOCK_ENABLED, fallbackTo } from './mock/mock-fallback';
import { AuthResponse, AuthService } from './auth.service';
import { businessFromApi, businessToApi } from './api-mappers';
import { environment } from '../../../environments/environment';

const EMPTY_BUSINESS: BusinessInfo = {
  id: '',
  name: '',
  slug: '',
  tagline: '',
  description: '',
  category: '',
  phone: '',
  whatsapp: '',
  address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
  logoUrl: '',
  bannerUrl: '',
  rating: 0,
  totalReviews: 0
};

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private businessSignal = signal<BusinessInfo>(MOCK_ENABLED ? INITIAL_BUSINESS : EMPTY_BUSINESS);

  /** Estabelecimento carregado por último (painel do dono ou página pública). */
  public business = this.businessSignal.asReadonly();

  /** Página pública: busca o estabelecimento pelo endereço (slug). */
  getBusinessBySlug(slug: string): Observable<BusinessInfo> {
    return this.http.get<any>(`${environment.apiUrl}/establishments/slug/${encodeURIComponent(slug)}`).pipe(
      map(businessFromApi),
      tap(data => this.businessSignal.set(data))
    );
  }

  /** Painel: carrega o estabelecimento do dono logado. Devolve null se ele ainda não cadastrou. */
  loadMine(): Observable<BusinessInfo | null> {
    const id = this.auth.establishmentId();
    if (!id) {
      this.businessSignal.set(EMPTY_BUSINESS);
      return of(null);
    }
    return this.http.get<any>(`${environment.apiUrl}/establishments/${id}`).pipe(
      map(businessFromApi),
      tap(data => this.businessSignal.set(data)),
      catchError(fallbackTo(() => of(this.businessSignal())))
    );
  }

  /** Busca pública. Filtros em branco são ignorados pela API. */
  search(q: string, city: string, category: string, page = 0): Observable<Page<BusinessSummary>> {
    const params = new URLSearchParams({ page: String(page), size: '12' });
    if (q.trim()) params.set('q', q.trim());
    if (city.trim()) params.set('city', city.trim());
    if (category) params.set('category', category);
    return this.http.get<Page<BusinessSummary>>(`${environment.apiUrl}/establishments/search?${params}`);
  }

  /** Cadastro do estabelecimento do dono. A API devolve um novo token já com o estabelecimento. */
  create(data: Partial<BusinessInfo>): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/establishments`, businessToApi(data)).pipe(
      tap(res => this.auth.applySession(res))
    );
  }

  update(id: string, data: Partial<BusinessInfo>): Observable<BusinessInfo> {
    return this.http.put<any>(`${environment.apiUrl}/establishments/${id}`, businessToApi(data)).pipe(
      map(businessFromApi),
      tap(saved => this.businessSignal.set(saved))
    );
  }
}
