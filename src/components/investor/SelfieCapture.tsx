"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCcw, ShieldCheck, X, AlertTriangle } from "lucide-react";

interface SelfieCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export function SelfieCapture({ onCapture, onClose }: SelfieCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [initTimeout, setInitTimeout] = useState(false);

  const startCamera = async () => {
    setError(null);
    setInitTimeout(false);
    console.log("Initializing Device Camera...");
    
    // Safety timeout
    const timeout = setTimeout(() => {
      if (!stream) {
        setInitTimeout(true);
        console.warn("Camera initialization timed out.");
      }
    }, 10000);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      clearTimeout(timeout);
      setError("Camera access is only available in secure (HTTPS) environments. Please verify your connection or use a modern, secure browser.");
      return;
    }
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      let mediaStream: MediaStream;
      try {
        console.log("Attempting high-resolution 'user' facing camera...");
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user", 
            width: { ideal: 1920, min: 1280 }, 
            height: { ideal: 1080, min: 720 } 
          } 
        });
      } catch (e: any) {
        console.warn(`High-res attempt failed (${e.name}): ${e.message}`);
        
        // Explicitly check for permission denial in any form
        const isPermissionError = 
          e.name === 'NotAllowedError' || 
          e.name === 'PermissionDeniedError' || 
          e.name === 'SecurityError' ||
          (e.message && e.message.toLowerCase().includes('permission'));

        if (isPermissionError) {
          // Let it fall through to the outer catch for unified error handling
        } else {
          console.log("Falling back to default 'user' facing camera...");
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: "user" } 
            });
          } catch (fallbackErr: any) {
            console.warn(`Facing-mode 'user' fallback failed (${fallbackErr.name}): ${fallbackErr.message}`);
            
            if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError' || fallbackErr.name === 'SecurityError') {
              // Fatal permission error, let outer catch handle it
            } else {
              console.log("Final fallback: Requesting ANY available video source...");
              mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            }
          }
        }
      }
      if (mediaStream) {
        console.log("Camera stream acquired successfully.");
        clearTimeout(timeout);
        setStream(mediaStream);
      }
    } catch (err: any) {
      clearTimeout(timeout);
      console.error("Critical Camera Access Error:", err);
      
      // Map common errors to user-friendly messages
      const errorName = err.name || '';
      const errorMessage = err.message || '';
      
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setError("Camera access denied. Please click the camera icon in your browser's address bar to allow camera access for identity verification.");
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setError("No camera detected. Please ensure your camera is connected and not being used by another application.");
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        setError("Camera is already in use by another application or tab. Please close other apps and try again.");
      } else if (errorName === 'OverconstrainedError') {
        setError("No camera found matching the required specifications. Please try using a different device.");
      } else {
        setError(`Camera Error: ${errorMessage || 'Unknown hardware failure'}. Please refresh the page.`);
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Attempted capture before video dimensions were synchronized.");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            console.log("Biometric capture serialized successfully.");
            setCapturedImage(URL.createObjectURL(blob));
            onCapture(blob);
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
              setStream(null);
            }
          }
        }, "image/jpeg", 0.9);
      }
    }
  }, [stream, onCapture]);

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => { stopCamera(); onClose(); }}
          className="absolute top-6 right-6 z-10 text-white/40 hover:text-white hover:bg-white/5 rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>

        <div className="p-10 space-y-8 text-center">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Identity Capture Terminal</h3>
            <p className="text-muted-foreground text-sm font-medium italic">Position your face within the frame for manual identity verification.</p>
          </div>

          <div className="relative aspect-[3/4] max-w-sm mx-auto">
            {/* The Premium Oval Frame */}
            <div className="absolute inset-0 z-10 pointer-events-none border-[4px] border-primary/40 rounded-[50%/40%] border-dashed animate-[spin_60s_linear_infinite] shadow-[0_0_30px_rgba(var(--primary),0.2)]" />
            <div className="absolute inset-2 z-20 pointer-events-none border-[1px] border-white/20 rounded-[50%/40%]" />
            <div className="absolute -inset-4 z-0 bg-primary/5 blur-3xl rounded-full opacity-50" />
            
            <div className="w-full h-full rounded-[50%/40%] overflow-hidden bg-zinc-900 border border-white/10 shadow-inner relative flex items-center justify-center">
              {error ? (
                <div className="p-8 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">{error}</p>
                  <div className="flex flex-col gap-2 w-full max-w-[200px] pt-2">
                    <Button 
                      variant="outline" 
                      onClick={startCamera}
                      className="h-10 px-6 border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/5"
                    >
                      Retry Camera Sync
                    </Button>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCapturedImage(URL.createObjectURL(file));
                            onCapture(file);
                          }
                        }}
                      />
                      <Button 
                        className="w-full h-10 px-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl group-hover:bg-white/10"
                      >
                        Manual Photo Upload
                      </Button>
                    </div>
                  </div>
                </div>
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured Alignment" className="w-full h-full object-cover scale-x-[-1]" />
              ) : (stream && !initTimeout) ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                  {!initTimeout ? (
                    <>
                      <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Initializing Camera...</p>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Camera Sync Timeout</p>
                        <p className="text-[10px] text-muted-foreground font-medium italic">Device camera acquisition taking longer than expected.</p>
                      </div>
                      <div className="flex flex-col gap-2 w-full max-w-[200px] pt-2">
                        <Button 
                          variant="outline" 
                          onClick={startCamera}
                          className="h-10 px-6 border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/5"
                        >
                          Retry Camera Sync
                        </Button>
                        <div className="relative group">
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setCapturedImage(URL.createObjectURL(file));
                                onCapture(file);
                              }
                            }}
                          />
                          <Button 
                            className="w-full h-10 px-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl group-hover:bg-white/10"
                          >
                            Manual Photo Upload
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Face Guide Overlays */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
               <div className="w-[85%] h-[85%] rounded-[50%/40%] border-2 border-primary/40 shadow-[0_0_100px_rgba(var(--primary),0.05)]" />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {!capturedImage ? (
              <Button 
                onClick={capture}
                disabled={!stream}
                className="h-16 w-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-2xl shadow-primary/20 flex items-center justify-center p-0"
              >
                <div className="w-12 h-12 rounded-full border-2 border-primary-foreground/30 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={retake}
                  className="h-14 px-8 border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" /> Reset Frame
                </Button>
                <Button 
                  onClick={onClose}
                  className="h-14 px-10 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-emerald-500/20"
                >
                  <ShieldCheck className="mr-2 h-5 w-5" /> Confirm Capture
                </Button>
              </div>
            )}
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
