export type DayTypeKey =
  | 'work'
  | 'pubwork'
  | 'puboff'
  | 'holiday'
  | 'sick'
  | 'personal'
  | 'annual'
  | 'absent'
  | 'unpaid'
  | 'none';

export interface DayTypeConfig {
  key: DayTypeKey;
  label: string;
  shortLabel: string;
  pay: number; // 0 or 1
  defaultMult: number | null; // null means use settings multiplier
  description: string;
}

export interface DayItem {
  d: number;
  dow: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  dateStr: string; // YYYY-MM-DD
  type: DayTypeKey;
  unpaidHours: number; // Hours unpaid (deducted from wage)
  notes?: string;
}

export interface ExtraIncomeItem {
  id: string;
  name: string;
  amt: number;
}

export interface UserSettings {
  rate: number; // Daily wage e.g. 412
  hours: number; // Hours per workday e.g. 8
  holMult: number; // Holiday work multiplier e.g. 2
  sso: number; // Social security % e.g. 5
  ssoCap: number; // Max SSO ceiling per period e.g. 750 (or 375 for half-month)
  tax: number; // Withholding tax per period e.g. 0
  oth: number; // Other deductions e.g. 0
  othName: string; // Name of other deductions e.g. ค่าชุดฟอร์ม
  ssoBase: 'wage' | 'all'; // Calculate SSO from wage only or total gross
  qName: string; // Quick extra income label e.g. Incentive Audit
  qAmt: number; // Quick extra income amount e.g. 250
}

export interface PeriodInfo {
  y: number;
  m: number;
  half: 1 | 2; // 1 = 1-15 (pay on 20), 2 = 16-end (pay on 5 next month)
  startDay: number;
  endDay: number;
  key: string; // e.g. 2026-10-H1
  label: string; // e.g. 1–15 ต.ค. 2569
  payDate: string; // YYYY-MM-DD
  payLabel: string; // e.g. 20 ต.ค. 2569
  payMonthKey: string; // e.g. 2026-10
}

export interface CalculationStats {
  work: number;
  pubW: number;
  pubO: number;
  holiday: number; // Total weekly holidays (0 wage units)
  sick: number;
  personal: number;
  annual: number;
  absent: number;
  unpaid: number;
  paidDays: number;
  unpaidHours: number;
  wageUnits: number; // Total units of daily rate
  ssoWageUnits?: number; // Wage units subject to SSO (excludes public holidays)
}

export interface PayRecord {
  id: string;
  key: string;
  period: PeriodInfo;
  settings: UserSettings;
  days: DayItem[];
  stats: CalculationStats;
  wage: number;
  pubWage?: number; // Wage from public holidays
  unpaidCut: number;
  extras: ExtraIncomeItem[];
  extraSum: number;
  gross: number;
  sso: number;
  ssoBaseAmount?: number; // Wage base used for SSO (excludes public holidays)
  tax: number;
  oth: number;
  othName: string;
  ded: number;
  net: number;
  lostAbs: number;
  pubBonus: number;
  imgUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  provider: 'google' | 'local' | 'guest';
}
