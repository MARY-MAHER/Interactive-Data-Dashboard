import { useState } from 'react';
import { Search, Edit2, Trash2, Loader, Download, History } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ArchiveModal } from './ArchiveModal';
import type { StudentFilters } from './Dashboard';
import { getGenderLabel, isBoy } from '../utils/studentUtils';

interface Student {
  id: string;
  firstName: string; 
  secondName: string;
  thirdName: string;
  stage: string;
  gender: string;
  phone: string; 
  street: string;
  father?: string;
  address?: string;
  school: string;
  status: string;
  child_dob?: string;
  notes?: string;
}

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onRefresh: () => void;
  canManageStudents?: boolean;
  filters: StudentFilters;
  onFilterChange: (key: keyof StudentFilters, value: string) => void;
  stages: string[];
  streets: string[];
}

export default function StudentTable({
  students,
  loading,
  onEdit,
  onDelete,
  onRefresh,
  canManageStudents = true,
  filters,
  onFilterChange,
  stages,
  streets,
}: StudentTableProps) {
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const handleExport = () => {
    const dataToExport = students.map((student) => ({
      'الاسم بالكامل': `${student.firstName} ${student.secondName} ${student.thirdName}`, 
      'المرحلة': student.stage,
      'النوع': getGenderLabel(student.gender),
      'الشارع': student.street,
      'العنوان التفصيلي': student.address || 'لا يوجد',
      'رقم التليفون': student.phone || 'لا يوجد',
      'تاريخ الميلاد': student.child_dob || 'لا يوجد',
      'ملاحظات': student.notes || 'لا يوجد',
      'المدرسة': student.school,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    worksheet['!dir'] = 'rtl'; 
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    const fileName = `بيانات_طلاب_${filters.stageFilter}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Search & Filters */}
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-gray-50/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو المدرسة أو الشارع..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.stageFilter}
              onChange={(e) => onFilterChange('stageFilter', e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage === 'All' ? 'كل المراحل' : stage}
                </option>
              ))}
            </select>

            <select
              value={filters.genderFilter}
              onChange={(e) => onFilterChange('genderFilter', e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
            >
              <option value="All">الكل</option>
              <option value="Boy">بنين</option>
              <option value="Girl">بنات</option>
            </select>

            <select
              value={filters.streetFilter}
              onChange={(e) => onFilterChange('streetFilter', e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:border-blue-500 max-w-[200px]"
            >
              <option value="All">كل الشوارع</option>
              {streets.map((street) => (
                <option key={street} value={street}>
                  {street}
                </option>
              ))}
            </select>

            {canManageStudents && (
              <>
                <button
                  type="button"
                  onClick={() => setIsArchiveOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-bold text-sm shadow-sm"
                >
                  <History className="w-4 h-4" />
                  الأرشيف
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold text-sm shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  تصدير Excel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-medium">عفواً، لا يوجد طلاب تطابق هذا البحث</div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4 border-b">name</th>
                  <th className="px-6 py-4 border-b">stage</th>
                  <th className="px-6 py-4 border-b">gender</th>
                  <th className="px-6 py-4 border-b">street</th>
                  <th className="px-6 py-4 border-b">رقم التليفون</th>
                  {canManageStudents && (
                    <th className="px-6 py-4 border-b text-right">إجراءات</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {student.firstName} {student.secondName} {student.thirdName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.stage}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${isBoy(student.gender) ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {getGenderLabel(student.gender)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {student.street || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm" dir="ltr">
                      {student.phone || '—'}
                    </td>
                    {canManageStudents && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => onEdit(student)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button type="button" onClick={() => onDelete(student)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden divide-y divide-gray-100">
            {students.map((student) => (
              <div key={student.id} className="p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900">
                    {student.firstName} {student.secondName} {student.thirdName}
                  </h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isBoy(student.gender) ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                    {getGenderLabel(student.gender)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-xs text-gray-500 mb-4">
                  <span>{student.stage}</span>
                  <span>{student.street || 'غير محدد'}</span>
                  <span dir="ltr">{student.phone || '—'}</span>
                </div>
                {canManageStudents && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onEdit(student)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold transition">تعديل</button>
                    <button type="button" onClick={() => onDelete(student)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold transition">حذف</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {canManageStudents && (
        <ArchiveModal
          isOpen={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
