import { Appointment } from '../models/appointment.model';
import { BusinessInfo } from '../models/business.model';
import { Customer } from '../models/customer.model';
import { Professional, WorkingHour } from '../models/professional.model';

/**
 * Converte o formato da API para o formato usado nas telas (e o inverso para o estabelecimento).
 * Fica em um único lugar para a API e a tela poderem evoluir sem espalhar ajustes pelos componentes.
 */

const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

/** A API chama a data de `appointmentDate`; as telas usam `date`. */
export function appointmentFromApi(a: any): Appointment {
  const { appointmentDate, ...rest } = a;
  return { ...rest, date: appointmentDate } as Appointment;
}

/** A API chama a última visita de `lastVisitAt` (data e hora); as telas usam só a data em `lastVisitDate`. */
export function customerFromApi(c: any): Customer {
  const { lastVisitAt, ...rest } = c;
  return {
    ...rest,
    email: c.email ?? '',
    lastVisitDate: lastVisitAt ? String(lastVisitAt).substring(0, 10) : undefined,
    totalAppointments: Number(c.totalAppointments ?? 0),
    totalSpent: Number(c.totalSpent ?? 0)
  } as Customer;
}

/** Acrescenta o nome do dia e ordena de segunda a domingo. */
export function professionalFromApi(p: any): Professional {
  const hours: WorkingHour[] = (p.workingHours ?? [])
    .map((h: any) => ({ ...h, dayName: DAY_NAMES[h.dayOfWeek] }))
    .sort((a: WorkingHour, b: WorkingHour) => ((a.dayOfWeek + 6) % 7) - ((b.dayOfWeek + 6) % 7));
  return { ...p, email: p.email ?? '', avatarUrl: p.avatarUrl ?? '', bio: p.bio ?? '', workingHours: hours } as Professional;
}

/** A API usa endereço plano; as telas usam o objeto `address`. */
export function businessFromApi(b: any): BusinessInfo {
  return {
    id: b.id,
    name: b.name ?? '',
    slug: b.slug ?? '',
    tagline: b.tagline ?? '',
    description: b.description ?? '',
    category: b.category ?? '',
    phone: b.phone ?? '',
    whatsapp: b.whatsapp ?? '',
    address: {
      street: b.street ?? '',
      number: b.number ?? '',
      neighborhood: b.neighborhood ?? '',
      city: b.city ?? '',
      state: b.state ?? '',
      zipCode: b.zipCode ?? ''
    },
    logoUrl: b.logoUrl ?? '',
    bannerUrl: b.bannerUrl ?? '',
    rating: Number(b.rating ?? 0),
    totalReviews: Number(b.totalReviews ?? 0)
  };
}

/** Texto vazio vira nulo para não gravar espaços/strings vazias no banco. */
const orNull = (v: string | undefined | null) => (v && v.trim() ? v.trim() : null);

export function businessToApi(b: Partial<BusinessInfo>): Record<string, unknown> {
  return {
    name: b.name?.trim(),
    category: b.category,
    whatsapp: b.whatsapp?.trim(),
    phone: orNull(b.phone),
    tagline: orNull(b.tagline),
    description: orNull(b.description),
    street: orNull(b.address?.street),
    number: orNull(b.address?.number),
    neighborhood: orNull(b.address?.neighborhood),
    city: orNull(b.address?.city),
    state: orNull(b.address?.state),
    zipCode: orNull(b.address?.zipCode),
    logoUrl: orNull(b.logoUrl),
    bannerUrl: orNull(b.bannerUrl)
  };
}

/** Mensagem legível a partir de um erro HTTP da API (ProblemDetail) ou de falha de rede. */
export function apiErrorMessage(error: any, fallback: string): string {
  if (error?.status === 0) return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
  const fields = error?.error?.fields;
  if (fields && typeof fields === 'object') {
    const first = Object.values(fields)[0];
    if (first) return String(first);
  }
  return error?.error?.detail || fallback;
}
