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
                Ad Published!
            </h2>
            <p className="mb-8 text-sm sm:text-base">
                Your ad has been published to the Digital Billboard!
            </p>
            <div className="w-full flex flex-col items-center gap-4">
              <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-500 text-white border-2 border-b-4 border-black hover:bg-blue-600 active:border-b-2 active:mt-0.5"
              >
                  Awesome!
              </button>
              <a 
                href="https://www.buymeacoffee.com/habeebrahman" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 bg-yellow-400 text-black border-2 border-b-4 border-black hover:bg-yellow-500 active:border-b-2 active:mt-0.5 transition-all text-sm"
              >
                <span>☕</span>
                <span>Buy me a coffee</span>
              </a>
            </div>
        </div>
      </div>
    </div>
  );
}