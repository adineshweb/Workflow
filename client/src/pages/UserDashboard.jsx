import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { fetchRequests, setFilter, resetFilters } from '../redux/requestSlice';
import { PlusCircle, Search, RefreshCw, FileText, CheckCircle, HelpCircle, Hourglass } from 'lucide-react';
import SidebarLayout from '../layouts/SidebarLayout';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import gsap from 'gsap';

const UserDashboard = () => {
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

  // Compute stat counts from list (or default placeholders)
  const totalCount = pagination.total || 0;
  const approvedCount = requests.filter((r) => r.status === 'Approved' || r.status === 'Closed').length;
  const pendingCount = requests.filter((r) => r.status === 'Submitted' || r.status === 'Reopened').length;
  const clarificationCount = requests.filter((r) => r.status === 'Needs Clarification').length;

  const columns = [
    {
      header: 'Request Details',
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
      header: 'Created On',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(undefined, {
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
          className="text-xs font-bold text-brand-600 hover:text-brand-850 hover:underline"
        >
          View Details
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
              Welcome back, {user?.name}!
            </h2>
            <p className="text-sm text-slate-500">
              Here is a summary of your recent approval requests and workflow updates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              className="px-3"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
            <RouterLink to="/request/create">
              <Button className="bg-brand-800 hover:bg-brand-900">
                <PlusCircle size={16} className="mr-2" />
                New Request
              </Button>
            </RouterLink>
          </div>
        </div>

        {/* User Stats Grid */}
        <div 
          ref={cardsContainerRef} 
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <FileText size={24} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Requests</p>
              <h4 className="text-2xl font-bold text-slate-900">{totalCount}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle size={24} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">Approved/Closed</p>
              <h4 className="text-2xl font-bold text-slate-900">{approvedCount}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Hourglass size={24} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">Pending Actions</p>
              <h4 className="text-2xl font-bold text-slate-900">{pendingCount}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <HelpCircle size={24} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-500">Clarification Needed</p>
              <h4 className="text-2xl font-bold text-slate-900">{clarificationCount}</h4>
            </div>
          </div>
        </div>

        {/* Filter and Table Section */}
        <div 
          ref={tableContainerRef} 
          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-bold text-slate-950">My Requests</h3>
            
            {/* Filter controls */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="w-full sm:w-64 rounded-lg border border-slate-350 bg-white py-1.5 pl-10 pr-3.5 text-sm placeholder:text-slate-450 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {['', 'Submitted', 'Needs Clarification', 'Approved', 'Closed', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilterChange(status)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                      filters.status === status
                        ? 'bg-white text-brand-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status === '' ? 'All' : status}
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
              emptyMessage="No requests found. Create one to get started!"
            />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default UserDashboard;
