import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <p className="text-sm text-gray-700 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
