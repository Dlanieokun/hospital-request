import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr'; 
// 🛑 IMPORT THE NAVIGATION HOOK
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

    const decodeFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number): string | null => {
        try {
            const imageData = ctx.getImageData(0, 0, width, height);
            const code: QRCode | null = jsQR(
                imageData.data, 
                imageData.width, 
                imageData.height,
                { inversionAttempts: 'attemptBoth' } 
            );
            if (code) {
                return code.data; 
            }
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
    
    useEffect(() => {
        const video = videoRef.current;
        let animationFrameId: number = 0; 
        let stream: MediaStream | null = null;
        
        const startScanning = () => {
            if (video) {
                video.play().then(() => {
                    setStatus("Camera active. Scanning for QR Code...");
                    animationFrameId = requestAnimationFrame(tick);
                }).catch((playErr) => {
                    console.error("Video play error:", playErr);
                    setHasCameraError(true);
                    setStatus("Failed to start video playback. Check browser console for details.");
                    onScanComplete({ data: null, error: "Playback failed." });
                });
            }
        };

        const startCamera = async () => {
            if (!video) return;

            // Check if the browser supports mediaDevices
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setHasCameraError(true);
                setStatus("Camera API not available. Ensure you are using HTTPS.");
                onScanComplete({ data: null, error: "MediaDevices API missing (Insecure context?)" });
                return;
            }

            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "environment" } 
                });
                video.srcObject = stream;
                video.addEventListener('loadedmetadata', startScanning);
            } catch (err) {
                console.error("Camera access error:", err);
                setHasCameraError(true);
                setStatus("Camera access denied or failed.");
                onScanComplete({ data: null, error: "Camera access denied." });
            }
        };

        startCamera();

        return () => {
            if (video) {
                video.removeEventListener('loadedmetadata', startScanning);
                cancelAnimationFrame(animationFrameId);
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                } else if (video.srcObject) {
                    (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                }
            }
        };
    }, [onScanComplete, tick]);


    return (
        <div className="relative w-full max-w-xl mx-auto p-4 bg-white rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-center text-indigo-700 mb-4">Live QR Scanner</h2>
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
                <video 
                    ref={videoRef} 
                    className={`w-full h-full object-cover ${hasCameraError ? 'hidden' : ''}`}
                    playsInline 
                    muted 
                />
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-3/4 h-3/4 border-4 border-dashed border-yellow-400 rounded-lg">
                        <div 
                            className={`absolute inset-0 top-1/2 left-0 right-0 h-1 transition-colors duration-200 
                                     ${isReading ? 'bg-green-500' : 'bg-yellow-400'} 
                                     ${!isReading && 'animate-scanner-line'}`}
                            style={{ boxShadow: isReading ? '0 0 10px 2px #34D399' : '0 0 8px 1px #FBBF24' }}
                        ></div>
                    </div>
                </div>
                
                {hasCameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-80 text-white p-4">
                        <p className="font-semibold text-center text-lg">{status}</p>
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

            {/* Custom CSS for Animation */}
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

// ====================================================================
// ScanQR Component: Wrapper, Result Display, and Navigation
// ====================================================================

/**
 * ScanQR is the root component that manages the scanning state, displays results, and handles navigation.
 */
const ScanQR: React.FunctionComponent = () => {
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("Ready to scan.");
    
    // Initialize useNavigate hook
    const navigate = useNavigate();

    // Key to use for sessionStorage
    const sessionKey = 'qrCodeDataJson';
    
    // State initialization: Check sessionStorage instead of localStorage
    const [scanResult, setScanResult] = useState<ScanResult | null>(() => {
        const rawData = sessionStorage.getItem(sessionKey);
        if (rawData) {
            try {
                const parsedJson = JSON.parse(rawData);
                const formattedJson = JSON.stringify(parsedJson, null, 2);
                return { data: formattedJson, error: null };
            } catch (e) {
                return { data: null, error: "Failed to load previous JSON scan from session storage." };
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
        
        let finalResult = result;
        
        if (result.data) {
            try {
                // 1. Attempt to parse the data as JSON
                JSON.parse(result.data); // Just to validate it's JSON
                
                // 2. SAVE to SESSION STORAGE
                sessionStorage.setItem(sessionKey, result.data); 
                
                // 3. Navigate immediately to the request page
                navigate('/request'); 
                
                // We won't update scanResult state here since we navigate away immediately.
                return;
                
            } catch (e) {
                // Handle non-JSON data or parsing errors
                const parseError = `Data Found, but JSON Parsing Failed. Raw Data: ${result.data.substring(0, 50)}...`;
                finalResult = { data: null, error: parseError };
            }
        }
        
        // Only update state if the scan failed or data was invalid, staying on the current page
        setScanResult(finalResult);
        setStatus(finalResult.data ? "Scan complete!" : "Ready to scan.");
    };
    
    const handleCloseScanner = (): void => {
        setIsScanning(false);
        setStatus(scanResult ? "Last scan successful. Ready to scan." : "Ready to scan.");
    };
    
    // --- Conditional Rendering ---
    
    if (isScanning) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <ScannerComponent onScanComplete={handleScanComplete} onClose={handleCloseScanner} />
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50 flex-col p-4">

            {/* Result Display Card (Only visible if the initial check or a failed scan leaves data in state) */}
            {scanResult && (
                <div className={`p-6 rounded-xl shadow-xl mb-8 w-full max-w-md ${scanResult.data ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border-2`}>
                    <h3 className="text-xl font-bold mb-2">Last Scan Result</h3>
                    {scanResult.data ? (
                        <>
                            <p className="text-green-700 font-semibold">✅ Loaded from Session Storage.</p>
                            <div className="mt-3">
                                <p className="text-gray-600 mb-1 font-medium">Parsed JSON Object:</p>
                                <code className="block mt-1 p-3 bg-white rounded break-words text-sm border whitespace-pre-wrap shadow-inner">
                                    {scanResult.data}
                                </code>
                            </div>
                            <div className="mt-4 p-3 bg-gray-200 rounded text-sm border border-gray-300">
                                <p className="font-semibold text-gray-700 mb-1">Session Storage Confirmation (Key: `{sessionKey}`):</p>
                                <code className="block bg-gray-50 p-2 rounded text-xs break-words whitespace-pre-wrap">
                                    {sessionStorage.getItem(sessionKey) || "Error: Data not found in session storage."}
                                </code>
                            </div>
                        </>
                    ) : (
                        <p className="text-red-700 font-semibold">❌ Scan Failed: {scanResult.error}</p>
                    )}
                </div>
            )}

            {/* Tap to Enter Button */}
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