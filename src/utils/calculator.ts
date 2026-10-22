import type {
  DayItem,
  DayTypeConfig,
  DayTypeKey,
  ExtraIncomeItem,
  PeriodInfo,
  PayRecord,
  UserSettings,
  CalculationStats,
} from '../types/index.ts';

export const TH_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
export const TH_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];
export const TH_FULL_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const DEFAULT_SETTINGS: UserSettings = {
  rate: 412,
  hours: 8,
  holMult: 2,
  sso: 5,
  ssoCap: 750,
  tax: 0,
  oth: 0,
  othName: 'หักอื่นๆ',
  ssoBase: 'wage',
  qName: 'Incentive Audit',
  qAmt: 250,
};

/**
 * Configuration for each day type.
 * CRITICAL UPDATE PER USER REQUIREMENT:
 * "แก้ไข เมื่อมีการเลือกวันหยุดประจำสัปดาห์ จะไม่ได้ค่าแรงของวันนั้น"
 * -> holiday (วันหยุดประจำสัปดาห์): pay = 0, defaultMult = 0 (ไม่ได้ค่าแรง)
 */
export const DAY_TYPES: Record<DayTypeKey, DayTypeConfig> = {
  work: {
    key: 'work',
    label: '✅ วันทำงานปกติ',
    shortLabel: 'ทำงานปกติ',
    pay: 1,
    defaultMult: 1,
    description: 'ได้รับค่าแรงเต็มวัน (1 เท่า) และนำไปคำนวณประกันสังคม',
  },
  pubwork: {
    key: 'pubwork',
    label: '🎌 นักขัตฤกษ์ (มาทำงาน)',
    shortLabel: 'นักขัตฤกษ์ (ทำงาน)',
    pay: 1,
    defaultMult: null, // Uses settings.holMult (e.g. 2x)
    description: 'ทำงานวันหยุดนักขัตฤกษ์ รับค่าแรงพิเศษตามตัวคูณ (ได้ค่าแรงแต่ไม่นำมาคิดประกันสังคม)',
  },
  puboff: {
    key: 'puboff',
    label: '🎏 นักขัตฤกษ์ (หยุด)',
    shortLabel: 'นักขัตฤกษ์ (หยุด)',
    pay: 1,
    defaultMult: 1,
    description: 'หยุดตามประเพณี ได้รับค่าจ้าง 1 เท่า (ได้ค่าแรงแต่ไม่นำมาคิดประกันสังคม)',
  },
  holiday: {
    key: 'holiday',
    label: '🏖️ วันหยุดประจำสัปดาห์ (0 หน่วยวัน/ไม่ได้ค่าแรง)',
    shortLabel: 'วันหยุดประจำสัปดาห์ (0 หน่วยวัน)',
    pay: 0,
    defaultMult: 0,
    description: 'วันหยุดประจำสัปดาห์ = ไม่ได้ค่าแรง (0 หน่วยวัน)',
  },
  sick: {
    key: 'sick',
    label: '🤒 ลาป่วย (ได้เงิน)',
    shortLabel: 'ลาป่วย',
    pay: 1,
    defaultMult: 1,
    description: 'ลาป่วยตามสิทธิ์ที่กฎหมายกำหนด ได้รับค่าจ้าง',
  },
  personal: {
    key: 'personal',
    label: '📄 ลากิจ (ได้เงิน)',
    shortLabel: 'ลากิจ',
    pay: 1,
    defaultMult: 1,
    description: 'ลากิจธุระจำเป็นตามสิทธิ์ ได้รับค่าจ้าง',
  },
  annual: {
    key: 'annual',
    label: '🌴 ลาพักร้อน',
    shortLabel: 'พักร้อน',
    pay: 1,
    defaultMult: 1,
    description: 'วันหยุดพักผ่อนประจำปี ได้รับค่าจ้าง',
  },
  absent: {
    key: 'absent',
    label: '❌ ขาดงาน (ไม่ได้รับค่าจ้าง)',
    shortLabel: 'ขาดงาน',
    pay: 0,
    defaultMult: 0,
    description: 'ไม่มาทำงานโดยไม่แจ้งล่วงหน้า ถูกตัดค่าจ้าง',
  },
  unpaid: {
    key: 'unpaid',
    label: '⛔ ลาไม่รับค่าจ้าง',
    shortLabel: 'ลาไม่รับค่าจ้าง',
    pay: 0,
    defaultMult: 0,
    description: 'ลากิจเกินสิทธิ์หรือลาหยุดโดยไม่รับเงิน',
  },
  none: {
    key: 'none',
    label: '— ไม่มีข้อมูล',
    shortLabel: 'ไม่มีข้อมูล',
    pay: 0,
    defaultMult: 0,
    description: 'ยังไม่ได้ระบุสถานะ',
  },
};

