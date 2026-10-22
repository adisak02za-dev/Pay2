import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePayroll,
  generatePeriodInfo,
  generateInitialDays,
  DEFAULT_SETTINGS,
  DAY_TYPES,
} from './calculator.ts';
import type { DayItem } from '../types/index.ts';

test('Weekly holiday (holiday) yields 0 wage and 0 units per user requirement', () => {
  const period = generatePeriodInfo(2026, 10, 1);
  const settings = { ...DEFAULT_SETTINGS, rate: 400 };

  // Create 15 days: 10 work days and 5 weekly holidays
  const days: DayItem[] = [];
  for (let i = 1; i <= 15; i++) {
    days.push({
      d: i,
      dow: (i % 7),
      dateStr: `2026-10-${String(i).padStart(2, '0')}`,
      type: i % 3 === 0 ? 'holiday' : 'work', // 5 holidays (day 3, 6, 9, 12, 15) and 10 work days
      unpaidHours: 0,
    });
  }

  const record = calculatePayroll(period, days, settings, []);

  // 10 work days = 10 units = 10 * 400 = 4,000 Baht
  // 5 weekly holidays = 0 units = 0 Baht (NOT paid)
  assert.equal(record.stats.holiday, 5);
  assert.equal(record.stats.work, 10);
  assert.equal(record.stats.wageUnits, 10);
  assert.equal(record.wage, 4000);
  assert.equal(DAY_TYPES.holiday.pay, 0);
  assert.equal(DAY_TYPES.holiday.defaultMult, 0);
});

test('Public holiday (pubwork) multiplies daily rate as configured', () => {
  const period = generatePeriodInfo(2026, 10, 1);
  const settings = { ...DEFAULT_SETTINGS, rate: 400, holMult: 2.5 };

  const days: DayItem[] = [
    { d: 1, dow: 1, dateStr: '2026-10-01', type: 'work', unpaidHours: 0 },
    { d: 2, dow: 2, dateStr: '2026-10-02', type: 'pubwork', unpaidHours: 0 }, // 2.5 units
    { d: 3, dow: 3, dateStr: '2026-10-03', type: 'holiday', unpaidHours: 0 }, // 0 units
  ];

  const record = calculatePayroll(period, days, settings, []);

  // Total units = 1 (work) + 2.5 (pubwork) + 0 (holiday) = 3.5 units
  // Wage = 3.5 * 400 = 1,400 Baht
  assert.equal(record.stats.wageUnits, 3.5);
  assert.equal(record.wage, 1400);
});

test('Unpaid hours deduction calculates accurately', () => {
  const period = generatePeriodInfo(2026, 10, 1);
  const settings = { ...DEFAULT_SETTINGS, rate: 400, hours: 8 }; // 50 Baht/hour

  const days: DayItem[] = [
    { d: 1, dow: 1, dateStr: '2026-10-01', type: 'work', unpaidHours: 2 }, // deduct 2 * 50 = 100 Baht
    { d: 2, dow: 2, dateStr: '2026-10-02', type: 'work', unpaidHours: 0 },
  ];

  const record = calculatePayroll(period, days, settings, []);

  // Units = 2 * 400 = 800. Unpaid cut = 100. Base wage = 700
  assert.equal(record.unpaidCut, 100);
  assert.equal(record.wage, 700);
});

test('Social security (SSO) applies cap and computes net salary correctly', () => {
  const period = generatePeriodInfo(2026, 10, 1);
  const settings = {
    ...DEFAULT_SETTINGS,
    rate: 1000,
    sso: 5,
    ssoCap: 750,
    tax: 100,
    oth: 50,
  };

  const days: DayItem[] = [
    { d: 1, dow: 1, dateStr: '2026-10-01', type: 'work', unpaidHours: 0 },
    { d: 2, dow: 2, dateStr: '2026-10-02', type: 'work', unpaidHours: 0 },
  ]; // Wage = 2,000

  const extras = [{ id: '1', name: 'Incentive', amt: 500 }];
  const record = calculatePayroll(period, days, settings, extras);

  // Gross = 2000 + 500 = 2500
  // SSO 5% of 2000 = 100 (below 750 cap)
  // Deductions = 100 + 100 + 50 = 250
  // Net = 2500 - 250 = 2250
  assert.equal(record.gross, 2500);
  assert.equal(record.sso, 100);
  assert.equal(record.ded, 250);
  assert.equal(record.net, 2250);
});

test('Period generation sets correct pay dates for 1st and 2nd half', () => {
  const p1 = generatePeriodInfo(2026, 10, 1);
  assert.equal(p1.startDay, 1);
  assert.equal(p1.endDay, 15);
  assert.equal(p1.payDate, '2026-10-20');

  const p2 = generatePeriodInfo(2026, 10, 2);
  assert.equal(p2.startDay, 16);
  assert.equal(p2.endDay, 31); // October has 31 days
  assert.equal(p2.payDate, '2026-11-05'); // Pay date is 5th of next month
});

test('Public holidays earn wage but are strictly excluded from SSO calculation', () => {
  const period = generatePeriodInfo(2026, 10, 1);
  const settings = {
    ...DEFAULT_SETTINGS,
    rate: 500,
    holMult: 2,
    sso: 5,
    ssoCap: 750,
  };

  const days: DayItem[] = [
    { d: 1, dow: 1, dateStr: '2026-10-01', type: 'work', unpaidHours: 0 },    // 500 Baht (SSO eligible)
    { d: 2, dow: 2, dateStr: '2026-10-02', type: 'pubwork', unpaidHours: 0 }, // 2x = 1000 Baht (NOT SSO eligible)
    { d: 3, dow: 3, dateStr: '2026-10-03', type: 'puboff', unpaidHours: 0 },  // 1x = 500 Baht (NOT SSO eligible)
    { d: 4, dow: 4, dateStr: '2026-10-04', type: 'holiday', unpaidHours: 0 }, // 0 units = 0 Baht
  ];

  const record = calculatePayroll(period, days, settings, []);

  // Total wage = 500 + 1000 + 500 = 2000 Baht
  assert.equal(record.wage, 2000);
  assert.equal(record.pubWage, 1500);

  // SSO base amount must be ONLY regular wage (500 Baht), NOT total wage (2000 Baht)
  assert.equal(record.ssoBaseAmount, 500);
  // SSO = 500 * 5% = 25 Baht (NOT 2000 * 5% = 100 Baht)
  assert.equal(record.sso, 25);
  // Net = 2000 - 25 = 1975 Baht
  assert.equal(record.net, 1975);
});

