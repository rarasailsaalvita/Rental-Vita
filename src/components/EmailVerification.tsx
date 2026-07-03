import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, AlertCircle, Mail } from 'lucide-react';
import { verifyEmail } from '../lib/auth';

export const EmailVerificationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const user = await verifyEmail(token);
        if (user) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now login.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 pt-32">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-white/10 rounded-2xl p-8 text-center"
        >
          {status === 'loading' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6 flex justify-center"
              >
                <Mail className="w-12 h-12 text-brand-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
              <p className="text-slate-400">Please wait while we verify your email address</p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="mb-6 flex justify-center"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-slate-400 mb-6">{message}</p>
              <p className="text-xs text-slate-500">Redirecting to login in 3 seconds...</p>
              <Link
                to="/login"
                className="inline-block mt-6 px-6 py-2 bg-brand-400 hover:bg-brand-500 text-slate-950 rounded-lg font-semibold uppercase tracking-widest transition-colors"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-slate-400 mb-6">{message}</p>
              <div className="flex gap-3">
                <Link
                  to="/signup"
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold uppercase tracking-widest transition-colors"
                >
                  Back to Signup
                </Link>
                <Link
                  to="/login"
                  className="flex-1 px-4 py-2 bg-brand-400 hover:bg-brand-500 text-slate-950 rounded-lg font-semibold uppercase tracking-widest transition-colors"
                >
                  Login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
