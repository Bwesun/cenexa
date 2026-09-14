import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {

  //Auth Headers
  private getAuthHeaders(): AxiosRequestConfig["headers"] {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // handle generic response
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }
    return response.json();
  }

  // Authentication
  async login(ranNo: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      ranNo,
      password,
    });
    return response.data;
  }

  async register(userData: {
    name: string;
    email: string;
    ranNo?: string;
    password: string;
    role?: string;
    phone?: string;
    address?: string;
  }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, 
        {headers: this.getAuthHeaders()}
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Registration failed");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Get Current user
  async getCurrentUser() {
  const { data } = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: this.getAuthHeaders(),
  });

  if (!data.user) {
    throw new Error("Invalid response: missing user field");
  }

  return data; // { success, user }
}


  async updateProfile(userData: {
    name?: string;
    phone?: string;
    address?: string;
    avatar?: string;
    userId?: string;
  }) {
    const { data } = await axios.put(`${API_BASE_URL}/auth/profile`, userData, {
      headers: this.getAuthHeaders(),
    });
    return data;
  }

  // Admin
  async getAdminDashboardStats() {
    const { data } = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });
    return data;
  }

  async getAnalyticsData(period: string = "7d") {
    const { data } = await axios.get(`${API_BASE_URL}/admin/analytics`, {
      headers: this.getAuthHeaders(),
      params: { period },
    });
    return data;
  }

  async getUsers(params?: {
    role?: string;
    search?: string;
    isActive?: boolean;
  }) {
    const { data } = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return data;
  }

  async updateUser(userId: string, userData: any) {
    const { data } = await axios.put(
      `${API_BASE_URL}/admin/users/${userId}`,
      userData,
      { headers: this.getAuthHeaders() }
    );
    return data;
  }

  async deleteUser(userId: string) {
    const { data } = await axios.delete(
      `${API_BASE_URL}/admin/users/${userId}`,
      { headers: this.getAuthHeaders() }
    );
    return data;
  }
}

export const apiService = new ApiService();
