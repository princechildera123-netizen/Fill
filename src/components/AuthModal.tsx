import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import {
  signInWithPassword,
  signUpWithPassword,
  sendPasswordResetEmail,
  AuthUser
} from '../services/authClient';

export type AuthView = 'login' | 'signup' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  initialView?: AuthView;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialView = 'login',
  onClose,
  onSuccess,
}) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (view === 'login') {
      if (!email || !password) {
        setErrorMsg('Please enter both your email address and password.');
        return;
      }
      setIsLoading(true);
      try {
        const res = await signInWithPassword(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          onSuccess(res.user);
          onClose();
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred during log in.');
      } finally {
        setIsLoading(false);
      }
    } else if (view === 'signup') {
      if (!fullName || !email || !password) {
        setErrorMsg('Please complete all fields.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      setIsLoading(true);
      try {
        const res = await signUpWithPassword(email, password, fullName);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.user) {
          onSuccess(res.user);
          onClose();
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to create your account.');
      } finally {
        setIsLoading(false);
      }
    } else if (view === 'forgot') {
      if (!email || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      setIsLoading(true);
      try {
        const res = await sendPasswordResetEmail(email);
        setSuccessMsg(res.message);
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not send reset instructions.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      id="auth-modal-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative">
          <div className="flex justify-center mb-3">
            <AppLogo size="md" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
            {view === 'login' && 'Welcome back'}
            {view === 'signup' && 'Create your FILL account'}
            {view === 'forgot' && 'Reset your password'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
            {view === 'login' && 'Sign in to access your personal Vault and saved forms.'}
            {view === 'signup' && 'Save your information once. FILL completes the rest.'}
            {view === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1" htmlFor="auth-name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1" htmlFor="auth-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>

            {view !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800" htmlFor="auth-password">
                    Password
                  </label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setView('forgot');
                      }}
                      className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {view === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1" htmlFor="auth-confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="auth-confirm-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {view === 'login' && (isLoading ? 'Logging in...' : 'Log in')}
                {view === 'signup' && (isLoading ? 'Creating account...' : 'Create account')}
                {view === 'forgot' && (isLoading ? 'Sending...' : 'Send reset link')}
              </span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
            {view === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setView('signup');
                  }}
                  className="font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                >
                  Create one
                </button>
              </p>
            ) : view === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setView('login');
                  }}
                  className="font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                >
                  Log in
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setView('login');
                }}
                className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to log in</span>
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
