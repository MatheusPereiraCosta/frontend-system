import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { apiErrorMessage } from '../../../core/services/api-mappers';

@Component({
  selector: 'app-register',
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
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Crie sua conta</h2>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">Em seguida você cadastra o seu estabelecimento e já recebe agendamentos</p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div class="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          <div *ngIf="errorMessage" class="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <i class="pi pi-exclamation-circle text-rose-400"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Seu nome</label>
              <input
                type="text"
                formControlName="name"
                autocomplete="name"
                placeholder="Ex: Maria Souza"
                class="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">E-mail</label>
              <input
                type="email"
                formControlName="email"
                autocomplete="username"
                placeholder="voce@exemplo.com"
                class="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Senha</label>
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                autocomplete="new-password"
                placeholder="Mínimo de 8 caracteres"
                class="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <label class="flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer">
                <input type="checkbox" [checked]="showPassword" (change)="showPassword = !showPassword" class="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700" />
                <span>Mostrar senha</span>
              </label>
              <p *ngIf="form.controls['password'].touched && form.controls['password'].invalid" class="text-[11px] text-rose-300 mt-1">
                A senha precisa ter entre 8 e 72 caracteres.
              </p>
            </div>

            <button
              type="submit"
              [disabled]="form.invalid || isLoading"
              class="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i *ngIf="isLoading" class="pi pi-spin pi-spinner text-sm"></i>
              <span>{{ isLoading ? 'Criando conta...' : 'Criar conta' }}</span>
            </button>
          </form>

          <div class="pt-4 border-t border-slate-800 text-center">
            <p class="text-xs text-slate-400">
              Já tem conta?
              <a routerLink="/login" class="text-indigo-400 hover:text-indigo-300 font-semibold">Entrar</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public showPassword = false;
  public isLoading = false;
  public errorMessage: string | null = null;

  public form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]]
  });

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;
    const { name, email, password } = this.form.value;

    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.isLoading = false;
        // Próximo passo do fluxo: cadastrar o estabelecimento
        this.router.navigate(['/admin/establishment']);
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = apiErrorMessage(err, 'Não foi possível criar a conta. Tente novamente.');
      }
    });
  }
}
