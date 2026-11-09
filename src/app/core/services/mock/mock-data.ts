import { BusinessInfo } from '../../models/business.model';
import { Customer } from '../../models/customer.model';
import { ServiceItem } from '../../models/service.model';
import { Professional } from '../../models/professional.model';
import { Appointment } from '../../models/appointment.model';

export const INITIAL_BUSINESS: BusinessInfo = {
  id: 'biz-1',
  name: 'Barbearia & Studio Dom Pedro',
  slug: 'barbearia-dom-pedro',
  tagline: 'Estilo, precisão e tradição no coração da cidade',
  description: 'Especialistas em cortes clássicos, modernos, barba na toalha quente e cuidados masculinos premium. Ambiente climatizado com café expresso e cerveja artesanal.',
  category: 'barbearia',
  phone: '(11) 3456-7890',
  whatsapp: '(11) 98765-4321',
  address: {
    street: 'Av. Paulista',
    number: '1200',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100'
  },
  logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80',
  bannerUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
  rating: 4.9,
  totalReviews: 328
};

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Corte Cabelo Executivo',
    description: 'Corte personalizado na tesoura ou máquina, com lavagem refrescante e finalização com pomada matte.',
    category: 'Cabelo',
    price: 65.0,
    durationMinutes: 45,
    active: true,
    popular: true
  },
  {
    id: 'srv-2',
    name: 'Barba Terapia com Toalha Quente',
    description: 'Modelagem da barba com navalhete descartável, esfoliação facial, óleos essenciais e toalha quente relaxante.',
    category: 'Barba',
    price: 55.0,
    durationMinutes: 40,
    active: true,
    popular: true
  },
  {
    id: 'srv-3',
    name: 'Combo Dom Pedro (Corte + Barba)',
    description: 'Experiência completa com corte de cabelo, barba terapia completa e massagem capilar.',
    category: 'Combos',
    price: 110.0,
    durationMinutes: 80,
    active: true,
    popular: true
  },
  {
    id: 'srv-4',
    name: 'Camuflagem de Fios Brancos',
    description: 'Tonalização sutil e natural para disfarçar cabelos ou barba grisalha sem aspecto artificial.',
    category: 'Tratamentos',
    price: 75.0,
    durationMinutes: 30,
    active: true
  },
  {
    id: 'srv-5',
    name: 'Limpeza de Pele Express & Argiloterapia',
    description: 'Remoção de impurezas, cravos superficiais e aplicação de máscara calmante de argila verde.',
    category: 'Estética',
    price: 90.0,
    durationMinutes: 50,
    active: true
  },
  {
    id: 'srv-6',
    name: 'Design de Sobrancelha Masculina',
    description: 'Alinhamento natural com pinça ou navalha mantendo a anatomia masculina.',
    category: 'Estética',
    price: 30.0,
    durationMinutes: 20,
    active: true
  }
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'pro-1',
    name: 'Carlos "Navalha" Mendes',
    role: 'Master Barber & Visagista',
    email: 'carlos.mendes@agendapro.com',
    phone: '(11) 98111-2233',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    bio: 'Mais de 10 anos de experiência em cortes clássicos, fades perfeitos e visagismo facial.',
    rating: 4.95,
    totalAppointments: 1420,
    active: true,
    serviceIds: ['srv-1', 'srv-2', 'srv-3', 'srv-4'],
    workingHours: [
      { dayOfWeek: 1, dayName: 'Segunda-feira', enabled: true, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 2, dayName: 'Terça-feira', enabled: true, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 3, dayName: 'Quarta-feira', enabled: true, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 4, dayName: 'Quinta-feira', enabled: true, startTime: '09:00', endTime: '20:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 5, dayName: 'Sexta-feira', enabled: true, startTime: '09:00', endTime: '20:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 6, dayName: 'Sábado', enabled: true, startTime: '08:30', endTime: '18:00', breakStart: '12:30', breakEnd: '13:30' },
      { dayOfWeek: 0, dayName: 'Domingo', enabled: false, startTime: '09:00', endTime: '14:00' }
    ]
  },
  {
    id: 'pro-2',
    name: 'Rafael Silveira',
    role: 'Barbeiro Especialista em Fade',
    email: 'rafael.silveira@agendapro.com',
    phone: '(11) 98222-3344',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    bio: 'Especialista em freestyle, degrade navalhado e tendências contemporâneas.',
    rating: 4.88,
    totalAppointments: 980,
    active: true,
    serviceIds: ['srv-1', 'srv-2', 'srv-3'],
    workingHours: [
      { dayOfWeek: 1, dayName: 'Segunda-feira', enabled: true, startTime: '10:00', endTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
      { dayOfWeek: 2, dayName: 'Terça-feira', enabled: true, startTime: '10:00', endTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
      { dayOfWeek: 3, dayName: 'Quarta-feira', enabled: true, startTime: '10:00', endTime: '19:00', breakStart: '13:00', breakEnd: '14:00' },
      { dayOfWeek: 4, dayName: 'Quinta-feira', enabled: true, startTime: '10:00', endTime: '20:00', breakStart: '13:00', breakEnd: '14:00' },
      { dayOfWeek: 5, dayName: 'Sexta-feira', enabled: true, startTime: '10:00', endTime: '20:00', breakStart: '13:00', breakEnd: '14:00' },
      { dayOfWeek: 6, dayName: 'Sábado', enabled: true, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      { dayOfWeek: 0, dayName: 'Domingo', enabled: false, startTime: '09:00', endTime: '14:00' }
    ]
  },
  {
    id: 'pro-3',
    name: 'Dra. Beatriz Fontana',
    role: 'Terapeuta Capilar & Esteticista',
    email: 'beatriz.fontana@agendapro.com',
    phone: '(11) 98333-4455',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    bio: 'Foco em saúde do couro cabeludo, tratamentos faciais e protocolos de rejuvenescimento.',
    rating: 4.98,
    totalAppointments: 650,
    active: true,
    serviceIds: ['srv-4', 'srv-5', 'srv-6'],
    workingHours: [
      { dayOfWeek: 1, dayName: 'Segunda-feira', enabled: false, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 2, dayName: 'Terça-feira', enabled: true, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 3, dayName: 'Quarta-feira', enabled: true, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 4, dayName: 'Quinta-feira', enabled: true, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 5, dayName: 'Sexta-feira', enabled: true, startTime: '09:00', endTime: '19:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 6, dayName: 'Sábado', enabled: true, startTime: '08:30', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 0, dayName: 'Domingo', enabled: false, startTime: '09:00', endTime: '14:00' }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cli-1',
    name: 'Lucas Gabriel Albuquerque',
    email: 'lucas.albuquerque@gmail.com',
    phone: '(11) 99123-4567',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2024-01-10',
    lastVisitDate: '2026-11-02',
    daysSinceLastVisit: 7,
    totalAppointments: 24,
    totalSpent: 2480.0,
    status: 'VIP',
    notes: 'Prefere corte com tesoura nas laterais e café com pouco açúcar.'
  },
  {
    id: 'cli-2',
    name: 'Guilherme Rocha Lima',
    email: 'guilherme.rocha@outlook.com',
    phone: '(11) 99234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2024-03-15',
    lastVisitDate: '2026-10-25',
    daysSinceLastVisit: 15,
    totalAppointments: 14,
    totalSpent: 1350.0,
    status: 'REGULAR',
    notes: 'Costuma agendar sempre às sextas-feiras no final da tarde.'
  },
  {
    id: 'cli-3',
    name: 'Felipe Santana Martins',
    email: 'felipe.martins@hotmail.com',
    phone: '(11) 99345-6789',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    createdAt: '2023-11-20',
    lastVisitDate: '2026-09-12',
    daysSinceLastVisit: 58,
    totalAppointments: 8,
    totalSpent: 720.0,
    status: 'INACTIVE',
    notes: 'Cliente fiel que não retorna há quase 2 meses. Candidato a mensagem de reativação.'
  },
  {
    id: 'cli-4',
    name: 'Thiago Henrique Neves',
    email: 'thiago.neves@gmail.com',
    phone: '(11) 99456-7890',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    createdAt: '2024-06-01',
    lastVisitDate: '2026-11-08',
    daysSinceLastVisit: 1,
    totalAppointments: 18,
    totalSpent: 1980.0,
    status: 'VIP',
    notes: 'Faz sempre barba terapia + corte executivo.'
  },
  {
    id: 'cli-5',
    name: 'Eduardo Cavalcante',
    email: 'eduardo.c@empresa.com.br',
    phone: '(11) 99567-8901',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    createdAt: '2024-08-10',
    lastVisitDate: '2026-08-20',
    daysSinceLastVisit: 81,
    totalAppointments: 4,
    totalSpent: 360.0,
    status: 'INACTIVE',
    notes: 'Não comparece há mais de 80 dias.'
  },
  {
    id: 'cli-6',
    name: 'Matheus Brandão',
    email: 'matheus.brandao@tech.io',
    phone: '(11) 99678-9012',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    createdAt: '2024-09-05',
    lastVisitDate: '2026-11-05',
    daysSinceLastVisit: 4,
    totalAppointments: 6,
    totalSpent: 590.0,
    status: 'REGULAR',
    notes: 'Cliente pontual.'
  }
];

// Helper to format today's date YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffsetString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = getTodayDateString();
const yesterday = getDateOffsetString(-1);
const tomorrow = getDateOffsetString(1);
const dayAfterTomorrow = getDateOffsetString(2);

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    customerId: 'cli-1',
    customerName: 'Lucas Gabriel Albuquerque',
    customerPhone: '(11) 99123-4567',
    customerEmail: 'lucas.albuquerque@gmail.com',
    professionalId: 'pro-1',
    professionalName: 'Carlos Mendes',
    serviceId: 'srv-3',
    serviceName: 'Combo Dom Pedro (Corte + Barba)',
    price: 110.0,
    durationMinutes: 80,
    date: today,
    startTime: '09:00',
    endTime: '10:20',
    status: 'COMPLETED',
    notes: 'Cliente chegou pontualmente. Finalizado com sucesso.',
    createdAt: `${yesterday} 14:00`
  },
  {
    id: 'apt-2',
    customerId: 'cli-2',
    customerName: 'Guilherme Rocha Lima',
    customerPhone: '(11) 99234-5678',
    customerEmail: 'guilherme.rocha@outlook.com',
    professionalId: 'pro-2',
    professionalName: 'Rafael Silveira',
    serviceId: 'srv-1',
    serviceName: 'Corte Cabelo Executivo',
    price: 65.0,
    durationMinutes: 45,
    date: today,
    startTime: '10:30',
    endTime: '11:15',
    status: 'IN_PROGRESS',
    notes: 'Degrade baixo nas laterais.',
    createdAt: `${yesterday} 16:30`
  },
  {
    id: 'apt-3',
    customerId: 'cli-4',
    customerName: 'Thiago Henrique Neves',
    customerPhone: '(11) 99456-7890',
    customerEmail: 'thiago.neves@gmail.com',
    professionalId: 'pro-1',
    professionalName: 'Carlos Mendes',
    serviceId: 'srv-2',
    serviceName: 'Barba Terapia com Toalha Quente',
    price: 55.0,
    durationMinutes: 40,
    date: today,
    startTime: '14:00',
    endTime: '14:40',
    status: 'CONFIRMED',
    notes: 'Lembrete enviado via WhatsApp.',
    createdAt: `${yesterday} 18:20`
  },
  {
    id: 'apt-4',
    customerId: 'cli-6',
    customerName: 'Matheus Brandão',
    customerPhone: '(11) 99678-9012',
    customerEmail: 'matheus.brandao@tech.io',
    professionalId: 'pro-3',
    professionalName: 'Dra. Beatriz Fontana',
    serviceId: 'srv-5',
    serviceName: 'Limpeza de Pele Express',
    price: 90.0,
    durationMinutes: 50,
    date: today,
    startTime: '15:30',
    endTime: '16:20',
    status: 'CONFIRMED',
    notes: 'Primeira sessão facial.',
    createdAt: `${today} 08:15`
  },
  {
    id: 'apt-5',
    customerId: 'cli-3',
    customerName: 'Felipe Santana Martins',
    customerPhone: '(11) 99345-6789',
    customerEmail: 'felipe.martins@hotmail.com',
    professionalId: 'pro-2',
    professionalName: 'Rafael Silveira',
    serviceId: 'srv-1',
    serviceName: 'Corte Cabelo Executivo',
    price: 65.0,
    durationMinutes: 45,
    date: today,
    startTime: '17:00',
    endTime: '17:45',
    status: 'PENDING',
    notes: 'Agendado online pelo link público.',
    createdAt: `${today} 09:30`,
    isPublicBooking: true
  },
  {
    id: 'apt-6',
    customerId: 'cli-1',
    customerName: 'Lucas Gabriel Albuquerque',
    customerPhone: '(11) 99123-4567',
    professionalId: 'pro-1',
    professionalName: 'Carlos Mendes',
    serviceId: 'srv-1',
    serviceName: 'Corte Cabelo Executivo',
    price: 65.0,
    durationMinutes: 45,
    date: tomorrow,
    startTime: '10:00',
    endTime: '10:45',
    status: 'CONFIRMED',
    createdAt: `${today} 10:00`
  },
  {
    id: 'apt-7',
    customerId: 'cli-2',
    customerName: 'Guilherme Rocha Lima',
    customerPhone: '(11) 99234-5678',
    professionalId: 'pro-2',
    professionalName: 'Rafael Silveira',
    serviceId: 'srv-3',
    serviceName: 'Combo Dom Pedro (Corte + Barba)',
    price: 110.0,
    durationMinutes: 80,
    date: tomorrow,
    startTime: '14:30',
    endTime: '15:50',
    status: 'CONFIRMED',
    createdAt: `${today} 11:20`
  },
  {
    id: 'apt-8',
    customerId: 'cli-4',
    customerName: 'Thiago Henrique Neves',
    customerPhone: '(11) 99456-7890',
    professionalId: 'pro-3',
    professionalName: 'Dra. Beatriz Fontana',
    serviceId: 'srv-4',
    serviceName: 'Camuflagem de Fios Brancos',
    price: 75.0,
    durationMinutes: 30,
    date: dayAfterTomorrow,
    startTime: '11:00',
    endTime: '11:30',
    status: 'CONFIRMED',
    createdAt: `${today} 11:45`
  }
];
