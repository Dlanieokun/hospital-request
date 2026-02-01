import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const API_BASE_URL = "http://127.0.0.1:8000/api";

interface ReceiptItem {
  label: string;
  price: number;
  copies: number;
  purpose?: string;
}

function ReceiptPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { 
    requests = [] as ReceiptItem[], 
    total = 0, 
    userName = "Guest", 
    timestamp = new Date().toLocaleString(),
    paymentMethod = "Hospital Casher",
    transactionId = "",
    p_id = "", 
  } = location.state || {};

  const handleDone = () => {
    sessionStorage.removeItem("qrCodeDataJson");
    navigate('/scanner');
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePayNow = async () => {
    if (!navigator.onLine) {
      alert("Network connection lost. Please reconnect to the internet.");
      return;
    }

    if (!p_id) {
      alert("Missing Reference ID (p_id). Please contact support.");
      return;
    }

    try {
      const pay = {
        amount: total,
        codeId: 1,
        fullname: userName,
        reference_code: p_id,
      };

      const response = await fetch(
        "https://apps.leyteprovince.gov.ph/online-payment-api/public/api/v1/payments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(pay),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("API Validation Errors:", data);
        throw new Error(data.message || "Payment request failed");
      }

      const setRef = await fetch(`${API_BASE_URL}/online-ref/${transactionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ref: data.data.id}),
      });

      if (data.data?.checkout_url) {
        window.open(data.data.checkout_url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error("Payment URL not provided by the server.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error instanceof Error ? error.message : "Failed to launch payment.");
    }
  };

  return (
    // 'items-center justify-center' is for the screen view only
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 print:block print:p-0 print:bg-white">
      
      {/* Thermal Print Configuration */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: 48mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            width: 48mm;
            -webkit-print-color-adjust: exact;
          }
          /* Reset centering for print */
          .print-wrapper {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 48mm !important;
          }
          .receipt-card {
            width: 48mm !important;
            max-width: 48mm !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 2mm !important;
            position: absolute;
            top: 0;
            left: 0;
          }
          .no-print {
            display: none !important;
          }
          /* Small text scaling for narrow paper */
          .thermal-text-xs { font-size: 8px !important; line-height: 1; }
          .thermal-text-sm { font-size: 10px !important; }
          .thermal-text-base { font-size: 12px !important; }
          .thermal-qr { width: 120px !important; height: 120px !important; }
        }
      `}} />

      {/* Receipt Card Wrapper */}
      <div className="print-wrapper w-full max-w-md">
        <div className="receipt-card bg-white rounded-lg shadow-2xl overflow-hidden border-t-8 border-indigo-600 print:border-none">
          
          <div className="p-4 text-center border-b border-dashed border-gray-200">
            <h1 className="text-xl font-black text-gray-800 uppercase print:text-xs">Temporary Receipt</h1>
            <p className="text-gray-400 text-[10px] mt-1 italic uppercase tracking-widest thermal-text-xs">ID: {transactionId}</p>
            <p className="text-gray-500 text-xs mt-1 thermal-text-xs">{timestamp}</p>
          </div>

          <div className="px-4 py-2 bg-gray-50 flex justify-between items-center border-b border-gray-100">
            <span className="text-gray-500 font-medium text-xs thermal-text-xs">Patient:</span>
            <span className="text-gray-900 font-black uppercase text-xs thermal-text-xs">{userName}</span>
          </div>

          <div className="p-4 pb-2">
            <div className="space-y-3">
              {requests.map((item: ReceiptItem, index: number) => (
                <div key={index} className="flex justify-between items-start border-b border-gray-50 pb-2">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 leading-tight text-xs thermal-text-sm">
                      {item.label} 
                      <span className="ml-1 text-indigo-600 font-black">x{item.copies}</span>
                    </p>
                    <p className="text-[9px] text-gray-400 uppercase thermal-text-xs">
                      {item.purpose || "Service"}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <span className="font-bold text-gray-700 text-xs thermal-text-sm">
                      ₱{(item.price * item.copies).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 mt-4">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase thermal-text-xs">
                <span>Method:</span>
                <span className={paymentMethod === 'Online' ? 'text-green-600' : 'text-orange-600'}>
                  {paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-black">
                <span className="text-sm font-bold text-gray-800 uppercase thermal-text-sm">Total</span>
                <span className="text-lg font-black text-indigo-600 thermal-text-base">₱{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-white">
            <div className="p-1 border border-dashed border-gray-300">
              <QRCodeCanvas 
                  value={transactionId || "N/A"} 
                  size={120} 
                  level={"M"} 
                  includeMargin={false}
                  className="thermal-qr"
              />
            </div>
            <p className="text-[8px] text-gray-400 mt-2 font-mono thermal-text-xs">{transactionId}</p>
          </div>

          <div className="p-4 bg-gray-50 text-center border-t border-dashed border-gray-200">
            <p className="text-[9px] text-gray-600 font-bold uppercase leading-tight thermal-text-xs">
              {paymentMethod === "Online" 
                ? "Payment Pending Online" 
                : "Present to Cashier"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md no-print">
        {paymentMethod === "Online" && (
          <button 
            onClick={handlePayNow}
            className="flex-1 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-700 transition"
          >
            Pay Now
          </button>
        )}
        {paymentMethod !== "Online" && (
          <button onClick={handlePrint} className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition">
            Print Receipt
          </button>
        )}
        <button onClick={handleDone} className="flex-1 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition">
          Finish
        </button>
      </div>
    </div>
  );
}

export default ReceiptPage;