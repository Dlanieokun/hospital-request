import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

// Updated interface to include copies and optional subtotal tracking
interface ReceiptItem {
  label: string;
  price: number;
  copies: number; // Added to match data from RequestPage
  purpose?: string;
}

function ReceiptPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data with fallbacks
  const { 
    requests = [] as ReceiptItem[], 
    total = 0, 
    userName = "Guest", 
    timestamp = new Date().toLocaleString(),
    paymentMethod = "Clerk",
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
        throw new Error(data.message || "Payment request failed");
      }

      window.location.href = data.data.checkout_url;
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      
      {/* Receipt Layout */}
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden border-t-8 border-indigo-600 print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-dashed border-gray-200">
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-widest">Temporary Receipt</h1>
          <p className="text-gray-400 text-[10px] mt-1 italic uppercase tracking-widest">ID: {transactionId}</p>
          <p className="text-gray-500 text-sm mt-1">{timestamp}</p>
        </div>

        {/* Info */}
        <div className="px-8 py-4 bg-gray-50 flex justify-between items-center text-sm border-b border-gray-100">
          <span className="text-gray-500 font-medium">Patient :</span>
          <span className="text-gray-900 font-black uppercase">{userName}</span>
        </div>

        {/* Breakdown */}
        <div className="p-8 pb-4">
          <div className="space-y-6">
            {requests.map((item: ReceiptItem, index: number) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 leading-tight">
                    {item.label} 
                    <span className="ml-2 text-indigo-600 font-black">x{item.copies}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                    {item.purpose || "Certified Service"}
                  </p>
                  <p className="text-[10px] text-gray-400 italic">
                    Unit Price: ₱{item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-700">
                    ₱{(item.price * item.copies).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="my-6 border-b border-gray-100"></div>

          {/* Total Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>Payment Mode:</span>
              <span className={paymentMethod === 'Online' ? 'text-green-600' : 'text-orange-600'}>
                {paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-bold text-gray-800 tracking-tighter uppercase">Total Amount</span>
              <span className="text-2xl font-black text-indigo-600">₱{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center p-6 bg-white border-t border-gray-50">
          <div className="p-2 border-2 border-dashed border-gray-200 rounded-xl">
            <QRCodeCanvas 
              value={transactionId || "N/A"} 
              size={130}
              level={"H"} 
              includeMargin={true}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-mono tracking-[0.2em]">{transactionId}</p>
        </div>

        {/* Dynamic Message */}
        <div className="p-6 bg-indigo-50 text-center">
          <p className="text-[11px] text-indigo-700 font-black uppercase leading-tight">
            {paymentMethod === "Online" 
              ? "Transaction Verified. Keep this for your records." 
              : "Present this QR Code to the clerk for final processing."}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md print:hidden">
        
        {paymentMethod === "Online" && (
          <button 
            onClick={handlePayNow}
            className="flex-1 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-700 transition shadow-emerald-200"
          >
            Pay Now
          </button>
        )}

        <button 
          onClick={handlePrint}
          className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition"
        >
          Print Receipt
        </button>
        <button 
          onClick={handleDone}
          className="flex-1 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 transition shadow-indigo-200"
        >
          Finish
        </button>
      </div>
    </div>
  );
}

export default ReceiptPage;