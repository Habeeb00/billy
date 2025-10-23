import React from 'react';

interface SuccessModalProps {
  onClose: () => void;
}

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

export function SuccessModal({ onClose }: SuccessModalProps) {
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4"
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-gray-200 border-4 border-black p-6 sm:p-8 w-full max-w-md relative text-black text-center">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500 border-2 border-black flex items-center justify-center mb-6">
                <CheckIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ textShadow: '2px 2px #fff' }}>
                Purchase Successful!
            </h2>
            <p className="mb-8 text-sm sm:text-base">
                Your ad is now live on the billboard.
            </p>
            <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 bg-blue-500 text-white border-2 border-b-4 border-black hover:bg-blue-600 active:border-b-2 active:mt-0.5"
            >
                Awesome!
            </button>
        </div>
      </div>
    </div>
  );
}
