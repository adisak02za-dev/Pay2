import React, { useEffect, useRef } from 'react';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  DoughnutController,
  BarController,
  LineController,
} from 'chart.js';
import { CalculationStats, PayRecord } from '../types';
import { formatMoney } from '../utils/calculator';

// Register necessary Chart.js components
Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  DoughnutController,
  BarController,
  LineController
);

interface RealTimeChartsProps {
  currentRecord: PayRecord | null;
  historyRecords: PayRecord[];
  isDark: boolean;
}

export const RealTimeCharts: React.FC<RealTimeChartsProps> = ({
  currentRecord,
  historyRecords,
  isDark,
}) => {
  const doughnutRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);
  const trendRef = useRef<HTMLCanvasElement | null>(null);

  const doughnutChart = useRef<Chart | null>(null);
  const barChart = useRef<Chart | null>(null);
  const trendChart = useRef<Chart | null>(null);

  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

  // 1. Doughnut Chart: Financial distribution for current calculation
  useEffect(() => {
    if (!doughnutRef.current || !currentRecord) return;

    if (doughnutChart.current) {
      doughnutChart.current.destroy();
    }

    const { wage, extraSum, sso, tax, oth, net } = currentRecord;

    const labels = [
      'เงินได้สุทธิ (Net)',
      'ประกันสังคม (SSO)',
      'ภาษีหัก ณ ที่จ่าย',
      ...(oth > 0 ? [currentRecord.othName || 'หักอื่นๆ'] : []),
    ];

    const data = [
      net,
      sso,
      tax,
      ...(oth > 0 ? [oth] : []),
    ];

    const backgroundColors = [
      '#10b981', // green net
      '#ef4444', // red sso
      '#f59e0b', // amber tax
      ...(oth > 0 ? ['#ec4899'] : []),
    ];

    doughnutChart.current = new Chart(doughnutRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: backgroundColors,
            borderColor: isDark ? '#1e293b' : '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              boxWidth: 12,
              padding: 12,
              font: {
                family: 'IBM Plex Sans Thai',
                size: 11,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = Number(context.raw) || 0;
                return ` ${context.label}: ${formatMoney(val)} ฿`;
              },
            },
          },
        },
        cutout: '68%',
      },
    });

    return () => {
      if (doughnutChart.current) {
        doughnutChart.current.destroy();
      }
    };
  }, [currentRecord, isDark, textColor]);

  // 2. Bar Chart: Day status breakdown
  useEffect(() => {
    if (!barRef.current || !currentRecord) return;

    if (barChart.current) {
      barChart.current.destroy();
    }

    const st: CalculationStats = currentRecord.stats;

    const labels = [
      'วันทำงาน',
      'นักขัตฤกษ์',
      'หยุดสัปดาห์ (0฿)',
      'ลาป่วย/ลากิจ',
      'ขาดงาน',
    ];

    const data = [
      st.work,
      st.pubW + st.pubO,
      st.holiday,
      st.sick + st.personal + st.annual,
      st.absent,
    ];

    const bgColors = [
      '#3b82f6', // blue work
      '#eab308', // yellow pub holiday
      '#94a3b8', // slate weekly holiday (unpaid)
      '#10b981', // green paid leave
      '#ef4444', // red absent
    ];

    barChart.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'จำนวนวัน',
            data,
            backgroundColor: bgColors,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: textColor,
              font: { family: 'IBM Plex Sans Thai', size: 10 },
            },
            grid: { display: false },
          },
          y: {
            ticks: {
              color: textColor,
              precision: 0,
              font: { family: 'JetBrains Mono', size: 10 },
            },
            grid: { color: gridColor },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.raw} วัน`,
            },
          },
        },
      },
    });

    return () => {
      if (barChart.current) {
        barChart.current.destroy();
      }
    };
  }, [currentRecord, isDark, textColor, gridColor]);

  // 3. Line Chart: Historical trend across saved periods
  useEffect(() => {
    if (!trendRef.current || !historyRecords || historyRecords.length === 0) return;

    if (trendChart.current) {
      trendChart.current.destroy();
    }

    // Sort chronologically
    const sorted = [...historyRecords].sort((a, b) =>
      a.period.payDate > b.period.payDate ? 1 : -1
    ).slice(-6); // last 6 periods

    const labels = sorted.map((r) => r.period.label.replace(' 2569', ''));
    const netData = sorted.map((r) => r.net);
    const grossData = sorted.map((r) => r.gross);

    trendChart.current = new Chart(trendRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'รับสุทธิ (Net)',
            data: netData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
          },
          {
            label: 'รวมรายได้ (Gross)',
            data: grossData,
            borderColor: '#3b82f6',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            tension: 0.35,
            pointRadius: 3,
            pointBackgroundColor: '#3b82f6',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: textColor,
              font: { family: 'IBM Plex Sans Thai', size: 10 },
            },
            grid: { display: false },
          },
          y: {
            ticks: {
              color: textColor,
              font: { family: 'JetBrains Mono', size: 10 },
              callback: (v) => `${Number(v).toLocaleString()}฿`,
            },
            grid: { color: gridColor },
            beginAtZero: false,
          },
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              font: { family: 'IBM Plex Sans Thai', size: 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${formatMoney(Number(ctx.raw))} ฿`,
            },
          },
        },
      },
    });

    return () => {
      if (trendChart.current) {
        trendChart.current.destroy();
      }
    };
  }, [historyRecords, isDark, textColor, gridColor]);

  if (!currentRecord) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      {/* Chart 1: Donut breakdown */}
      <div
        className={`p-4 rounded-2xl border transition-colors shadow-sm flex flex-col ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span>🥧</span> สัดส่วนรายได้และเงินหัก
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
            สุทธิ {formatMoney(currentRecord.net)} ฿
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">สรุปการกระจายตัวของเงินในงวดนี้</p>
        <div className="h-48 w-full relative">
          <canvas ref={doughnutRef} />
        </div>
      </div>

      {/* Chart 2: Days distribution */}
      <div
        className={`p-4 rounded-2xl border transition-colors shadow-sm flex flex-col ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span>📊</span> จำแนกประเภทวันทำงาน
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
            {currentRecord.stats.paidDays} วันจ่ายเงิน
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          วันหยุดประจำสัปดาห์ไม่มีค่าจ้าง (0 บาท)
        </p>
        <div className="h-48 w-full relative">
          <canvas ref={barRef} />
        </div>
      </div>

      {/* Chart 3: Historical Trend */}
      <div
        className={`p-4 rounded-2xl border transition-colors shadow-sm flex flex-col col-span-1 md:col-span-2 lg:col-span-1 ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span>📈</span> แนวโน้มรายได้ต่องวด
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-medium">
            {historyRecords.length} งวดที่บันทึก
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">เปรียบเทียบความเคลื่อนไหวล่าสุด</p>
        <div className="h-48 w-full relative">
          {historyRecords.length > 0 ? (
            <canvas ref={trendRef} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
              <span>บันทึกงวดนี้เพื่อดูกราฟเปรียบเทียบแนวโน้ม</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
