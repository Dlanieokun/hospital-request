import React from 'react';
import { Clock } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  countdown: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  countdown,
  onStayLoggedIn,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-200">
        <div className="flex flex-col items-center text-center gap-4">

          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="text-amber-500" size={32} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Session Expiring Soon</h2>
            <p className="text-sm text-slate-500 mt-1">You've been inactive for a while.</p>
          </div>

          <div className="w-full bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-sm text-amber-700 font-medium">
              Logging out in{' '}
              <span className="text-2xl font-bold text-amber-600 mx-1">{countdown}</span>
              {' '}seconds
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onLogout}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              Logout Now
            </button>
            <button
              onClick={onStayLoggedIn}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Stay Logged In
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;