import { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
import { useAuth } from '../contexts/AuthContext'; 
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'; 
import { X, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  stage: string;
  father?: string;
  address?: string;
  school: string;
  status: string;
}

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: Student | null;
}

export default function StudentForm({ open, onClose, onSuccess, student }: StudentFormProps) {
  const { user } = useAuth(); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    stage: '',
    father: '',
    gender: '',
    address: '',
    school: '',
    status: 'Active',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        stage: student.stage,
        father: student.father || '',
        gender: student.gender || '',
        address: student.address || '',
        school: student.school,
        status: student.status,
      });
    } else {
      setFormData({
        name: '',
        stage: '',
        father: '',
        gender: '',
        address: '',
        school: '',
        status: 'Active',
      });
    }
  }, [student, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student) {
        const studentRef = doc(db, 'students', student.id);
        await updateDoc(studentRef, {
          ...formData,
          updated_at: serverTimestamp(),
        });
        toast.success('Student updated successfully');
      } else {
        await addDoc(collection(db, 'students'), {
          ...formData,
          user_id: user?.uid, 
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        toast.success('Student added successfully');
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex z-50">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="px-6 py-6 bg-blue-600 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {student ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Enter student name"
                    required
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition cursor-pointer"
                required
                >
                <option value="" disabled>Choose Gender...</option>
                <option value="Boy">👦 Boy</option>
                <option value="Girl">👧 Girl</option>
                </select>
                </div>
                

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage/Grade *
                  </label>
                  <input
                    type="text"
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Grade 10, Year 1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    name="father"
                    value={formData.father}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Enter father's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School *
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Enter school name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{student ? 'Update' : 'Add Student'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}