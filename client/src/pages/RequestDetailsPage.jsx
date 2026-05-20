import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequestById, fetchRequestLogs, updateRequestStatus, clearCurrentRequest } from '../redux/requestSlice';
import { toast, ToastContainer } from 'react-toastify';
import { ArrowLeft, User, Calendar, Tag, Shield, Clock, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import SidebarLayout from '../layouts/SidebarLayout';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import gsap from 'gsap';

const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { currentRequest, logs, loading, actionLoading } = useSelector((state) => state.requests);

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'Approve', 'Reject', 'Needs Clarification', 'Submitted', 'Closed', 'Reopened'
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  // GSAP animation refs
  const detailsCardRef = useRef(null);
  const actionPanelRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    dispatch(fetchRequestById(id));
    dispatch(fetchRequestLogs(id));

    return () => {
      dispatch(clearCurrentRequest());
    };
  }, [dispatch, id]);

  // Entrance animations when data loads
  useEffect(() => {
    if (currentRequest) {
      gsap.fromTo(detailsCardRef.current,
        { opacity: 0, x: -35 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' }
      );
      
      gsap.fromTo(actionPanelRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.2 }
      );

      gsap.fromTo(timelineRef.current,
        { opacity: 0, x: 35 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.3 }
      );

      // Stagger items inside timeline
      gsap.fromTo('.gsap-timeline-item',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', delay: 0.45 }
      );
    }
  }, [currentRequest]);

  const handleBack = () => {
    if (user?.role === 'Admin') {
      navigate('/dashboard/admin');
    } else if (user?.role === 'Manager') {
      navigate('/dashboard/manager');
    } else {
      navigate('/dashboard/user');
    }
  };

  const openActionModal = (type) => {
    setActionType(type);
    setComment('');
    setCommentError('');
    setModalOpen(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();

    if (['Reject', 'Needs Clarification', 'Reopened'].includes(actionType) && !comment.trim()) {
      setCommentError('A justification comment is required for this action.');
      return;
    }

    try {
      let targetStatus = '';
      if (actionType === 'Approve') targetStatus = 'Approved';
      else if (actionType === 'Reject') targetStatus = 'Rejected';
      else if (actionType === 'Needs Clarification') targetStatus = 'Needs Clarification';
      else if (actionType === 'Submitted') targetStatus = 'Submitted';
      else if (actionType === 'Closed') targetStatus = 'Closed';
      else if (actionType === 'Reopened') targetStatus = 'Reopened';

      await dispatch(
        updateRequestStatus({
          id,
          status: targetStatus,
          comment: comment.trim(),
        })
      ).unwrap();

      toast.success(`Workflow successfully moved to: ${targetStatus}`);
      setModalOpen(false);
      
      // Reload request details
      dispatch(fetchRequestById(id));
      dispatch(fetchRequestLogs(id));
    } catch (err) {
      toast.error(err || 'Failed to update request workflow');
    }
  };

  if (loading && !currentRequest) {
    return (
      <SidebarLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
        </div>
      </SidebarLayout>
    );
  }

  if (!currentRequest) {
    return (
      <SidebarLayout>
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500 font-semibold">Request not found or access denied.</p>
          <Button variant="secondary" onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </SidebarLayout>
    );
  }

  const isCreator = currentRequest.user_id?._id === user?._id;
  const reqStatus = currentRequest.status;
  const userRole = user?.role;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <ToastContainer position="top-right" autoClose={2000} />
        
        {/* Navigation row */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              ref={detailsCardRef}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Request ID: #{currentRequest._id.substring(currentRequest._id.length - 8)}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {currentRequest.title}
                  </h2>
                </div>
                <div>
                  <StatusBadge status={currentRequest.status} />
                </div>
              </div>

              {/* Attributes Meta */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <User size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Requester</p>
                    <p className="text-xs font-semibold text-slate-850 truncate max-w-[120px]" title={currentRequest.user_id?.name}>
                      {currentRequest.user_id?.name || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <Calendar size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Created</p>
                    <p className="text-xs font-semibold text-slate-850">
                      {new Date(currentRequest.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <Tag size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
                    <p className="text-xs font-semibold text-slate-850 truncate max-w-[100px]">
                      {currentRequest.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <Shield size={16} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Priority</p>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xxs font-bold ${
                      currentRequest.priority === 'High'
                        ? 'bg-rose-50 text-rose-700'
                        : currentRequest.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-50 text-slate-700'
                    }`}>
                      {currentRequest.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Body */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <FileText size={14} />
                  Description / Justification
                </h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                  {currentRequest.description}
                </p>
              </div>
            </div>

            {/* Workflow Control Box */}
            <div 
              ref={actionPanelRef}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs"
            >
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={16} className="text-brand-600" />
                Workflow Actions Panel
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Manager Actions */}
                {userRole === 'Manager' && ['Submitted', 'Reopened'].includes(reqStatus) && (
                  <>
                    <Button
                      variant="success"
                      onClick={() => openActionModal('Approve')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Approve Request
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => openActionModal('Reject')}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700"
                    >
                      Reject Request
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => openActionModal('Needs Clarification')}
                      className="px-5 py-2.5 border-amber-350 text-amber-800 hover:bg-amber-50"
                    >
                      Needs Clarification
                    </Button>
                  </>
                )}

                {/* 2. User Actions (Resubmit Clarifications / Rejections) */}
                {userRole === 'User' && ['Needs Clarification', 'Rejected'].includes(reqStatus) && isCreator && (
                  <Button
                    variant="primary"
                    onClick={() => openActionModal('Submitted')}
                    className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900"
                  >
                    Resubmit Request
                  </Button>
                )}

                {/* 3. Admin Actions (Close / Reopen) */}
                {userRole === 'Admin' && reqStatus === 'Approved' && (
                  <Button
                    variant="success"
                    onClick={() => openActionModal('Closed')}
                    className="px-6 py-2.5 bg-brand-850 hover:bg-brand-950"
                  >
                    Archived & Close Request
                  </Button>
                )}

                {userRole === 'Admin' && ['Closed', 'Rejected'].includes(reqStatus) && (
                  <Button
                    variant="secondary"
                    onClick={() => openActionModal('Reopened')}
                    className="px-6 py-2.5 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Reopen Request
                  </Button>
                )}

                {/* State when no actions are available */}
                {((userRole === 'User' && !['Needs Clarification', 'Rejected'].includes(reqStatus)) ||
                  (userRole === 'Manager' && !['Submitted', 'Reopened'].includes(reqStatus)) ||
                  (userRole === 'Admin' && !['Approved', 'Closed', 'Rejected'].includes(reqStatus))) && (
                  <p className="text-xs text-slate-400 italic">
                    No actions are currently required from your user role for this request state.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Logs Timeline */}
          <div 
            ref={timelineRef}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs"
          >
            <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Activity Log & Timeline
            </h3>

            <div className="relative border-l-2 border-slate-150 pl-4 space-y-6">
              {logs.map((log, index) => (
                <div key={log._id || index} className="relative gsap-timeline-item">
                  {/* Timeline Dot Indicator */}
                  <span className="absolute -left-[23.5px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-brand-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-700"></span>
                  </span>

                  {/* Transition Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {log.changed_by?.name || 'Requester'}
                      </span>
                      <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-655 border border-slate-200">
                        {log.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <span>Transitioned to</span>
                      <span className="font-semibold text-slate-700 underline">{log.new_status}</span>
                    </div>

                    {log.comment && (
                      <div className="mt-1.5 rounded-lg bg-slate-50/70 border border-slate-100 p-2 text-xs text-slate-600 italic">
                        &ldquo;{log.comment}&rdquo;
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock size={10} />
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Decision Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${actionType === 'Submitted' ? 'Resubmit' : actionType} Request Decision`}
      >
        <form onSubmit={handleActionSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            {['Reject', 'Needs Clarification', 'Reopened'].includes(actionType)
              ? 'Please provide a detailed comment/justification (Required).'
              : 'Add optional notes or instructions for the next stage in the workflow process.'}
          </p>

          <div>
            <label htmlFor="modal-comment" className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Decision Comments {['Reject', 'Needs Clarification', 'Reopened'].includes(actionType) && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              id="modal-comment"
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (e.target.value.trim()) setCommentError('');
              }}
              placeholder="e.g. Approved budget is inside departmental allocations, item ordered..."
              className={`block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                commentError
                  ? 'border-rose-350 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'
              }`}
            ></textarea>
            {commentError && (
              <p className="mt-1 text-xs font-semibold text-rose-600">{commentError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-5">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={actionLoading}
              className={
                actionType === 'Reject'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : actionType === 'Approve'
                  ? 'bg-emerald-600 hover:bg-emerald-750'
                  : 'bg-brand-850 hover:bg-brand-950'
              }
            >
              Confirm {actionType === 'Submitted' ? 'Resubmit' : actionType}
            </Button>
          </div>
        </form>
      </Modal>
    </SidebarLayout>
  );
};

export default RequestDetailsPage;
