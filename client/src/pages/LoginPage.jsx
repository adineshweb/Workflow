import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import { loginUser, registerUser, clearError } from '../redux/authSlice';
import { ShieldCheck } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import gsap from 'gsap';

// Form Validation Schemas
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required'),
});

const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user, loading, error } = useSelector((state) => state.auth);
  
  // Toggle between login and registration views
  const [isRegister, setIsRegister] = useState(false);

  // GSAP animation refs
  const cardRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  // Redirect if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'Manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/dashboard/user');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Display errors if API request fails
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // GSAP Animations: Load & Floating blobs
  useEffect(() => {
    // Floating background blobs
    gsap.to(blob1Ref.current, {
      x: 'random(-40, 40)',
      y: 'random(-40, 40)',
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    gsap.to(blob2Ref.current, {
      x: 'random(-40, 40)',
      y: 'random(-40, 40)',
      duration: 7,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Intro entrance of Card
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
    );
  }, []);

  // GSAP Transition when switching forms
  const toggleFormMode = () => {
    gsap.to(cardRef.current, {
      opacity: 0,
      scale: 0.9,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        setIsRegister(!isRegister);
        resetLoginForm();
        resetRegisterForm();
        
        // Stagger fade-in inputs of the newly shown form
        gsap.fromTo(cardRef.current,
          { opacity: 0, scale: 0.9, y: -20 },
          { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            duration: 0.4, 
            ease: 'power3.out',
            onStart: () => {
              gsap.fromTo('.gsap-field',
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, delay: 0.1 }
              );
            }
          }
        );
      }
    });
  };

  const onLoginSubmit = (data) => {
    dispatch(loginUser(data));
  };

  const onRegisterSubmit = (data) => {
    const { name, email, password } = data;
    dispatch(registerUser({ name, email, password }))
      .unwrap()
      .then(() => {
        toast.success('Account successfully registered!');
      });
  };

  // Helper function to autofill test credentials
  const handleQuickLogin = (email, password) => {
    setLoginValue('email', email);
    setLoginValue('password', password);
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-900 px-6 py-12 lg:px-8 relative overflow-hidden">
      {/* Decorative colored blobs for premium aesthetic */}
      <div 
        ref={blob1Ref} 
        className="absolute top-10 left-10 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl pointer-events-none"
      ></div>
      <div 
        ref={blob2Ref} 
        className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"
      ></div>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xl shadow-brand-500/20">
            <ShieldCheck size={26} />
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white font-sans">
          {isRegister ? 'Create your account' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          MERN Role-Based Approval & Workflow Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div 
          ref={cardRef} 
          className="bg-slate-800/60 backdrop-blur-md px-6 py-8 shadow-2xl rounded-2xl border border-slate-700/50 sm:px-10"
        >
          {!isRegister ? (
            /* SIGN IN FORM */
            <form className="space-y-6" onSubmit={handleLoginSubmit(onLoginSubmit)}>
              <div className="gsap-field">
                <Input
                  label={<span className="text-slate-350">Email Address</span>}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  error={loginErrors.email?.message}
                  className="bg-slate-900 border-slate-750 text-white placeholder:text-slate-500 focus:border-brand-500 focus:ring-brand-500/20 focus:bg-slate-900"
                  {...loginRegister('email')}
                />
              </div>

              <div className="gsap-field">
                <Input
                  label={<span className="text-slate-350">Password</span>}
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  error={loginErrors.password?.message}
                  className="bg-slate-900 border-slate-750 text-white font-semibold placeholder:text-slate-500 focus:border-brand-500 focus:ring-brand-500/20 focus:bg-slate-900"
                  {...loginRegister('password')}
                />
              </div>

              <div className="gsap-field">
                <Button type="submit" isLoading={loading} fullWidth className="bg-brand-600 hover:bg-brand-700">
                  Sign In
                </Button>
              </div>

              <div className="text-center mt-4 gsap-field">
                <p className="text-xs text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleFormMode}
                    className="font-semibold text-brand-400 hover:text-brand-300 hover:underline focus:outline-none"
                  >
                    Create new account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* CREATE ACCOUNT FORM */
            <form className="space-y-4" onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
              <div className="gsap-field">
                <Input
                  label={<span className="text-slate-350">Full Name</span>}
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  error={registerErrors.name?.message}
                  className="bg-slate-900 border-slate-750 text-white placeholder:text-slate-500 focus:border-brand-500 focus:ring-brand-500/20 focus:bg-slate-900"
                  {...registerRegister('name')}
                />
              </div>

              <div className="gsap-field">
                <Input
                  label={<span className="text-slate-350">Email Address (Gmail)</span>}
                  type="email"
                  name="email"
                  placeholder="john.doe@gmail.com"
                  error={registerErrors.email?.message}
                  className="bg-slate-900 border-slate-750 text-white placeholder:text-slate-500 focus:border-brand-500 focus:ring-brand-500/20 focus:bg-slate-900"
                  {...registerRegister('email')}
                />
              </div>

              <div className="gsap-field">
                <Input
                  label={<span className="text-slate-350">Password</span>}
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  error={registerErrors.password?.message}
                  className="bg-slate-900 border-slate-750 text-white font-semibold placeholder:text-slate-500 focus:border-brand-500 focus:ring-brand-500/20 focus:bg-slate-900"
                  {...registerRegister('password')}
                />
              </div>

              <div className="gsap-field">
                <Input
                  label={<span className="text-slate-350">Confirm Password</span>}
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  error={registerErrors.confirmPassword?.message}
                  className="bg-slate-900 border-slate-750 text-white font-semibold placeholder:text-slate-500 focus:border-brand-500 focus:ring-brand-500/20 focus:bg-slate-900"
                  {...registerRegister('confirmPassword')}
                />
              </div>

              <div className="pt-2 gsap-field">
                <Button type="submit" isLoading={loading} fullWidth className="bg-brand-600 hover:bg-brand-700">
                  Register Account
                </Button>
              </div>

              <div className="text-center mt-4 gsap-field">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={toggleFormMode}
                    className="font-semibold text-brand-400 hover:text-brand-300 hover:underline focus:outline-none"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Quick Login Section for Easy testing (only visible in Login Mode) */}
          {!isRegister && (
            <div className="mt-8 gsap-field">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800/0 px-2 text-slate-400 font-bold bg-[#141b2e] rounded-sm">
                    Quick Login Demo
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('user@example.com', 'Password123')}
                  className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/40 p-2 text-center text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
                >
                  <span className="text-brand-400">User</span>
                  <span className="text-[9px] font-normal text-slate-400">Employee</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('manager@example.com', 'Password123')}
                  className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/40 p-2 text-center text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
                >
                  <span className="text-amber-400">Manager</span>
                  <span className="text-[9px] font-normal text-slate-400">Reviewer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@example.com', 'Password123')}
                  className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/40 p-2 text-center text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
                >
                  <span className="text-purple-400">Admin</span>
                  <span className="text-[9px] font-normal text-slate-400">Executive</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
