import React, { createContext, useContext, useState, useRef } from 'react';
import { verifyPassword } from '../services/api';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

const ConfirmDeleteContext = createContext(null);

export const useConfirmDelete = () => {
  const context = useContext(ConfirmDeleteContext);
  if (!context) {
    throw new Error('useConfirmDelete must be used within a ConfirmDeleteProvider');
  }
  return context.confirmDelete;
};

export const ConfirmDeleteProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const resolveRef = useRef(null);

  const confirmDelete = (msg) => {
    setMessage(msg);
    setPassword('');
    setError('');
    setShowPassword(false);
    setIsOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleClose = (value) => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
  };

  const handleConfirm = async (e) => {
    if (e) e.preventDefault();
    setError('');
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      await verifyPassword(password);
      setLoading(false);
      handleClose(true);
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Invalid password. Please try again.';
      setError(errMsg);
    }
  };

  return (
    <ConfirmDeleteContext.Provider value={{ confirmDelete }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-[400px] overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Exclamation Warning Icon */}
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-red-50/50">
                <AlertCircle size={28} className="text-red-500" />
              </div>

              {/* Title */}
              <h3 className="text-[20px] font-bold text-slate-800 mb-2">Confirm Action</h3>

              {/* Message */}
              <p className="text-sm text-slate-500 mb-6 leading-relaxed px-2">
                {message || 'Enter your administrator password to confirm deletion.'}
              </p>

              {/* Password Form */}
              <form onSubmit={handleConfirm} className="w-full">
                <div className="relative mb-4">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none pr-10 ${
                      error
                        ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-xs font-semibold text-red-500 text-left mb-4 -mt-2 px-1">
                    {error}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-xl font-semibold text-slate-600 text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-red-300 rounded-xl font-semibold text-white text-sm transition-all shadow-md shadow-red-100 flex items-center justify-center gap-1"
                  >
                    {loading ? 'Verifying...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ConfirmDeleteContext.Provider>
  );
};
