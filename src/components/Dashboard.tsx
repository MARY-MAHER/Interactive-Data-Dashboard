import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import {
  GraduationCap,
  Users,
  LogOut,
  Plus,
  UserCircle,
  ArrowUpCircle,
  AlertTriangle,
} from 'lucide-react';
import { promoteAllActiveStudents } from '../utils/promoteStudents';
import { toast } from 'sonner';
import StudentTable from './StudentTable';
import StudentForm from './StudentForm';
import DeleteConfirmation from './DeleteConfirmation';
import StageStatsCharts from './StageStatsCharts';
import { filterStudents, getOrderedStages } from '../utils/studentUtils';

export interface Student {
  id: string;
  firstName: string; 
  secondName: string;
  thirdName: string; 
  stage: string;
  street: string;
  father?: string;
  phone: string;
  financialStatus?: string;
  gender: string;
  address?: string;
  school: string;
  status: string;
  child_dob?: string;
  notes?: string;
  user_id?: string;
  created_at?: any;
}

export interface StudentFilters {
  searchQuery: string;
  genderFilter: string;
  stageFilter: string;
  streetFilter: string;
}

const DEFAULT_FILTERS: StudentFilters = {
  searchQuery: '',
  genderFilter: 'All',
  stageFilter: 'All',
  streetFilter: 'All',
};

