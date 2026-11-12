import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BusinessService } from '../../core/services/business.service';
import { AuthService } from '../../core/services/auth.service';
import { BusinessInfo } from '../../core/models/business.model';
import { BUSINESS_CATEGORIES } from '../../shared/constants/categories';
import { apiErrorMessage } from '../../core/services/api-mappers';

@Component({
  selector: 'app-establishment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          {{ isEditing ? 'Meu estabelecimento' : 'Cadastre seu estabelecimento' }}
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          {{ isEditing
            ? 'Estas informações aparecem na busca e na sua página pública de agendamento.'
            : 'Depois de salvar, seu estabelecimento fica visível na busca e já pode receber agendamentos.' }}
        </p>
      </div>

      <div *ngIf="isEditing && business().slug" class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm">
        <div class="font-semibold text-emerald-900">Link público para compartilhar com seus clientes</div>
        <a [href]="publicUrl" target="_blank" class="text-emerald-700 underline break-all">{{ publicUrl }}</a>
      </div>

      <div *ngIf="loading" class="text-sm text-slate-500"><i class="pi pi-spin pi-spinner mr-2"></i>Carregando...</div>

      <form *ngIf="!loading" [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div *ngIf="errorMessage" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">{{ errorMessage }}</div>
        <div *ngIf="successMessage" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">{{ successMessage }}</div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Nome do estabelecimento *</label>
            <input type="text" formControlName="name" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Tipo de estabelecimento *</label>
            <select formControlName="category" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="" disabled>Selecione</option>
              <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">WhatsApp *</label>
            <input type="text" formControlName="whatsapp" placeholder="(11) 98888-7777" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Frase de apresentação</label>
            <input type="text" formControlName="tagline" maxlength="255" placeholder="Uma frase curta que aparece na busca" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Descrição</label>
            <textarea formControlName="description" rows="3" class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
        </div>

        <div>
          <h2 class="text-sm font-bold text-slate-800 mb-3">Endereço <span class="font-normal text-slate-500">(a cidade ajuda os clientes a encontrarem você na busca)</span></h2>
          <div class="grid grid-cols-6 gap-3" formGroupName="address">
            <input type="text" formControlName="street" placeholder="Rua" class="col-span-6 sm:col-span-4 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" formControlName="number" placeholder="Número" class="col-span-6 sm:col-span-2 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" formControlName="neighborhood" placeholder="Bairro" class="col-span-6 sm:col-span-3 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" formControlName="city" placeholder="Cidade" class="col-span-4 sm:col-span-2 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" formControlName="state" placeholder="UF" maxlength="2" class="col-span-2 sm:col-span-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Link da logo (opcional)</label>
            <input type="url" formControlName="logoUrl" placeholder="https://..." class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Link do banner (opcional)</label>
            <input type="url" formControlName="bannerUrl" placeholder="https://..." class="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            [disabled]="form.invalid || saving"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer"
          >
            <i *ngIf="saving" class="pi pi-spin pi-spinner text-sm"></i>
            <span>{{ saving ? 'Salvando...' : (isEditing ? 'Salvar alterações' : 'Cadastrar estabelecimento') }}</span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class EstablishmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private businessService = inject(BusinessService);
  private authService = inject(AuthService);

  public business = this.businessService.business;
  public categories = BUSINESS_CATEGORIES;

  public loading = false;
  public saving = false;
  public errorMessage: string | null = null;
  public successMessage: string | null = null;

  public form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    category: ['', Validators.required],
    whatsapp: ['', [Validators.required, Validators.maxLength(20)]],
    tagline: [''],
    description: [''],
    address: this.fb.group({
      street: [''],
      number: [''],
      neighborhood: [''],
      city: [''],
      state: [''],
      zipCode: ['']
    }),
    logoUrl: [''],
    bannerUrl: ['']
  });

  /** Com estabelecimento já cadastrado a tela edita; sem ele, cadastra. */
  get isEditing(): boolean {
    return !!this.authService.establishmentId();
  }

  get publicUrl(): string {
    return `${window.location.origin}/b/${this.business().slug}`;
  }

  ngOnInit(): void {
    if (!this.isEditing) return;
    this.loading = true;
    this.businessService.loadMine().subscribe({
      next: b => {
        if (b) this.form.patchValue(b);
        this.loading = false;
      },
      error: err => {
        this.errorMessage = apiErrorMessage(err, 'Não foi possível carregar os dados do estabelecimento.');
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const data = this.form.value as Partial<BusinessInfo>;

    if (this.isEditing) {
      this.businessService.update(this.authService.establishmentId()!, data).subscribe({
        next: () => {
          this.saving = false;
          this.successMessage = 'Alterações salvas.';
        },
        error: err => this.fail(err)
      });
    } else {
      this.businessService.create(data).subscribe({
        next: () => {
          this.saving = false;
          // O token novo já traz o estabelecimento: libera o resto do painel
          this.businessService.loadMine().subscribe();
          this.router.navigate(['/admin/dashboard']);
        },
        error: err => this.fail(err)
      });
    }
  }

  private fail(err: any): void {
    this.saving = false;
    this.errorMessage = apiErrorMessage(err, 'Não foi possível salvar. Tente novamente.');
  }
}
