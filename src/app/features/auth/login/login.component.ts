import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { apiErrorMessage } from '../../../core/services/api-mappers';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <a routerLink="/" class="inline-block">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-4">
            <i class="pi pi-calendar-clock text-2xl"></i>
          </div>
        </a>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">AgendaPro</h2>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">Acesse o painel do seu estabelecimento</p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div class="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          <div *ngIf="errorMessage" class="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <i class="pi pi-exclamation-circle text-rose-400"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">E-mail</label>
              <div class="relative">
                <i class="pi pi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input
                  type="email"
                  formControlName="email"
                  autocomplete="username"
                  placeholder="voce@exemplo.com"
                  class="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Senha</label>
              <div class="relative">
                <i class="pi pi-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <i [class]="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i *ngIf="isLoading" class="pi pi-spin pi-spinner text-sm"></i>
              <span>{{ isLoading ? 'Entrando...' : 'Entrar' }}</span>
              <i *ngIf="!isLoading" class="pi pi-arrow-right text-xs"></i>
            </button>
          </form>

          <div class="pt-4 border-t border-slate-800 text-center space-y-2">
            <p class="text-xs text-slate-400">
              Ainda não tem conta?
              <a routerLink="/cadastrar" class="text-indigo-400 hover:text-indigo-300 font-semibold">Cadastre seu estabelecimento</a>
            </p>
            <a routerLink="/" class="text-xs text-slate-500 hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5">
              <i class="pi pi-search text-[10px]"></i>
              <span>Quero agendar em um estabelecimento</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public showPassword = false;
  public isLoading = false;
  public errorMessage: string | null = null;

  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: user => {
        this.isLoading = false;
        // Sem estabelecimento ainda: o primeiro passo é cadastrá-lo
        this.router.navigate([user.establishmentId ? '/admin/dashboard' : '/admin/establishment']);
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = apiErrorMessage(err, 'Não foi possível entrar. Tente novamente.');
      }
    });
  }
}
