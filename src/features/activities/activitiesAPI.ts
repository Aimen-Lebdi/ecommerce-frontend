/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../../utils/axiosInstance";

// Interface for API query parameters
export interface ActivitiesQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  type?: string;
  timeframe?: string;
  fields?: string;
  [key: string]: any;
}

// Interface for API response structure
export interface ActivitiesResponse {
  result: number;
  pagination?: {
    currentPage: number;
    limit: number;
    numberOfPages: number;
    nextPage?: number;
    previousPage?: number;
  };
  activities: any[];
  total?: number;
  currentPage?: number;
  totalPages?: number;
}

// Interface for activity stats response
export interface ActivityStatsResponse {
  timeframe: string;
  totalActivities: number;
  typeStats: Array<{ _id: string; count: number }>;
  dailyStats: Array<{ _id: string; count: number }>;
}

// Fetch all activities with query parameters support
export const fetchActivitiesAPI = async (
  queryParams: ActivitiesQueryParams = {}
): Promise<ActivitiesResponse> => {
  // Build query string from parameters
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = queryString
    ? `/api/activities?${queryString}`
    : "/api/activities";

  const response = await axiosInstance.get(url);
  return response.data;
};

// Fetch dashboard activities (last 50)
export const fetchDashboardActivitiesAPI =
  async (): Promise<ActivitiesResponse> => {
    const response = await axiosInstance.get("/api/activities/dashboard");
    return response.data;
  };

// Fetch activities by type
export const fetchActivitiesByTypeAPI = async (
  type: string,
  queryParams: ActivitiesQueryParams = {}
): Promise<ActivitiesResponse> => {
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = queryString
    ? `/api/activities/type/${type}?${queryString}`
    : `/api/activities/type/${type}`;

  const response = await axiosInstance.get(url);
  return response.data;
};

// Fetch user activities
export const fetchUserActivitiesAPI = async (
  userId: string,
  queryParams: ActivitiesQueryParams = {}
): Promise<ActivitiesResponse> => {
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = queryString
    ? `/api/activities/user/${userId}?${queryString}`
    : `/api/activities/user/${userId}`;

  const response = await axiosInstance.get(url);
  return response.data;
};

// Fetch activity statistics
export const fetchActivityStatsAPI = async (
  timeframe: string = "7d"
): Promise<ActivityStatsResponse> => {
  const response = await axiosInstance.get(
    `/api/activities/stats?timeframe=${timeframe}`
  );
  return response.data;
};

// Fetch single activity
export const fetchSingleActivityAPI = async (id: string) => {
  const response = await axiosInstance.get(`/api/activities/${id}`);
  return response.data;
};

// Cleanup old activities
export const cleanupOldActivitiesAPI = async (days: number = 90) => {
  const response = await axiosInstance.delete("/api/activities/cleanup", {
    data: { days },
  });
  return response.data;
};
