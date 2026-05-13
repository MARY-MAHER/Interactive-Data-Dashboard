import { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Loader, Download, History } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ArchiveModal } from './ArchiveModal';

interface Student {
  id: string;
  firstName: string; 
  secondName: string;
  thirdName: string;
  stage: string;
  gender: string;
  phone :string; 
  street: string;
  father?: string;
  address?: string;
  school: string;
  status: string;
}

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onRefresh: () => void;
  /** When false, hide export, archive, add/edit/delete (read-only table + search/filters). */
  canManageStudents?: boolean;
}

export default function StudentTable({
  students,
  loading,
  onEdit,
  onDelete,
  onRefresh,
  canManageStudents = true,
}: StudentTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const stages = useMemo(() => {
    const allStages = students.map(s => s.stage).filter(Boolean);
    return ['All', ...Array.from(new Set(allStages))];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const fullName = `${student.firstName || ''} ${student.secondName || ''} ${student.thirdName || ''}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchQuery.toLowerCase()) ||
        (student.school || "").toLowerCase().includes(searchQuery.toLowerCase());

      const studentGender = (student.gender || "").toString().trim().toLowerCase();
      const matchesGender = genderFilter === 'All' || studentGender === genderFilter.toLowerCase();

      const studentStage = (student.stage || "").toString().trim().toLowerCase();
      const matchesStage = stageFilter === 'All' || studentStage === stageFilter.toLowerCase();

      return matchesSearch && matchesGender && matchesStage;
    });
  }, [students, searchQuery, genderFilter, stageFilter]);

  const handleExport = () => {
      const dataToExport = filteredStudents.map(student => ({
        'الاسم بالكامل': `${student.firstName} ${student.secondName} ${student.thirdName}`, 
        'المرحلة': student.stage,
        'النوع': student.gender === 'Boy' ? 'ولد' : 'بنت',
        'الشارع': student.street,
        'العنوان التفصيلي': student.address || 'لا يوجد', // ده السطر اللي ضفناه
        'رقم التليفون': student.phone || 'لا يوجد',
        'المدرسة': student.school,
        'الحالة': student.status,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      worksheet['!dir'] = 'rtl'; 
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      const fileName = `بيانات_طلاب_${stageFilter}.xlsx`;
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
              placeholder="Search "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage === 'All' ? 'كل المراحل' : stage}</option>
              ))}
            </select>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
            >
              <option value="All">الكل</option>
              <option value="Boy">بنين</option>
              <option value="Girl">بنات</option>
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

      {filteredStudents.length === 0 ? (
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
                  <th className="px-6 py-4 border-b">الحالة</th>
                  {canManageStudents && (
                    <th className="px-6 py-4 border-b text-right">إجراءات</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {student.firstName} {student.secondName} {student.thirdName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.stage}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${student.gender === 'Boy' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {student.gender === 'Boy' ? 'ولد' : 'بنت'}
                      </span>
                    </td>
                      <td className="px-6 py-4 text-gray-600">
                      {student.street || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{student.status}</td>
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
            {filteredStudents.map((student) => (
              <div key={student.id} className="p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900">
                    {student.firstName} {student.secondName} {student.thirdName}
                  </h4>               
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{student.status}</span>
                </div>
                <div className="flex gap-2 text-xs text-gray-500 mb-4">
                  <span>{student.stage}</span>
                  <span>•</span>
                  <span>{student.school}</span>
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