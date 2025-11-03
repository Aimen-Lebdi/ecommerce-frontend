/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchActivitiesAPI,
  fetchDashboardActivitiesAPI,
  fetchActivitiesByTypeAPI,
  fetchUserActivitiesAPI,
  fetchActivityStatsAPI,
  fetchSingleActivityAPI,
  cleanupOldActivitiesAPI,
  type ActivitiesQueryParams,
  type ActivitiesResponse,
  // type ActivityStatsResponse,
} from "./activitiesAPI";

// Define the Activity type to match backend response
export interface Activity {
  _id: string;
  type: string;
  activity: string;
  user: {
    name: string;
    id: string;
    role: string;
  };
  description: string;
  status: "success" | "failed" | "pending";
  amount?: number;
  relatedId: string;
  relatedModel: string;
  metadata: any;
  createdAt: string;
  updatedAt?: string;
}

// Pagination metadata interface
export interface PaginationMeta {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  nextPage?: number;
  previousPage?: number;
  totalResults: number;
}

// Activity stats interface
export interface ActivityStats {
  timeframe: string;
  totalActivities: number;
  typeStats: Array<{ _id: string; count: number }>;
  dailyStats: Array<{ _id: string; count: number }>;
}

// State interface for activities slice
interface ActivitiesState {
  // Main activities data
  activities: Activity[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  currentQueryParams: ActivitiesQueryParams;

  // Dashboard specific
  dashboardActivities: Activity[];
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Real-time activities (from socket)
  realtimeActivities: Activity[];
  isConnected: boolean;

  // Statistics
  stats: ActivityStats | null;
  statsLoading: boolean;
  statsError: string | null;

  // Single activity
  singleActivity: Activity | null;
  singleActivityLoading: boolean;
  singleActivityError: string | null;

  // Cleanup
  isCleaningUp: boolean;
  cleanupError: string | null;
}

// Initial state
const initialState: ActivitiesState = {
  // Main activities
  activities: [],
  pagination: null,
  loading: false,
  error: null,
  currentQueryParams: {},

  // Dashboard
  dashboardActivities: [],
  dashboardLoading: false,
  dashboardError: null,

  // Real-time
  realtimeActivities: [],
  isConnected: false,

  // Statistics
  stats: null,
  statsLoading: false,
  statsError: null,

  // Single activity
  singleActivity: null,
  singleActivityLoading: false,
  singleActivityError: null,

  // Cleanup
  isCleaningUp: false,
  cleanupError: null,
};

// Async thunk to fetch activities with query parameters
export const fetchActivities = createAsyncThunk<
  { activities: Activity[]; pagination: PaginationMeta },
  ActivitiesQueryParams,
  { rejectValue: { message: string; status?: number } }
>("activities/fetchActivities", async (queryParams, { rejectWithValue }) => {
  try {
    const response: ActivitiesResponse = await fetchActivitiesAPI(queryParams);

    return {
      activities: response.activities,
      pagination: {
        currentPage:
          response.pagination?.currentPage || response.currentPage || 1,
        limit: response.pagination?.limit || 20,
        numberOfPages:
          response.pagination?.numberOfPages || response.totalPages || 1,
        nextPage: response.pagination?.nextPage,
        previousPage: response.pagination?.previousPage,
        totalResults: response.result || response.total || 0,
      },
    };
  } catch (err: any) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;

    if (status === 404) {
      return {
        activities: [],
        pagination: {
          currentPage: 1,
          limit: queryParams.limit || 20,
          numberOfPages: 0,
          totalResults: 0,
        },
      };
    }

    return rejectWithValue({ message, status });
  }
});

// Async thunk to fetch dashboard activities
export const fetchDashboardActivities = createAsyncThunk<
  Activity[],
  void,
  { rejectValue: string }
