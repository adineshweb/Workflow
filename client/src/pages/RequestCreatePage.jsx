import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import { createRequest } from '../redux/requestSlice';
import SidebarLayout from '../layouts/SidebarLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import gsap from 'gsap';

// Validation Schema
const schema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Please provide a more detailed description (min 10 characters)'),
  category: yup.string().required('Category is required'),
  priority: yup
    .string()
    .required('Priority is required')
    .oneOf(['Low', 'Medium', 'High'], 'Invalid priority selected'),
});

const RequestCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { actionLoading } = useSelector((state) => state.requests);

  const containerRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      priority: 'Medium',
    },
  });

  // Entrance animations
  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
    );
    gsap.fromTo('.gsap-field',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.15 }
    );
  }, []);

  const onSubmit = async (data) => {
    try {
      await dispatch(createRequest(data)).unwrap();
      toast.success('Workflow request successfully submitted!');
      setTimeout(() => {
        navigate('/dashboard/user');
      }, 1500);
    } catch (err) {
      toast.error(err || 'Failed to create request');
    }
  };

  return (
    <SidebarLayout>
      <div 
        ref={containerRef}
        className="mx-auto max-w-2xl bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm"
      >
        <ToastContainer position="top-right" autoClose={2000} />
        
        <div className="border-b border-slate-100 pb-4 mb-6 gsap-field">
          <h2 className="text-xl font-extrabold text-slate-900">
            Submit New Workflow Request
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete the form details below. Once submitted, your department manager will review the details.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="gsap-field">
            <Input
              label="Request Title"
              name="title"
              placeholder="e.g. Upgrade Development IDE Licenses"
              error={errors.title?.message}
              {...register('title')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 gsap-field">
            <div>
              <Input
                label="Category"
                name="category"
                placeholder="e.g. Software License, Hardware"
                error={errors.category?.message}
                {...register('category')}
              />
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:ring-offset-0"
                {...register('priority')}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-xs font-semibold text-rose-600">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          <div className="gsap-field">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Description & Justification
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide complete business justification, technical reasons, and estimated budgets if applicable..."
              className={`block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                errors.description
                  ? 'border-rose-300 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 bg-white focus:border-brand-500 focus:ring-brand-100'
              }`}
              {...register('description')}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-xs font-semibold text-rose-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 mt-6 gsap-field">
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard/user')}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={actionLoading}
              className="bg-brand-850 hover:bg-brand-950"
            >
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
};

export default RequestCreatePage;
