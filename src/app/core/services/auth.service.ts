import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PROFESSIONAL';
  avatarUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<AuthUser | null>(this.getStoredUser());

  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor(private router: Router) {}

  login(email: string, password: string): Observable<{ success: boolean; user?: AuthUser; message?: string }> {
    // Simulação de autenticação com dados mock
    if (email && password) {
      const user: AuthUser = email.includes('carlos') ? {
        id: 'pro-1',
        name: 'Carlos Mendes',
        email: 'carlos.mendes@agendapro.com',
        role: 'PROFESSIONAL',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      } : {
        id: 'adm-1',
        name: 'Administrador Gestor',
        email: email || 'admin@agendapro.com',
        role: 'ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80'
      };

      localStorage.setItem('agendapro_session', JSON.stringify(user));
      this.currentUserSignal.set(user);
      return of({ success: true, user });
    }

    return of({ success: false, message: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
  }

  logout(): void {
    localStorage.removeItem('agendapro_session');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private getStoredUser(): AuthUser | null {
    try {
      const data = localStorage.getItem('agendapro_session');
      return data ? JSON.parse(data) : {
        id: 'adm-1',
        name: 'Administrador Gestor',
        email: 'admin@agendapro.com',
        role: 'ADMIN',
        avatarUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80'
      };
    } catch {
      return null;
    }
  }
}
