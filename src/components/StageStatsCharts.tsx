import { useMemo } from 'react';
import { getOrderedStages, isBoy, isGirl, type StudentLike } from '../utils/studentUtils';

interface StageStatsChartsProps {
  students: StudentLike[];
}

function DonutChart({ boys, girls, stage }: { boys: number; girls: number; stage: string }) {
  const total = boys + girls;
  const boysPct = total > 0 ? Math.round((boys / total) * 100) : 0;
  const girlsPct = total > 0 ? 100 - boysPct : 0;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const boysLength = total > 0 ? (boys / total) * circumference : 0;
  const girlsLength = total > 0 ? (girls / total) * circumference : 0;

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/20 border border-gray-50 p-5 flex flex-col items-center">
      <h4 className="text-sm font-bold text-gray-800 text-center mb-4 leading-snug" dir="rtl">
        {stage}
      </h4>

      <div className="relative w-28 h-28">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
          {total > 0 && (
            <>
              <circle
                cx="44"
                cy="44"
                r={radius}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="10"
                strokeDasharray={`${boysLength} ${circumference - boysLength}`}
                strokeLinecap="round"
              />
              <circle
                cx="44"
                cy="44"
                r={radius}
                fill="none"
                stroke="#ec4899"
                strokeWidth="10"
                strokeDasharray={`${girlsLength} ${circumference - girlsLength}`}
                strokeDashoffset={-boysLength}
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-gray-900">{total}</span>
          <span className="text-[10px] font-bold text-gray-400">طالب</span>
        </div>
      </div>

      <div className="mt-4 w-full space-y-2" dir="rtl">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            ولاد
          </span>
          <span className="font-black text-blue-600">
            {boys} ({boysPct}%)
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            بنات
          </span>
          <span className="font-black text-pink-600">
            {girls} ({girlsPct}%)
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StageStatsCharts({ students }: StageStatsChartsProps) {
  const stageStats = useMemo(() => {
    const stages = getOrderedStages(students);
    return stages.map((stage) => {
      const stageStudents = students.filter((s) => (s.stage || '').trim() === stage);
      return {
        stage,
        boys: stageStudents.filter((s) => isBoy(s.gender)).length,
        girls: stageStudents.filter((s) => isGirl(s.gender)).length,
      };
    });
  }, [students]);

  if (stageStats.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-black text-gray-900" dir="rtl">
          نسبة البنين والبنات حسب المرحلة
        </h3>
        <p className="text-sm text-gray-400 font-medium" dir="rtl">
          بناءً على نتائج الفلتر الحالي
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stageStats.map(({ stage, boys, girls }) => (
          <DonutChart key={stage} stage={stage} boys={boys} girls={girls} />
        ))}
      </div>
    </div>
  );
}
