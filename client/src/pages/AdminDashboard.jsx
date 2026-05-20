import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { fetchRequests, setFilter, resetFilters } from '../redux/requestSlice';
import { Search, RefreshCw, Layers, ShieldCheck, Archive, Users } from 'lucide-react';
import SidebarLayout from '../layouts/SidebarLayout';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import gsap from 'gsap';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { requests, loading, filters, pagination } = useSelector((state) => state.requests);

  // GSAP animation refs
  const welcomeRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchRequests({ role: user?.role, filters }));
  }, [dispatch, user?.role, filters.status, filters.search, filters.page]);

  // Entrance animations
  useEffect(() => {
    gsap.fromTo(welcomeRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );

    if (cardsContainerRef.current) {
      gsap.fromTo(cardsContainerRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.15 }
      );
    }

    gsap.fromTo(tableContainerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.4 }
    );
  }, []);

  const handleSearchChange = (e) => {
    dispatch(setFilter({ search: e.target.value, page: 1 }));
  };

  const handleStatusFilterChange = (status) => {
    dispatch(setFilter({ status, page: 1 }));
  };

  const handlePageChange = (page) => {
    dispatch(setFilter({ page }));
  };

  const handleRefresh = () => {
    dispatch(fetchRequests({ role: user?.role, filters }));
  };

  // Stats calculation
  const totalCount = pagination.total || 0;
  const pendingClose = requests.filter((r) => r.status === 'Approved').length;
  const closedCount = requests.filter((r) => r.status === 'Closed' || r.status === 'Rejected').length;

  const columns = [
    {
      header: 'Requestor',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.user_id?.name || 'Unknown'}</div>
          <div className="text-xs text-slate-400">{row.user_id?.email || ''}</div>
        </div>
      ),
    },
    {
      header: 'Title & Details',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <div className="text-xs text-slate-400 truncate max-w-xs">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
    },
    {
      header: 'Priority',
      accessor: (row) => {
        const priorityColors = {
          Low: 'bg-slate-100 text-slate-700',
          Medium: 'bg-amber-100 text-amber-700',
          High: 'bg-rose-100 text-rose-700',
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${priorityColors[row.priority] || 'bg-slate-100'}`}>
            {row.priority}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Last Update',
      accessor: (row) => new Date(row.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <RouterLink
          to={`/request/details/${row._id}`}
          className="inline-flex items-center rounded-md bg-brand-850 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-950 transition-all"
        >
          Manage Workflow
        </RouterLink>
      ),
    },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div 
          ref={welcomeRef}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs"
        >
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Executive Administrator Console
            </h2>
            <p className="text-sm text-slate-500">
              Oversee all workflows, archive finalized requests, and audit approval status.
            </p>
          </div>
          <div>
            <Button variant="secondary" onClick={handleRefresh} className="px-3">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Admin Stats Card Row */}
        <div 
          ref={cardsContainerRef}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <Layers size={24} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Workflows</p>
              <h4 className="text-2xl font-bold text-slate-900">{totalCount}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <ShieldCheck size={24} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">Awaiting Close</p>
              <h4 className="text-2xl font-bold text-slate-900">{pendingClose}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Archive size={24} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">Archived/Closed</p>
              <h4 className="text-2xl font-bold text-slate-900">{closedCount}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Users size={24} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">System Users</p>
              <h4 className="text-2xl font-bold text-slate-900">3</h4>
            </div>
          </div>
        </div>

        {/* Global Workflows Table */}
        <div 
          ref={tableContainerRef}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Active Workflows</h3>
              <p className="text-xs text-slate-400 mt-0.5">Filter by any status transition.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="w-full sm:w-60 rounded-lg border border-slate-350 bg-white py-1.5 pl-10 pr-3.5 text-sm placeholder:text-slate-450 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {[
                  { value: '', label: 'All' },
                  { value: 'Approved', label: 'Approved (Awaiting Close)' },
                  { value: 'Closed', label: 'Closed' },
                  { value: 'Needs Clarification', label: 'Clarification' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleStatusFilterChange(item.value)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                      filters.status === item.value
                        ? 'bg-white text-brand-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={requests}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              emptyMessage="No requests match current filters in administration log."
            />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AdminDashboard;
