import { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
import { useAuth } from '../contexts/AuthContext'; 
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'; 
import { X, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  firstName: string; 
  secondName: string; 
  thirdName: string;
  stage: string;
  financialStatus?: string;
  street: string;
  phone: string;
  father?: string;
  gender: string;
  address?: string;
  school: string;
  status: string;
}
const FINANCIAL_STATUS_OPTIONS = [
  'متوسط',
  'فوق المتوسط',
  'تحت المتوسط'
];
const STREETS = [
  'شارع الفرن الجزء الاول',
  'شارع الفرن الجزء التاني ',
  'شارع رفعت طانيوس  ',
  'شارع غايس اندراوس + حفني انيس ',
  ' شارع نعيم جندي + مطلع الشامية',
  ' بسيط عبد النور + كامل عبد المسيح + حارة كتكوت',
  ' ثروت سعد + مكسيموس فهيم + صدقي اسكندر',
  'حكيم عطا الله + شارع الورشة'
];
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
    firstName: '',
    secondName: '',
    thirdName: '',
    stage: '',
    street:'',
    father: '',
    financialStatus: '',
    gender: '',
    phone: '',
    address: '',
    school: '',
    status: 'Active',
  });
    const STAGES = [
      'أولى ابتدائي',
      'تانية ابتدائي',
      'تالتة ابتدائي',
      'رابعة ابتدائي',
      'خامسة ابتدائي',
      'سادسة ابتدائي'
    ];
  useEffect(() => {
  if (student) {
    setFormData({
        firstName: student.firstName || '',
        secondName: student.secondName || '',
        thirdName: student.thirdName || '',
        stage: student.stage,
        phone: student.phone,
        financialStatus: student.financialStatus || '',
        street: student.street ,
        father: student.father || '',
        gender: student.gender || '',
        address: student.address || '',
        school: student.school,
        status: student.status,
      });
    } else {
      setFormData({
        firstName: '',
        secondName: '',
        thirdName: '',        
        stage: '',
        street:'',
        financialStatus: '',
        father: '',
        phone :'',
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

            <div className="grid grid-cols-3 gap-3" dir="rtl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right outline-none"
                  placeholder="first Name "
                  required
                />
              </div>

              {/* اسم الأب */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                Second Name
                </label>
                <input
                  type="text"
                  name="secondName"
                  value={formData.secondName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right outline-none"
                  placeholder="Second name"
                  required
                />
              </div>

              {/* اللقب / الجد */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  Third Name
                </label>
                <input
                  type="text"
                  name="thirdName"
                  value={formData.thirdName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-right outline-none"
                  placeholder="third name "
                  required
                />
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel" 
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  maxLength={11}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="01xxxxxxxxx"
                />
              </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender 
                </label>
                <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition cursor-pointer"
                required
                >
                <option value="" disabled>Choose Gender...</option>
                <option value="Boy"> Boy</option>
                <option value="Girl"> Girl</option>
                </select>
                </div>
                
              <div>
              <div >
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Stage
              </label>
              <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition cursor-pointer "
              required
                >
              <option value="" disabled>Choose Stage</option>
              {STAGES.map((stage) => (
              <option key={stage} value={stage}>
            {stage}
            </option>
            ))}
            </select>
            </div>
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
                    School 
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    street name
                  </label>
                  <select
                    required
                    value={formData.street || ''}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">choose street </option>
                    {STREETS.map((street) => (
                      <option key={street} value={street}>
                        {street}
                      </option>
                    ))}
                  </select>
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
                      الحالة المادية 
                    </label>
                    <select
                      name="financialStatus"
                      value={formData.financialStatus || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
                    >
                      <option value="">اختر الحالة المادية...</option>
                      {FINANCIAL_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status 
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