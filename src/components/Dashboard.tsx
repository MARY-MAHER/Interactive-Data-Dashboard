import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import {
  GraduationCap,
  Users,
  LogOut,
  Plus,
  UserCircle,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import StudentTable from './StudentTable';
import StudentForm from './StudentForm';
import DeleteConfirmation from './DeleteConfirmation';

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
  user_id?: string;
  created_at?: any;
}

export default function Dashboard() {
  const { user, signOut, profile, isAdmin } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [genderFilter, setGenderFilter] = useState('All');
  const [streetFilter, setStreetFilter] = useState('All');

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

  // استخراج قائمة الشوارع بدون تكرار
  const streets = Array.from(new Set(students.map(s => s.street).filter(Boolean)));

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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesGender = genderFilter === 'All' || student.gender === genderFilter;
    const matchesStreet = streetFilter === 'All' || student.street === streetFilter;
    return matchesGender && matchesStreet;
  });

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

              {isAdmin ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <select
                      value={streetFilter}
                      onChange={(e) => setStreetFilter(e.target.value)}
                      className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                    >
                      <option value="All">كل الشوارع</option>
                      {streets.map((street) => (
                        <option key={street} value={street}>
                          {street}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                    {[
                      { id: 'All', label: 'الكل' },
                      { id: 'Boy', label: 'بنين' },
                      { id: 'Girl', label: 'بنات' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGenderFilter(g.id)}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                          genderFilter === g.id
                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-100'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStudent}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة طالب
                  </button>
                </div>
              ) : null}
            </div>

            <div className="p-2">
              <StudentTable
                students={isAdmin ? filteredStudents : students}
                loading={loading}
                onEdit={handleEditStudent}
                onDelete={handleDeleteClick}
                onRefresh={fetchStudents}
                canManageStudents={isAdmin}
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
        </>
      )}
    </div>
  );
}