import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentName: string;
}

export default function DeleteConfirmation({
  open,
  onClose,
  onConfirm,
  studentName,
}: DeleteConfirmationProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Delete Student
          </h3>

          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete <span className="font-semibold">{studentName}</span>? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
