import { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Loader, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Student {
  id: string;
  name: string;
  stage: string;
  gender: string; 
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
}

export default function StudentTable({ students, loading, onEdit, onDelete }: StudentTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');

  const stages = useMemo(() => {
    const allStages = students.map(s => s.stage).filter(Boolean);
    return ['All', ...Array.from(new Set(allStages))];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.school.toLowerCase().includes(searchQuery.toLowerCase());

      const studentGender = (student.gender || "").toString().trim().toLowerCase();
      const matchesGender = genderFilter === 'All' || studentGender === genderFilter.toLowerCase();

      const studentStage = (student.stage || "").toString().trim().toLowerCase();
      const matchesStage = stageFilter === 'All' || studentStage === stageFilter.toLowerCase();

      return matchesSearch && matchesGender && matchesStage;
    });
  }, [students, searchQuery, genderFilter, stageFilter]);

  const handleExport = () => {
    const dataToExport = filteredStudents.map(student => ({
      'الاسم': student.name,
      'المرحلة': student.stage,
      'اسم الأب': student.father || '-',
      'النوع': student.gender,
      'المدرسة': student.school,
      'الحالة': student.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    const fileName = `طلاب_${stageFilter}_${genderFilter}.xlsx`;
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
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-gray-50/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو المدرسة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>

          {/* الفلاتر وزرار الإكسيل */}
          <div className="flex flex-wrap items-center gap-2">
            {/* فلتر المرحلة */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage === 'All' ? 'ALL':stage}</option>
              ))}
            </select>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All
              </option>
              <option value="Boy">Boy</option>
              <option value="Girl">Girl</option>
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold text-sm shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export exel
            </button>
          </div>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-medium">عفواً، لا يوجد طلاب تطابق هذا البحث</div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4 border-b">Name</th>
                  <th className="px-6 py-4 border-b">Stage</th>
                  <th className="px-6 py-4 border-b">Gender</th>
                  <th className="px-6 py-4 border-b">School</th>
                  <th className="px-6 py-4 border-b">Status</th>
                  <th className="px-6 py-4 border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 text-gray-600">{student.stage}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${student.gender === 'Boy' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.school}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">{student.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onEdit(student)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDelete(student)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
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
                  <h4 className="font-bold text-gray-900">{student.name}</h4>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{student.status}</span>
                </div>
                <div className="flex gap-2 text-xs text-gray-500 mb-4">
                  <span>{student.stage}</span>
                  <span>•</span>
                  <span>{student.school}</span>
                  <span>•</span>
                  <span className={student.gender === 'Boy' ? 'text-blue-600' : 'text-pink-600'}>{student.gender}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(student)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold active:scale-95 transition">تعديل</button>
                  <button onClick={() => onDelete(student)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold active:scale-95 transition">حذف</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}