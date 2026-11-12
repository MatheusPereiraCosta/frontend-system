import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PROFESSIONAL';
  /** Nulo até o dono cadastrar o estabelecimento. */
  establishmentId: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'agendapro_token';
const USER_KEY = 'agendapro_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private tokenSignal = signal<string | null>(this.readValidToken());
  private userSignal = signal<AuthUser | null>(this.tokenSignal() ? this.readStoredUser() : null);

  public currentUser = this.userSignal.asReadonly();
  public token = this.tokenSignal.asReadonly();
  public isAuthenticated = computed(() => this.tokenSignal() !== null && this.userSignal() !== null);
  /** Estabelecimento do dono logado (nulo se ainda não cadastrou). */
  public establishmentId = computed(() => this.userSignal()?.establishmentId ?? null);

  register(name: string, email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { name, email, password })
      .pipe(tap(res => this.applySession(res)), map(res => res.user));
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => this.applySession(res)), map(res => res.user));
  }

  /** Guarda token e usuário. Também usado após cadastrar o estabelecimento, que devolve um token novo. */
  applySession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.tokenSignal.set(res.token);
    this.userSignal.set(res.user);
  }

  /** Limpa a sessão sem navegar (usado pelo interceptor e pelos guards). */
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /** Só devolve o token se ele não estiver expirado (a API responde 401 para qualquer token inválido). */
  private readValidToken(): string | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
      return token;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  private readStoredUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? (JSON.parse(data) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