/**
 * Format currency to Thai Baht representation
 */
export function formatMoney(val: number | undefined | null): string {
  const n = typeof val === 'number' && !isNaN(val) ? val : 0;
  return n.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Generate period information based on Year, Month, and Half
 * Half 1: Days 1–15, Pay Date = Day 20 of current month
 * Half 2: Days 16–End of month, Pay Date = Day 5 of next month
 */
export function generatePeriodInfo(year: number, month: number, half: 1 | 2): PeriodInfo {
  const lastDay = new Date(year, month, 0).getDate();
  const startDay = half === 1 ? 1 : 16;
  const endDay = half === 1 ? 15 : lastDay;

  const payDateObj = half === 1 ? new Date(year, month - 1, 20) : new Date(year, month, 5);

  const pad = (n: number) => String(n).padStart(2, '0');
  const monthPad = pad(month);
  const payMonth = payDateObj.getMonth() + 1;
  const payYear = payDateObj.getFullYear();

  const key = `${year}-${monthPad}-H${half}`;
  const label = `${startDay}–${endDay} ${TH_MONTHS[month - 1]} ${year + 543}`;
  const payDate = `${payYear}-${pad(payMonth)}-${pad(payDateObj.getDate())}`;
  const payLabel = `${payDateObj.getDate()} ${TH_MONTHS[payMonth - 1]} ${payYear + 543}`;
  const payMonthKey = `${payYear}-${pad(payMonth)}`;

  return {
    y: year,
    m: month,
    half,
    startDay,
    endDay,
    key,
    label,
    payDate,
    payLabel,
    payMonthKey,
  };
}

/**
 * Generate initial days list for a period
 */
export function generateInitialDays(period: PeriodInfo): DayItem[] {
  const days: DayItem[] = [];
  const pad = (n: number) => String(n).padStart(2, '0');

  for (let d = period.startDay; d <= period.endDay; d++) {
    const dt = new Date(period.y, period.m - 1, d);
    const dow = dt.getDay();
    const dateStr = `${period.y}-${pad(period.m)}-${pad(d)}`;
    days.push({
      d,
      dow,
      dateStr,
      type: 'work',
      unpaidHours: 0,
    });
  }

  return days;
}

/**
 * Calculate salary and deduction totals
 * USER REQUIREMENTS ENFORCED:
 * 1. วันหยุดประจำสัปดาห์ = ไม่ได้ค่าแรง (0 หน่วยวัน)
 * 2. วันนักขัตฤกษ์ ได้ค่าแรงแต่ ไม่นำมาคิดประกันสังคม
 */
export function calculatePayroll(
  period: PeriodInfo,
  days: DayItem[],
  settings: UserSettings,
  extras: ExtraIncomeItem[],
  imgUrl?: string | null,
  existingId?: string,
): PayRecord {
  let work = 0;
  let pubW = 0;
  let pubO = 0;
  let holiday = 0;
  let sick = 0;
  let personal = 0;
  let annual = 0;
  let absent = 0;
  let unpaid = 0;
  let unHr = 0;
  let wageUnits = 0;
  let ssoWageUnits = 0; // Units subject to Social Security (excludes public holidays)
  let ssoUnHr = 0;      // Unpaid hours on SSO-eligible days
  let pubWageUnits = 0; // Units from public holidays (exempt from SSO)
  let pubUnHr = 0;      // Unpaid hours on public holidays

  days.forEach((day) => {
    const t = day.type;
    const dayUnHr = Math.max(0, day.unpaidHours || 0);

    switch (t) {
      case 'work':
        work++;
        wageUnits += 1;
        ssoWageUnits += 1;
        ssoUnHr += dayUnHr;
        unHr += dayUnHr;
        break;
      case 'pubwork':
        pubW++;
        wageUnits += settings.holMult;
        pubWageUnits += settings.holMult;
        // ได้ค่าแรงแต่ ไม่นำมาคิดประกันสังคม
        pubUnHr += dayUnHr;
        unHr += dayUnHr;
        break;
      case 'puboff':
        pubO++;
        wageUnits += 1;
        pubWageUnits += 1;
        // ได้ค่าแรงแต่ ไม่นำมาคิดประกันสังคม
        pubUnHr += dayUnHr;
        unHr += dayUnHr;
        break;
      case 'holiday':
        // วันหยุดประจำสัปดาห์ = ไม่ได้ค่าแรง (0 หน่วยวัน)
        holiday++;
        // 0 wage units, 0 sso units
        break;
      case 'sick':
        sick++;
        wageUnits += 1;
        ssoWageUnits += 1;
        ssoUnHr += dayUnHr;
        unHr += dayUnHr;
        break;
      case 'personal':
        personal++;
        wageUnits += 1;
        ssoWageUnits += 1;
        ssoUnHr += dayUnHr;
        unHr += dayUnHr;
        break;
      case 'annual':
        annual++;
        wageUnits += 1;
        ssoWageUnits += 1;
        ssoUnHr += dayUnHr;
        unHr += dayUnHr;
        break;
      case 'absent':
        absent++;
        break;
      case 'unpaid':
      case 'none':
        unpaid++;
        break;
    }
  });

  const paidDays = work + pubW + pubO + sick + personal + annual;
  const hourRate = settings.rate / (settings.hours || 8);
  const unpaidCut = Number((unHr * hourRate).toFixed(2));
  const ssoUnpaidCut = Number((ssoUnHr * hourRate).toFixed(2));
  const pubUnpaidCut = Number((pubUnHr * hourRate).toFixed(2));

  // Base wage = (wage units * rate) - unpaid hour deductions
  const wage = Math.max(0, Number((wageUnits * settings.rate - unpaidCut).toFixed(2)));
  const pubWage = Math.max(0, Number((pubWageUnits * settings.rate - pubUnpaidCut).toFixed(2)));
  // Wage eligible for SSO calculation (excludes public holiday wage)
  const ssoWage = Math.max(0, Number((ssoWageUnits * settings.rate - ssoUnpaidCut).toFixed(2)));

  const validExtras = extras
    .filter((e) => (e.amt || 0) > 0)
    .map((e) => ({
      id: e.id || Math.random().toString(36).substring(2, 9),
      name: e.name.trim() || 'รายได้เพิ่มเติม',
      amt: Number(e.amt) || 0,
    }));

  const extraSum = Number(validExtras.reduce((sum, item) => sum + item.amt, 0).toFixed(2));
  const gross = Number((wage + extraSum).toFixed(2));

  // Social security calculation:
  // "วันนักขัตฤกษ์ ได้ค่าแรงแต่ ไม่นำมาคิดประกันสังคม" -> Base must exclude pubWage
  const ssoBaseAmount = settings.ssoBase === 'all'
    ? Math.max(0, Number((ssoWage + extraSum).toFixed(2)))
    : ssoWage;

  let sso = Math.round(ssoBaseAmount * ((settings.sso || 0) / 100));
  if (settings.ssoCap > 0) {
    sso = Math.min(sso, settings.ssoCap);
  }

  const tax = Number((settings.tax || 0).toFixed(2));
  const oth = Number((settings.oth || 0).toFixed(2));
  const ded = Number((sso + tax + oth).toFixed(2));
  const net = Number((gross - ded).toFixed(2));

  // Potential lost income from absences
  const lostAbs = Number((absent * settings.rate).toFixed(2));
  // Extra bonus gained from working on public holidays
  const pubBonus = Number((pubW * (settings.holMult - 1) * settings.rate).toFixed(2));

  const stats: CalculationStats = {
    work,
    pubW,
    pubO,
    holiday,
    sick,
    personal,
    annual,
    absent,
    unpaid,
    paidDays,
    unpaidHours: unHr,
    wageUnits: Number(wageUnits.toFixed(2)),
    ssoWageUnits: Number(ssoWageUnits.toFixed(2)),
  };

  const now = new Date().toISOString();

  return {
    id: existingId || `pay-${period.key}-${Date.now()}`,
    key: period.key,
    period,
    settings: { ...settings },
    days: JSON.parse(JSON.stringify(days)),
    stats,
    wage,
    pubWage,
    unpaidCut,
    extras: validExtras,
    extraSum,
    gross,
    sso,
    ssoBaseAmount,
    tax,
    oth,
    othName: settings.othName || 'หักอื่นๆ',
    ded,
    net,
    lostAbs,
    pubBonus,
    imgUrl: imgUrl ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Compare two pay records and compute differences
 */
export function comparePayRecords(a: PayRecord, b: PayRecord) {
  const netDiff = Number((b.net - a.net).toFixed(2));
  const grossDiff = Number((b.gross - a.gross).toFixed(2));
  const wageDiff = Number((b.wage - a.wage).toFixed(2));
  const dedDiff = Number((b.ded - a.ded).toFixed(2));
  const workDaysDiff = b.stats.work - a.stats.work;
  const pubWDiff = b.stats.pubW - a.stats.pubW;
  const absDiff = b.stats.absent - a.stats.absent;

  return {
    netDiff,
    grossDiff,
    wageDiff,
    dedDiff,
    workDaysDiff,
    pubWDiff,
    absDiff,
  };
}
