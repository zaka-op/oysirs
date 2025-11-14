"use client";

interface ErrorOverlayProps {
  message?: string;
  onClose?: () => void;
}

interface LoadingOverlayProps {
  message?: string;
}

interface SuccessOverlayProps {
  message?: string;
  onClose?: () => void;
}

export function ErrorOverlay({ message, onClose }: ErrorOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="flex flex-col items-center bg-white rounded-xl shadow-lg px-8 py-8 min-w-[280px]">
        <svg className="w-12 h-12 text-red-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-red-700 font-semibold text-lg mb-1">Error</div>
        <div className="text-gray-700 text-center mb-4">{message || "An error occurred. Please try again."}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-2 px-5 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}




export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="flex flex-col items-center bg-white rounded-xl shadow-lg px-8 py-8 min-w-[280px]">
        <div className="mb-4">
          <span className="block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
        </div>
        <div className="text-gray-700 text-center">{message || "Please wait..."}</div>
      </div>
    </div>
  );
}



export function SuccessOverlay({ message, onClose }: SuccessOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="flex flex-col items-center bg-white rounded-xl shadow-lg px-8 py-8 min-w-[280px]">
        <svg className="w-12 h-12 text-green-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <div className="text-green-700 font-semibold text-lg mb-1">Success</div>
        <div className="text-gray-700 text-center mb-4">{message || "Operation successful!"}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-2 px-5 py-2 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
