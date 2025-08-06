'use client'

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCcw, Check, Smartphone, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        toast.success('Camera ready! 📸');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Could not access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported on this browser.';
      } else {
        errorMessage += 'Please check your camera settings.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
        toast.success('Photo captured! 📷');
      }
    }, 'image/jpeg', 0.8);
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    startCamera();
  }, [capturedImage, startCamera]);

  const confirmPhoto = useCallback(() => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          // Create a File object from the blob
          const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          onCapture(file);
          onClose();
        }
      }, 'image/jpeg', 0.8);
    }
  }, [capturedImage, onCapture, onClose]);

  const switchCamera = useCallback(() => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    if (isStreaming) {
      stopCamera();
      setTimeout(() => {
        setFacingMode(newFacingMode);
      }, 100);
    }
  }, [facingMode, isStreaming, stopCamera]);

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (isStreaming) {
      startCamera();
    }
  }, [facingMode]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-amber-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              <h3 className="font-semibold">
                {capturedImage ? 'Photo Captured' : 'Take a Photo'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera/Preview Area */}
          <div className="flex-1 bg-black relative overflow-hidden">
            {error ? (
              <div className="flex items-center justify-center h-64 text-center p-6">
                <div>
                  <div className="text-red-500 text-6xl mb-4">📷</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Camera Error</h3>
                  <p className="text-gray-600 text-sm mb-4">{error}</p>
                  <button
                    onClick={startCamera}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : capturedImage ? (
              <img
                src={capturedImage || "/placeholder.svg"}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {/* Camera overlay */}
                {isStreaming && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Viewfinder */}
                    <div className="absolute inset-4 border-2 border-white/30 rounded-lg"></div>
                    
                    {/* Corner markers */}
                    <div className="absolute top-8 left-8 w-6 h-6 border-l-2 border-t-2 border-white"></div>
                    <div className="absolute top-8 right-8 w-6 h-6 border-r-2 border-t-2 border-white"></div>
                    <div className="absolute bottom-8 left-8 w-6 h-6 border-l-2 border-b-2 border-white"></div>
                    <div className="absolute bottom-8 right-8 w-6 h-6 border-r-2 border-b-2 border-white"></div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gray-100 p-4">
            {capturedImage ? (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={retakePhoto}
                  className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Use Photo
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {/* Camera switch (mobile only) */}
                <button
                  onClick={switchCamera}
                  className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-lg transition-colors md:invisible"
                  title="Switch Camera"
                >
                  {facingMode === 'user' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  <span className="text-sm">
                    {facingMode === 'user' ? 'Front' : 'Back'}
                  </span>
                </button>

                {/* Capture button */}
                <motion.button
                  onClick={capturePhoto}
                  disabled={!isStreaming}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 bg-white border-4 border-amber-500 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-amber-500 rounded-full"></div>
                </motion.button>

                {/* Placeholder for balance */}
                <div className="w-20"></div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {!capturedImage && !error && (
            <div className="bg-amber-50 p-3 text-center">
              <p className="text-amber-700 text-sm">
                📱 Position your device and tap the capture button to take a photo
              </p>
            </div>
          )}
        </motion.div>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraCapture;
