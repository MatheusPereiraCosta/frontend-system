import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BusinessService } from '../../../core/services/business.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background Ambient Glow -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <!-- Logo -->
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-4">
          <i class="pi pi-calendar-clock text-2xl"></i>
        </div>

        <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AgendaPro
        </h2>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Acesse o painel de gestão da sua empresa
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div class="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          <!-- Error alert -->
          <div *ngIf="errorMessage" class="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <i class="pi pi-exclamation-circle text-rose-400"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                E-mail ou Usuário
              </label>
              <div class="relative">
                <i class="pi pi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="admin@agendapro.com"
                  class="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Senha de Acesso
                </label>
                <a href="javascript:void(0)" class="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Esqueceu?
                </a>
              </div>
              <div class="relative">
                <i class="pi pi-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
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

            <div class="flex items-center justify-between text-xs pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  formControlName="rememberMe"
                  class="w-4 h-4 rounded-md bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <span>Lembrar meus dados</span>
              </label>
            </div>

            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <i *ngIf="isLoading" class="pi pi-spin pi-spinner text-sm"></i>
              <span>{{ isLoading ? 'Entrando no sistema...' : 'Acessar Painel' }}</span>
              <i *ngIf="!isLoading" class="pi pi-arrow-right text-xs"></i>
            </button>
          </form>

          <!-- Quick Demo Access Section -->
          <div class="pt-4 border-t border-slate-800">
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              ⚡ Acesso Rápido para Demonstração
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="fillDemo('admin')"
                class="py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <i class="pi pi-shield text-indigo-400 text-xs"></i>
                <span>Gestor / Admin</span>
              </button>
              <button
                type="button"
                (click)="fillDemo('pro')"
                class="py-2 px-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <i class="pi pi-user text-emerald-400 text-xs"></i>
                <span>Profissional</span>
              </button>
            </div>
          </div>

          <!-- Link to public page -->
          <div class="text-center pt-2">
            <a
              routerLink="/agendar"
              class="text-xs text-slate-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Ir para a página pública de agendamento</span>
              <i class="pi pi-external-link text-[10px]"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private businessService = inject(BusinessService);
  private router = inject(Router);

  public showPassword = false;
  public isLoading = false;
  public errorMessage: string | null = null;

  public loginForm: FormGroup = this.fb.group({
    email: ['admin@agendapro.com', [Validators.required, Validators.email]],
    password: ['123456', Validators.required],
    rememberMe: [true]
  });

  ngOnInit(): void {
    // Se já estiver logado, redireciona para o dashboard
    if (this.authService.isAuthenticated()) {
      // Deixa o form pronto
    }
  }

  fillDemo(type: 'admin' | 'pro'): void {
    if (type === 'admin') {
      this.loginForm.patchValue({
        email: 'admin@agendapro.com',
        password: 'admin'
      });
    } else {
      this.loginForm.patchValue({
        email: 'carlos.mendes@agendapro.com',
        password: 'pro'
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;
    const { email, password } = this.loginForm.value;

    setTimeout(() => {
      this.authService.login(email, password).subscribe(res => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = res.message || 'Falha ao autenticar.';
        }
      });
    }, 400); // Pequena simulação de rede
  }
}