export default function Dashboard() {
  const { user, signOut, profile, isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState<StudentFilters>(DEFAULT_FILTERS);
  const [promoteConfirmOpen, setPromoteConfirmOpen] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'students'), 
        where('status', 'in', ['Active', 'active', '']),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const item = doc.data();
        return {
          ...item, 
          id: doc.id,
          firstName: item.firstName || '', 
          secondName: item.secondName || '',
          thirdName: item.thirdName || '',
          stage: item.stage || '',
          gender: item.gender || '',
          school: item.school || '',
          phone: item.phone || '',
          status: item.status || 'Active',
          street: item.street || 'غير محدد'
        };
      }) as Student[];

      setStudents(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const streets = useMemo(
    () => Array.from(new Set(students.map((s) => s.street).filter(Boolean))).sort(),
    [students]
  );

  const stages = useMemo(() => ['All', ...getOrderedStages(students)], [students]);

  const filteredStudents = useMemo(
    () => filterStudents(students, filters),
    [students, filters]
  );

  const handleFilterChange = (key: keyof StudentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setFormOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      const studentRef = doc(db, 'students', studentToDelete.id);
      await updateDoc(studentRef, {
        status: 'Archived',
        deletedAt: new Date()
      });
      toast.success('Student moved to archive successfully');
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setDeleteConfirmOpen(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to archive student');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchStudents();
    setFormOpen(false);
    setSelectedStudent(null);
  };

  const handlePromoteStudents = async () => {
    if (isPromoting) return;
    try {
      setIsPromoting(true);
      const { promoted, archived, skipped } = await promoteAllActiveStudents();
      setPromoteConfirmOpen(false);
      await fetchStudents();
      const parts: string[] = [];
      if (promoted > 0) parts.push(`تم ترقية ${promoted} طالب`);
      if (archived > 0) parts.push(`نقل ${archived} طالب للأرشيف (تخرج)`);
      if (skipped > 0) parts.push(`تخطي ${skipped} (مرحلة غير معروفة)`);
      toast.success(parts.length ? parts.join(' — ') : 'لا يوجد طلاب نشطون للترقية');
    } catch (error) {
      console.error(error);
      toast.error('فشل ترقية الطلاب للعام الجديد');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* 1. Navbar العلوي */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 leading-tight">Student Portal</h1>
              <p className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase">خدمة مار متي البشير</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 flex-wrap justify-end">
            {profile && (
              <div className="hidden md:flex flex-col items-end gap-0.5">
                <span className="text-sm font-bold text-gray-900">أهلاً يا {profile.name}</span>
                <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
                  {profile.role || '—'}
                </span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
              <UserCircle className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-600 truncate max-w-[150px]">{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 p-2.5 md:px-5 md:py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl transition-all active:scale-95 border border-red-100"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:block text-sm font-bold">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-10 transition-all duration-300">
        <div className="p-4 lg:px-10 max-w-[1600px] mx-auto">
          
          {/* Dashboard Header Section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">Dashboard</h2>
              {profile && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <p className="text-xl lg:text-2xl font-bold text-indigo-900" dir="rtl">
                    أهلاً يا {profile.name}
                  </p>
                  <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">
                    الدور: {profile.role || '—'}
                  </span>
                </div>
              )}
              <p className="text-gray-500 font-medium">
                {isAdmin ? 'إحصائيات وبيانات المخدومين' : 'عرض قائمة الطلاب والبحث'}
              </p>
            </div>

            {isAdmin && (
              <div
                dir="rtl"
                className="bg-white p-6 lg:p-7 rounded-[2rem] border border-gray-100 shadow-xl shadow-indigo-100/20 max-w-xl"
              >
                <p className="text-sm lg:text-[15px] italic text-indigo-900 font-bold text-right leading-relaxed">
                  "كَذَلِكَ أَنْتُمْ أَيْضًا، مَتَى فَعَلْتُمْ كُلَّ مَا أُمِرْتُمْ بِهِ فَقُولُوا: إِنَّنَا عَبِيدٌ بَطَّالُونَ، لأَنَّنَا إِنَّمَا عَمِلْنَا مَا كَانَ يَجِبُ عَلَيْنَا"
                  <span className="inline-block ms-2 text-xs text-indigo-400 font-medium">(لو 17: 10)</span>
                </p>
              </div>
            )}
          </div>

          {/* Stats Overview — admin only */}
          {isAdmin && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-8">
                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/20 border border-gray-50 p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">إجمالي الطلاب</p>
                    <p className="text-4xl font-black text-gray-900 mt-1">{students.length}</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-2xl">
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/20 border border-gray-50 p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">طلاب الفلتر الحالي</p>
                    <p className="text-4xl font-black text-green-600 mt-1">{filteredStudents.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl">
                    <GraduationCap className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <StageStatsCharts students={filteredStudents} />
            </>
          )}

          {/* Students Table Container */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/20 border border-gray-100 overflow-hidden mt-8">
            <div className="p-6 lg:p-8 border-b border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black text-gray-900">قائمة الطلاب</h3>
                <p className="text-sm text-gray-400 font-medium">
                  {isAdmin ? 'تحكم كامل في البيانات' : 'عرض وبحث — صلاحيات محدودة'}
                </p>
              </div>

              {isAdmin && (
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setPromoteConfirmOpen(true)}
                    disabled={isPromoting || loading}
                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-amber-200/80 transition-all active:scale-95"
                  >
                    <ArrowUpCircle className="w-5 h-5" />
                    ترقية الطلاب للعام الجديد
                  </button>
                  <button
                    type="button"
                    onClick={handleAddStudent}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة طالب
                  </button>
                </div>
              )}
            </div>

            <div className="p-2">
              <StudentTable
                students={filteredStudents}
                loading={loading}
                onEdit={handleEditStudent}
                onDelete={handleDeleteClick}
                onRefresh={fetchStudents}
                canManageStudents={isAdmin}
                filters={filters}
                onFilterChange={handleFilterChange}
                stages={stages}
                streets={streets}
              />
            </div>
          </div>
        </div>
      </main>

      {isAdmin && (
        <>
          <StudentForm
            open={formOpen}
            onClose={() => {
              setFormOpen(false);
              setSelectedStudent(null);
            }}
            onSuccess={handleFormSuccess}
            student={selectedStudent}
          />

          <DeleteConfirmation
            open={deleteConfirmOpen}
            onClose={() => {
              setDeleteConfirmOpen(false);
              setStudentToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            studentName={`${studentToDelete?.firstName || ''} ${studentToDelete?.secondName || ''}`}
          />

          {promoteConfirmOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => !isPromoting && setPromoteConfirmOpen(false)}
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    ترقية جميع الطلاب للعام الجديد
                  </h3>
                  <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">
                    سيتم رفع كل طالب نشط للمرحلة التالية (أولى → تانية … خامسة → سادسة). طلاب
                    سادسة ابتدائي يُنقلون للأرشيف كتخرج. لا يمكن التراجع تلقائياً عن هذه العملية.
                  </p>
                  <div className="flex gap-3 flex-row-reverse">
                    <button
                      type="button"
                      onClick={handlePromoteStudents}
                      disabled={isPromoting}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm"
                    >
                      {isPromoting ? 'جاري الترقية…' : 'تأكيد الترقية'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoteConfirmOpen(false)}
                      disabled={isPromoting}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 py-3 rounded-xl font-bold text-sm"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
