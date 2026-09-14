import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class OrgApi {

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

  // Get Organizations
  async getAllOrg(params: {
    search?: string;
    page?: number;
    limit?: number;
    active?: boolean;
    status?: boolean;
  }) {
    try{
      const { data } = await axios.get(`${API_BASE_URL}/organization/all`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return data;
    }catch(error: any){
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get organizations");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Create Organization
  async createOrganization(organizationData: {
    name: string;
    description?: string;
  }) {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/organization/create`, organizationData, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to create organization");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Get Organization by ID
  async getOrgById(organizationId: string){
    try{
      const { data } = await axios.get(`${API_BASE_URL}/organization/${organizationId}`, {
      headers: this.getAuthHeaders(),
    });
    return data;
    }catch(error: any){
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get organization");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Update Organization
  async updateOrganization(organizationId: string, organizationData: {
    name: string;
    description?: string;
    active?: boolean;
  }) {
    try {
      const { data } = await axios.put(`${API_BASE_URL}/organization/${organizationId}`, organizationData, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to update organization");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Delete Organization
  async deleteOrganization(organizationId: string) {
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/organization/${organizationId}`, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to delete organization");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }
}

export const orgApi = new OrgApi();