>("activities/fetchDashboardActivities", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchDashboardActivitiesAPI();
    return response.activities;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to fetch activities by type
export const fetchActivitiesByType = createAsyncThunk<
  { activities: Activity[]; pagination: PaginationMeta },
  { type: string; queryParams?: ActivitiesQueryParams },
  { rejectValue: string }
>(
  "activities/fetchActivitiesByType",
  async ({ type, queryParams = {} }, { rejectWithValue }) => {
    try {
      const response = await fetchActivitiesByTypeAPI(type, queryParams);
      return {
        activities: response.activities,
        pagination: {
          currentPage: response.currentPage || 1,
          limit: queryParams.limit || 20,
          numberOfPages: response.totalPages || 1,
          totalResults: response.total || 0,
        },
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to fetch user activities
export const fetchUserActivities = createAsyncThunk<
  { activities: Activity[]; pagination: PaginationMeta },
  { userId: string; queryParams?: ActivitiesQueryParams },
  { rejectValue: string }
>(
  "activities/fetchUserActivities",
  async ({ userId, queryParams = {} }, { rejectWithValue }) => {
    try {
      const response = await fetchUserActivitiesAPI(userId, queryParams);
      return {
        activities: response.activities,
        pagination: {
          currentPage: response.currentPage || 1,
          limit: queryParams.limit || 20,
          numberOfPages: response.totalPages || 1,
          totalResults: response.total || 0,
        },
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to fetch activity statistics
export const fetchActivityStats = createAsyncThunk<
  ActivityStats,
  string,
  { rejectValue: string }
>("activities/fetchActivityStats", async (timeframe, { rejectWithValue }) => {
  try {
    const response = await fetchActivityStatsAPI(timeframe);
    return response;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to fetch single activity
export const fetchSingleActivity = createAsyncThunk<
  Activity,
  string,
  { rejectValue: string }
>("activities/fetchSingleActivity", async (id, { rejectWithValue }) => {
  try {
    const response = await fetchSingleActivityAPI(id);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to cleanup old activities
export const cleanupOldActivities = createAsyncThunk<
  { message: string; deletedCount: number },
  number,
  { rejectValue: string }
>("activities/cleanupOldActivities", async (days, { rejectWithValue }) => {
  try {
    const response = await cleanupOldActivitiesAPI(days);
    return response;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Slice with reducers and state management
const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardError: (state) => {
      state.dashboardError = null;
    },
    clearStatsError: (state) => {
      state.statsError = null;
    },
    clearSingleActivityError: (state) => {
      state.singleActivityError = null;
    },
    clearCleanupError: (state) => {
      state.cleanupError = null;
    },

    // Query parameters management
    setQueryParams: (state, action: PayloadAction<ActivitiesQueryParams>) => {
      state.currentQueryParams = action.payload;
    },
    resetQueryParams: (state) => {
      state.currentQueryParams = {};
    },

    // Socket connection management
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    // Real-time activity management
    addRealtimeActivity: (state, action: PayloadAction<Activity>) => {
      // Add new activity to the top of realtime activities
      state.realtimeActivities = [action.payload, ...state.realtimeActivities];

      // Also add to dashboard activities if they exist
      if (state.dashboardActivities.length > 0) {
        state.dashboardActivities = [
          action.payload,
          ...state.dashboardActivities.slice(0, 49),
        ]; // Keep max 50
      }

      // Keep max 100 realtime activities in memory
      if (state.realtimeActivities.length > 100) {
        state.realtimeActivities = state.realtimeActivities.slice(0, 100);
      }
    },

    clearRealtimeActivities: (state) => {
      state.realtimeActivities = [];
    },

    // Load initial activities from socket
    setInitialActivities: (state, action: PayloadAction<Activity[]>) => {
      state.realtimeActivities = action.payload;
    },

    // Update activity stats in real-time
    updateActivityStats: (
      state,
      action: PayloadAction<Partial<ActivityStats>>
    ) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch activities
      .addCase(fetchActivities.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentQueryParams = action.meta.arg;
      })
      .addCase(
        fetchActivities.fulfilled,
        (
          state,
          action: PayloadAction<{
            activities: Activity[];
            pagination: PaginationMeta;
          }>
        ) => {
          state.loading = false;
          state.activities = action.payload.activities;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "An error occurred";
      })

      // Fetch dashboard activities
      .addCase(fetchDashboardActivities.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDashboardActivities.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardActivities = action.payload;
      })
      .addCase(fetchDashboardActivities.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError =
          action.payload || "Failed to fetch dashboard activities";
      })

      // Fetch activities by type
      .addCase(fetchActivitiesByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivitiesByType.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchActivitiesByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch activities by type";
      })

      // Fetch user activities
      .addCase(fetchUserActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user activities";
      })

      // Fetch activity stats
      .addCase(fetchActivityStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchActivityStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload || "Failed to fetch activity stats";
      })

      // Fetch single activity
      .addCase(fetchSingleActivity.pending, (state) => {
        state.singleActivityLoading = true;
        state.singleActivityError = null;
      })
      .addCase(fetchSingleActivity.fulfilled, (state, action) => {
        state.singleActivityLoading = false;
        state.singleActivity = action.payload;
      })
      .addCase(fetchSingleActivity.rejected, (state, action) => {
        state.singleActivityLoading = false;
        state.singleActivityError =
          action.payload || "Failed to fetch activity";
      })

      // Cleanup old activities
      .addCase(cleanupOldActivities.pending, (state) => {
        state.isCleaningUp = true;
        state.cleanupError = null;
      })
      .addCase(cleanupOldActivities.fulfilled, (state) => {
        state.isCleaningUp = false;
      })
      .addCase(cleanupOldActivities.rejected, (state, action) => {
        state.isCleaningUp = false;
        state.cleanupError = action.payload || "Failed to cleanup activities";
      });
  },
});

export const {
  clearError,
  clearDashboardError,
  clearStatsError,
  clearSingleActivityError,
  clearCleanupError,
  setQueryParams,
  resetQueryParams,
  setConnectionStatus,
  addRealtimeActivity,
  clearRealtimeActivities,
  setInitialActivities,
  updateActivityStats,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
