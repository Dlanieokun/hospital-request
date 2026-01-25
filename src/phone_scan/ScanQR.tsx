import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr'; 
import { useNavigate } from 'react-router'; 

// ====================================================================
// Interfaces & Types
// ====================================================================

interface QRCode {
    data: string;
    location: any;
    version: number;
}

interface ScanResult {
    data: string | null;
    error: string | null;
}

interface ScannerProps {
    onScanComplete: (result: ScanResult) => void;
    onClose: () => void;
}

// ====================================================================
// ScannerComponent
// ====================================================================

const ScannerComponent: React.FunctionComponent<ScannerProps> = ({ onScanComplete, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<string>("Initializing camera...");
    const [hasCameraError, setHasCameraError] = useState<boolean>(false);
    const [isReading, setIsReading] = useState<boolean>(false); 
    
    // 📸 NEW: State to track camera facing mode
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

    const decodeFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number): string | null => {
        try {
            const imageData = ctx.getImageData(0, 0, width, height);
            const code: QRCode | null = jsQR(
                imageData.data, 
                imageData.width, 
                imageData.height,
                { inversionAttempts: 'attemptBoth' } 
            );
            if (code) return code.data; 
        } catch (e) {
            console.error("Error during image data retrieval or decoding:", e);
        }
        return null;
    }, []); 

    const tick = useCallback(() => {
        let animationFrameId: number = requestAnimationFrame(tick); 

        if (videoRef.current && canvasRef.current && videoRef.current.readyState >= videoRef.current.HAVE_ENOUGH_DATA) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const qrData = decodeFrame(ctx, canvas.width, canvas.height);

                if (qrData) {
                    setStatus("✅ QR Code Found!");
                    setIsReading(true);
                    onScanComplete({ data: qrData, error: null });
                    cancelAnimationFrame(animationFrameId); 
                    return; 
                } else {
                    setStatus("Scanning...");
                    setIsReading(false);
                }
            }
        }
    }, [decodeFrame, onScanComplete]);

    // 🔄 NEW: Toggle Camera Function
    const toggleCamera = () => {
        setFacingMode(prev => prev === "environment" ? "user" : "environment");
    };
    
    useEffect(() => {
        const video = videoRef.current;
        let animationFrameId: number = 0; 
        let stream: MediaStream | null = null;
        
        const startScanning = () => {
            if (video) {
                video.play().then(() => {
                    setStatus(`Camera active (${facingMode}). Scanning...`);
                    animationFrameId = requestAnimationFrame(tick);
                }).catch((playErr) => {
                    console.error("Video play error:", playErr);
                    setHasCameraError(true);
                    onScanComplete({ data: null, error: "Playback failed." });
                });
            }
        };

        const startCamera = async () => {
            if (!video) return;

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setHasCameraError(true);
                setStatus("Camera API not available. Ensure you are using HTTPS.");
                return;
            }

            try {
                // Constraints now use the facingMode state
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: facingMode } 
                });
                video.srcObject = stream;
                video.addEventListener('loadedmetadata', startScanning);
            } catch (err) {
                console.error("Camera access error:", err);
                setHasCameraError(true);
                setStatus("Camera access denied or failed.");
            }
        };

        startCamera();

        return () => {
            if (video) {
                video.removeEventListener('loadedmetadata', startScanning);
                cancelAnimationFrame(animationFrameId);
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            }
        };
        // Dependency array now includes facingMode to trigger restart on switch
    }, [onScanComplete, tick, facingMode]);


    return (
        <div className="relative w-full max-w-xl mx-auto p-4 bg-white rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-center text-indigo-700 mb-4">Live QR Scanner</h2>
            
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
                <video 
                    ref={videoRef} 
                    className={`w-full h-full object-cover ${hasCameraError ? 'hidden' : ''} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    playsInline 
                    muted 
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay UI */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-3/4 h-3/4 border-4 border-dashed border-yellow-400 rounded-lg">
                        <div 
                            className={`absolute inset-0 top-1/2 left-0 right-0 h-1 transition-colors duration-200 
                                     ${isReading ? 'bg-green-500' : 'bg-yellow-400'} 
                                     ${!isReading && 'animate-scanner-line'}`}
                        ></div>
                    </div>
                </div>

                {/* Switch Camera Button Overlay */}
                {!hasCameraError && (
                    <button 
                        onClick={toggleCamera}
                        className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full border border-white/50 transition"
                        title="Switch Camera"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 7v6h-6"/><path d="M3 17V11h6"/><path d="M14 4.4a9 9 0 0 1 5.4 4.6M10 19.6A9 9 0 0 1 4.6 15"/>
                        </svg>
                    </button>
                )}
                
                {hasCameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-80 text-white p-4 text-center">
                        <p className="font-semibold">{status}</p>
                    </div>
                )}
            </div>

            <p className={`mt-4 text-center text-lg font-medium ${hasCameraError ? 'text-red-500' : 'text-gray-600'}`}>
                {status}
            </p>

            <button
                onClick={onClose}
                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition shadow-md"
            >
                Close Scanner
            </button>

            <style>{`
                @keyframes scanner-line-anim {
                    0% { transform: translateY(-100%); opacity: 0.8; }
                    50% { opacity: 0.3; }
                    100% { transform: translateY(100%); opacity: 0.8; }
                }
                .animate-scanner-line {
                    animation: scanner-line-anim 2.5s infinite linear;
                }
            `}</style>
        </div>
    );
};

// ... Rest of the ScanQR component remains the same ...
const ScanQR: React.FunctionComponent = () => {
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("Ready to scan.");
    const navigate = useNavigate();
    const sessionKey = 'qrCodeDataJson';
    
    const [scanResult, setScanResult] = useState<ScanResult | null>(() => {
        const rawData = sessionStorage.getItem(sessionKey);
        if (rawData) {
            try {
                const parsedJson = JSON.parse(rawData);
                return { data: JSON.stringify(parsedJson, null, 2), error: null };
            } catch (e) {
                return { data: null, error: "Failed to load previous JSON scan." };
            }
        }
        return null;
    });

    const handleTap = (): void => {
        setIsScanning(true);
        setScanResult(null);
        setStatus("Camera initializing...");
    };

    const handleScanComplete = (result: ScanResult): void => {
        setIsScanning(false);
        if (result.data) {
            try {
                JSON.parse(result.data);
                sessionStorage.setItem(sessionKey, result.data); 
                navigate('/request'); 
                return;
            } catch (e) {
                setScanResult({ data: null, error: "Data found, but JSON parsing failed." });
            }
        }
    };
    
    const handleCloseScanner = (): void => setIsScanning(false);
    
    if (isScanning) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <ScannerComponent onScanComplete={handleScanComplete} onClose={handleCloseScanner} />
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50 flex-col p-4">
            {scanResult && (
                <div className={`p-6 rounded-xl shadow-xl mb-8 w-full max-w-md ${scanResult.data ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border-2`}>
                    <h3 className="text-xl font-bold mb-2">Last Scan Result</h3>
                    <code className="block mt-1 p-3 bg-white rounded break-words text-sm border whitespace-pre-wrap">
                        {scanResult.data || scanResult.error}
                    </code>
                </div>
            )}

            <button 
                onClick={handleTap}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg text-2xl transition transform hover:scale-105"
            >
                Tap to Enter Scanner
            </button>
            <p className="mt-4 text-gray-500">{status}</p>
        </div>
    );
}

export default ScanQR;