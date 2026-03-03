import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase'; 
import { collection, query, getDocs, orderBy, doc, updateDoc, where } from 'firebase/firestore'; 
import {
  GraduationCap,
  Users,
  LogOut,
  Menu,
  X,
  Plus,
  Home,
  UserCircle
} from 'lucide-react';
import { toast } from 'sonner';
import StudentTable from './StudentTable';
import StudentForm from './StudentForm';
import DeleteConfirmation from './DeleteConfirmation';

export interface Student {
  id: string;
  name: string;
  stage: string;
  father?: string;
  gender: string;
  address?: string;
  school: string;
  status: string;
  user_id: string;
  created_at: any;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // لحماية زر الحذف

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // تجلب الطلاب الذين حالتهم ليست Archived
      const q = query(
        collection(db, 'students'), 
        where('status', '!=', 'Archived'),
        orderBy('status'),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];

      setStudents(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
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

  // دالة الـ Soft Delete (تحديث الحالة بدلاً من الحذف النهائي)
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
      
      // تحديث القائمة فوراً في الواجهة
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

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Active').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-900">Student Portal</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Student Portal</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-medium">
              <Home className="w-5 h-5" />
              Dashboard
            </button>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-3">
              <UserCircle className="w-5 h-5 text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Manage and track all students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalStudents}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{activeStudents}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Students</h3>
                <button
                  onClick={handleAddStudent}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
                >
                  <Plus className="w-5 h-5" />
                  Add Student
                </button>
              </div>
            </div>

            <StudentTable
              students={students}
              loading={loading}
              onEdit={handleEditStudent}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>
      </main>

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
        studentName={studentToDelete?.name || ''}
      />
    </div>
  );
}