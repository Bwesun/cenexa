import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class AdminApi {

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

  // GENERAL APIs
  // Get Dashboard Stats
  async getAdminDashboardStats() {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/admin/dashboard-stats`, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get dashboard stats");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Get System Health
  async getSystemHealth() {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/admin/system/health`, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get system health");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }
}

export const adminApi = new AdminApi();
