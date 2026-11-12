import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * Controle central do modo mock.
 *
 * - `environment.useMockFallback = true`: se a API falhar, os services usam dados em memória (útil para demos offline).
 * - `environment.useMockFallback = false`: o erro da API é propagado e nenhum dado fictício é exibido.
 */
export const MOCK_ENABLED: boolean = environment.useMockFallback;

/** Valor inicial dos signals: dados mock só quando o modo mock está habilitado. */
export function initialData<T>(mock: T[]): T[] {
  return MOCK_ENABLED ? mock : [];
}

/** Substitui `catchError(() => ...)`: usa o fallback apenas se o modo mock estiver habilitado. */
export function fallbackTo<T>(fallback: () => Observable<T>) {
  return (error: unknown): Observable<T> => (MOCK_ENABLED ? fallback() : throwError(() => error));
}
