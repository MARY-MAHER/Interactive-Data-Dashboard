import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';import { RotateCcw, Trash2, X } from 'lucide-react';

interface ArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({ isOpen, onClose, onRefresh }) => {
    const [archivedStudents, setArchivedStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchArchived = async () => {
    setLoading(true);
    const q = query(collection(db, "students"), where("status", "==", "Archived"));
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setArchivedStudents(docs);
    setLoading(false);
    };

    useEffect(() => {
    if (isOpen) fetchArchived();
    }, [isOpen]);

    const handleRestore = async (id: string) => {
    const studentRef = doc(db, "students", id);
    await updateDoc(studentRef, { status: "Active" }); // نرجعه نشط تاني
    fetchArchived();
    onRefresh(); // نحدث الجدول الرئيسي
    };

    const handlePermanentDelete = async (id: string) => {
    if (window.confirm("هل أنتِ متأكدة من مسح هذا الطالب نهائياً؟ لا يمكن التراجع!")) {
        await deleteDoc(doc(db, "students", id));
        fetchArchived();
    }
    };

    if (!isOpen) return null;

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800"> Recycle bin (Archive)</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded"><X /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
            {loading ? <p className="text-center">Loading ...</p> : 
            archivedStudents.length === 0 ? <p className="text-center text-gray-500">There are no students in the archive.</p> : (
            <table className="w-full text-right border-collapse">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border text-center">procedures</th>
                </tr>
                </thead>
                <tbody>
                {archivedStudents.map(student => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 border">{student.name}</td>
                    <td className="p-2 border flex justify-center gap-2">
                        <button 
                        onClick={() => handleRestore(student.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                        title="Student recovery"
                        >
                        <RotateCcw size={16} /> recovery
                        </button>
                        <button 
                        onClick={() => handlePermanentDelete(student.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
                        title=" Permanent deletion"
                        >
                        <Trash2 size={16} /> Permanent deletion 
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
        </div>
    </div>
    );
};