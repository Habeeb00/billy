import React, { useState, ChangeEvent, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';

// --- Image Cropping Utilities ---

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg', 0.9); // Return as high-quality JPEG
}


// --- Component Interfaces ---

interface PurchaseModalProps {
  onClose: () => void;
  onPurchase: (imageUrl: string, message: string) => void;
  aspectRatio: number;
}

interface UploadIconProps {
  className?: string;
}

function UploadIcon({ className }: UploadIconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3 3-3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
  );
}


// --- Main Component ---

export function PurchaseModal({ onClose, onPurchase, aspectRatio }: PurchaseModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size cannot exceed 5MB.");
        return;
      }
      setError('');
      setZoom(1); // Reset zoom on new image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSubmit = async () => {
    if (!imageUrl) {
      setError('Please upload an image.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }
    if (!croppedAreaPixels) {
      setError('Could not process image crop. Please adjust the image.');
      return;
    }
    setIsProcessing(true);
    try {
      const croppedImageUrl = await getCroppedImg(imageUrl, croppedAreaPixels);
      onPurchase(croppedImageUrl, message);
    } catch (e) {
      console.error(e);
      setError('Failed to crop image. Please try again with a different image.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30 p-4">
      <div className="bg-gray-200 border-4 border-black p-6 sm:p-8 w-full max-w-2xl relative text-black">
        <button onClick={onClose} className="absolute -top-2 -right-2 bg-red-500 border-2 border-black w-8 h-8 text-white font-bold text-xl hover:bg-red-600 flex items-center justify-center z-10">
            <span className="mb-0.5">X</span>
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center" style={{ textShadow: '2px 2px #fff' }}>Book Your Spot</h2>
        
        <div className="space-y-6">
          <div className="relative h-64 sm:h-96 w-full border-2 border-dashed border-black flex items-center justify-center bg-gray-300 text-gray-700">
            {!imageUrl ? (
              <>
                <div className="text-center">
                    <UploadIcon className="w-12 h-12 mx-auto" />
                    <p className="mt-2 text-sm">Upload Image</p>
                    <p className="text-xs">up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Upload your image"
                />
              </>
            ) : (
                <Cropper
                    image={imageUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            )}
          </div>
          
          {imageUrl && (
            <div>
              <label htmlFor="zoom" className="block text-sm mb-1">Zoom</label>
              <input
                id="zoom"
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="zoom-slider"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          <div>
            <label htmlFor="message" className="block text-sm mb-1">Your Message</label>
            <input
              id="message"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={100}
              className="w-full p-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Your text here!"
            />
          </div>
          
          {error && <p className="text-red-700 text-sm text-center font-bold">{error}</p>}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-green-500 text-white border-2 border-b-4 border-black hover:bg-green-600 active:border-b-2 active:mt-0.5 disabled:bg-gray-500 disabled:border-b-2 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Book Now'}
          </button>
           <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-400 text-black border-2 border-b-4 border-black hover:bg-gray-500 active:border-b-2 active:mt-0.5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}