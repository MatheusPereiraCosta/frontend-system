export interface WorkingHour {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  dayName: string;
  enabled: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "19:00"
  breakStart?: string; // "12:00"
  breakEnd?: string;   // "13:00"
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  rating: number;
  totalAppointments: number;
  active: boolean;
  serviceIds: string[];
  workingHours: WorkingHour[];
}
