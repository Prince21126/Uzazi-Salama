export type HealthStatus = 'stable' | 'warning' | 'critical';
export type Language = 'FR' | 'SW' | 'MSH';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  lastPeriodDate: string; // ISO string
  dueDate: string; // ISO string
  weeksPregnant: number;
  assignedHospitalId: string;
}

export interface CheckupLog {
  id: string;
  patientId: string;
  date: string;
  symptoms: string[];
  status: HealthStatus;
  bloodPressure?: string;
  weight?: number;
  notes?: string;
  aiAnalysis?: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  emergencyContact: string;
}

export interface EducationalContent {
  id: string;
  category: 'nutrition' | 'exercise' | 'warning_signs' | 'baby_growth' | 'hygiene' | 'mental_health';
  imageUrl?: string;
  trimester?: 1 | 2 | 3; // 1: weeks 1-13, 2: weeks 14-26, 3: weeks 27-40
  translations: {
    [key in Language]: {
      title: string;
      content: string;
    }
  };
}
