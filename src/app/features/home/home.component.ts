import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BusinessService } from '../../core/services/business.service';
import { AuthService } from '../../core/services/auth.service';
import { BusinessSummary } from '../../core/models/business.model';
import { BUSINESS_CATEGORIES } from '../../shared/constants/categories';
import { apiErrorMessage } from '../../core/services/api-mappers';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-200">
      <header class="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white">
            <i class="pi pi-calendar-clock"></i>
          </div>
          <span class="text-lg font-extrabold text-white tracking-tight">AgendaPro</span>
        </a>
        <nav class="flex items-center gap-2 text-sm">
          <ng-container *ngIf="auth.isAuthenticated(); else guestLinks">
            <a routerLink="/admin" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Meu painel</a>
          </ng-container>
          <ng-template #guestLinks>
            <a routerLink="/login" class="px-4 py-2 rounded-xl text-slate-300 hover:text-white font-semibold">Entrar</a>
            <a routerLink="/cadastrar" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Cadastrar meu negócio</a>
          </ng-template>
        </nav>
      </header>

      <main class="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <section class="text-center py-10 sm:py-14">
          <h1 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Agende seu horário em poucos cliques</h1>
          <p class="text-slate-400 mt-3 text-sm sm:text-base">Encontre o estabelecimento, escolha o serviço e o profissional. Sem cadastro.</p>

          <form (ngSubmit)="search()" class="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-2 text-left">
            <input
              name="q" [(ngModel)]="q" type="text" placeholder="Nome ou serviço"
              aria-label="Nome do estabelecimento"
              class="sm:col-span-4 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              name="city" [(ngModel)]="city" type="text" placeholder="Cidade"
              aria-label="Cidade"
              class="sm:col-span-3 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              name="category" [(ngModel)]="category" aria-label="Tipo de estabelecimento"
              class="sm:col-span-3 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos os tipos</option>
              <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
            </select>
            <button
              type="submit" [disabled]="loading()"
              class="sm:col-span-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm cursor-pointer"
            >Buscar</button>
          </form>
        </section>

        <div *ngIf="error()" class="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl mb-6">{{ error() }}</div>

        <div *ngIf="loading()" class="text-center text-slate-400 text-sm py-10">
          <i class="pi pi-spin pi-spinner mr-2"></i>Buscando...
        </div>

        <section *ngIf="!loading() && searched() && !error()">
          <p class="text-xs text-slate-500 mb-4">{{ total() }} {{ total() === 1 ? 'estabelecimento encontrado' : 'estabelecimentos encontrados' }}</p>

          <div *ngIf="results().length === 0" class="text-center py-14 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <p class="text-slate-300 font-semibold">Nenhum estabelecimento encontrado</p>
            <p class="text-slate-500 text-sm mt-1">Tente outro nome, cidade ou tipo.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a *ngFor="let b of results()" [routerLink]="['/b', b.slug]"
               class="flex gap-4 p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl transition-colors">
              <div class="w-14 h-14 shrink-0 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center text-indigo-300 font-bold text-lg">
                <img *ngIf="b.logoUrl; else initial" [src]="b.logoUrl" [alt]="b.name" class="w-full h-full object-cover" />
                <ng-template #initial>{{ b.name.charAt(0).toUpperCase() }}</ng-template>
              </div>
              <div class="min-w-0">
                <h3 class="text-white font-bold truncate">{{ b.name }}</h3>
                <p class="text-xs text-indigo-300 mt-0.5">{{ b.category }}</p>
                <p *ngIf="b.tagline" class="text-xs text-slate-400 mt-1 line-clamp-2">{{ b.tagline }}</p>
                <p *ngIf="b.city" class="text-xs text-slate-500 mt-1">
                  <i class="pi pi-map-marker text-[10px] mr-1"></i>{{ b.neighborhood ? b.neighborhood + ', ' : '' }}{{ b.city }}{{ b.state ? ' - ' + b.state : '' }}
                </p>
              </div>
            </a>
          </div>

          <div *ngIf="totalPages() > 1" class="flex items-center justify-center gap-3 mt-8 text-sm">
            <button (click)="goTo(page() - 1)" [disabled]="page() === 0"
              class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 cursor-pointer">Anterior</button>
            <span class="text-slate-400">Página {{ page() + 1 }} de {{ totalPages() }}</span>
            <button (click)="goTo(page() + 1)" [disabled]="page() + 1 >= totalPages()"
              class="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40 cursor-pointer">Próxima</button>
          </div>
        </section>
      </main>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private businessService = inject(BusinessService);
  public auth = inject(AuthService);

  public categories = BUSINESS_CATEGORIES;
  public q = '';
  public city = '';
  public category = '';

  public results = signal<BusinessSummary[]>([]);
  public total = signal(0);
  public totalPages = signal(0);
  public page = signal(0);
  public loading = signal(false);
  public searched = signal(false);
  public error = signal<string | null>(null);

  ngOnInit(): void {
    this.load(0);
  }

  search(): void {
    this.load(0);
  }

  goTo(page: number): void {
    if (page >= 0 && page < this.totalPages()) this.load(page);
  }

  private load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.businessService.search(this.q, this.city, this.category, page).subscribe({
      next: res => {
        this.results.set(res.content);
        this.total.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.page.set(res.number);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(apiErrorMessage(err, 'Não foi possível buscar agora. Tente novamente.'));
        this.loading.set(false);
      }
    });
  }
}
