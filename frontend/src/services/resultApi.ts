import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ResultApi {

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

  // CANDIDATE APIs
  // Get Candidate's Exam Results
  async getCandidateExamResults(params: {
    search?: string;
  }) {
    try{
      const { data } = await axios.get(`${API_BASE_URL}/result/candidate/my-results`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return data;
    }catch(error: any){
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get exams");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Get Exam by ID
  async getResultById(resultId: string) {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/result/${resultId}`, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get exam");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // ==================== ADMIN RESULT APIS ====================

  // Get Exam Result Stats - Admin, Examiner
  async getExamResultStats(examId: string) {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/result/exam/${examId}/stats`, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get exam results stats");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Get Exam Results - Admin and Examiner
  async getExamResults(examId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/result/exam/${examId}/all`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get exam results stats");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Generate Broadsheet - Admin
  async generateBroadsheet(examId: string) {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/result/exam/broadsheet/${examId}`, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to generate broadsheet");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }


  // Bulk Upload Questions
  async bulkUploadQuestions(examId: string, questions: any[]) {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/exam/${examId}/questions/bulk-upload`, questions, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to upload questions");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Get Exam Questions
  async getExamQuestions(examId: string) {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/question/exam/${examId}`, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get exam questions");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }
}

export const resultApi = new ResultApi();
