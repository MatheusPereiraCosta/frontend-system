import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Área do painel: exige login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

/** Telas que dependem do estabelecimento: sem cadastro, o dono é levado primeiro a cadastrá-lo. */
export const establishmentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.establishmentId() ? true : router.createUrlTree(['/admin/establishment']);
};

/** Login e cadastro: quem já está logado vai direto ao painel. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? router.createUrlTree(['/admin']) : true;
};
