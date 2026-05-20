import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldAlert } from 'lucide-react';
import Button from '../components/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleReturn = () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    // Direct user to correct dashboard
    if (user.role === 'Admin') {
      navigate('/dashboard/admin');
    } else if (user.role === 'Manager') {
      navigate('/dashboard/manager');
    } else {
      navigate('/dashboard/user');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 text-center relative overflow-hidden">
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="z-10 max-w-md space-y-6">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-550/20 shadow-lg shadow-rose-500/10">
          <ShieldAlert size={36} />
        </span>
        <h1 className="text-6xl font-extrabold tracking-tight text-white font-sans">
          404
        </h1>
        <h2 className="text-2xl font-bold text-slate-200">
          Page Not Found
        </h2>
        <p className="text-sm text-slate-400">
          The link you followed may be broken, or your user session might not have permission to view this resource.
        </p>
        <div className="pt-4">
          <Button onClick={handleReturn} className="bg-brand-600 hover:bg-brand-700 px-6 py-2.5">
            Return to Safety
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
