import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';

const initialState = {
  requests: [],
  currentRequest: null,
  logs: [],
  loading: false,
  actionLoading: false, // specifically for state transitions to avoid blocking full screen
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  },
  filters: {
    status: '',
    search: '',
    page: 1,
  },
};

// Fetch requests based on role and filters
export const fetchRequests = createAsyncThunk(
  'requests/fetchAll',
  async ({ role, filters }, thunkAPI) => {
    try {
      const endpoint = role === 'User' ? '/my-requests' : '/requests';
      const response = await axiosInstance.get(endpoint, {
        params: {
          status: filters.status || undefined,
          search: filters.search || undefined,
          page: filters.page || 1,
          limit: 10,
        },
      });
      return response.data; // { success: true, count, pagination: { total, page, limit, pages }, data }
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || 'Failed to fetch requests';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch a single request by ID
export const fetchRequestById = createAsyncThunk(
  'requests/fetchById',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/requests/${id}`);
      return response.data; // { success: true, data }
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || 'Failed to fetch request';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch timeline logs for a request
export const fetchRequestLogs = createAsyncThunk(
  'requests/fetchLogs',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/requests/${id}/logs`);
      return response.data; // { success: true, data }
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || 'Failed to fetch logs';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create request thunk
export const createRequest = createAsyncThunk(
  'requests/create',
  async (requestData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/requests', requestData);
      return response.data; // { success: true, data }
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || 'Failed to create request';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update status thunk (workflow trigger)
export const updateRequestStatus = createAsyncThunk(
  'requests/updateStatus',
  async ({ id, status, comment }, thunkAPI) => {
    try {
      const response = await axiosInstance.patch(`/requests/${id}/status`, {
        status,
        comment,
      });
      // After updating status, reload logs to display on timeline
      thunkAPI.dispatch(fetchRequestLogs(id));
      return response.data; // { success: true, data }
    } catch (error) {
      const message =
        error.response?.data?.error || error.message || 'Failed to transition status';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { status: '', search: '', page: 1 };
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
      state.logs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Requests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Request Details
      .addCase(fetchRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload.data;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch logs
      .addCase(fetchRequestLogs.fulfilled, (state, action) => {
        state.logs = action.payload.data;
      })
      // Create request
      .addCase(createRequest.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createRequest.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update request status
      .addCase(updateRequestStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentRequest = action.payload.data;
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, resetFilters, clearCurrentRequest } = requestSlice.actions;
export default requestSlice.reducer;
