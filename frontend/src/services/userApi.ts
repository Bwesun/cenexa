import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class UserApi {

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

  // Get All Users - Super Admin
  async getAllUsers(params: {
    search?: string;
    page?: number;
    limit?: number;
    role?: string;
  }) {
    try{
      const { data } = await axios.get(`${API_BASE_URL}/user/super`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return data;
    }catch(error: any){
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get users");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

//   Admin get users - Get Users - Admin to get users in the organization
  async getAdminOrgUsers(params: {
    search?: string;
    page?: number;
    limit?: number;
    role?: string;
  }) {
    try{
      const { data } = await axios.get(`${API_BASE_URL}/user/admin`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return data;
    }catch(error: any){
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get users");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

//   Get User by ID - SuperAdmin and Admin
async getUserById(userId: string) {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/user/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend error:", error.response.data || error.response.statusText);
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get user");
    } else {
      console.error("Unknown error:", error.message);
      throw new Error(error.message || "Network error");
    }
  }
}

// Super Admin Create Admin
async createSuperUser(userData: any) {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/user/super/create-admin`, userData, {
      headers: this.getAuthHeaders(),
    });
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend error:", error.response.data || error.response.statusText);
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to create user");
    } else {
      console.error("Unknown error:", error.message);
      throw new Error(error.message || "Network error");
    }
  }
}

// Admin create users - Admin can create examiner and candidates
async createAdminUsers(userData: any) {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/user/admin/create-user`, userData, {
      headers: this.getAuthHeaders(),
    });
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend error:", error.response.data || error.response.statusText);
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to create user");
    } else {
      console.error("Unknown error:", error.message);
      throw new Error(error.message || "Network error");
    }
  }
}

// Super Admin update user
async updateSuperUserById(userId: string, userData: any) {
  try {
    const { data } = await axios.put(`${API_BASE_URL}/user/super/${userId}`, userData, {
      headers: this.getAuthHeaders(),
    });
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend error:", error.response.data || error.response.statusText);
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to update user");
    } else {
      console.error("Unknown error:", error.message);
      throw new Error(error.message || "Network error");
    }
  }
}

// Admin update user
async updateAdminUserById(userId: string, userData: any) {
  try {
    const { data } = await axios.put(`${API_BASE_URL}/user/admin/update-user/${userId}`, userData, {
      headers: this.getAuthHeaders(),
    });
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend error:", error.response.data || error.response.statusText);
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to update user");
    } else {
      console.error("Unknown error:", error.message);
      throw new Error(error.message || "Network error");
    }
  }
}

// Super Admin delete user
async deleteSuperUserById(userId: string) {
  try {
    const { data } = await axios.delete(`${API_BASE_URL}/user/super/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend error:", error.response.data || error.response.statusText);
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to delete user");
    } else {
      console.error("Unknown error:", error.message);
      throw new Error(error.message || "Network error");
    }
  }
}

// Admin delete user
async deleteAdminUserById(userId: string) {
  try {
    const { data } = await axios.delete(`${API_BASE_URL}/user/admin/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return data;
  } catch (error: any) {
    if (error.response) {
      console.error("Backend error:", error.response.data || error.response.statusText);
      throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to delete user");
    } else {
      console.error("Unknown error:", error.message);
      throw new Error(error.message || "Network error");
    }
  }
}

}

export const userApi = new UserApi();
