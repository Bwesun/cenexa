import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ExamApi {

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
  // Get Exams
  async getAllExams(params: {
    search?: string;
    page?: number;
    limit?: number;
    active?: boolean;
    status?: boolean;
  }) {
    try{
      const { data } = await axios.get(`${API_BASE_URL}/exam`, {
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
  async getExamById(examId: string) {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/exam/${examId}`, {
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

  // ==================== ADMIN EXAM APIS ====================
  // Create Exam
  async createExam(examData: {
    title: string;
    description?: string;
    duration: number;
    numberOfQuestions: number;
    totalMark: number;
    passingMark: number;
    instructions: string;
    scheduleStart: string;
    scheduleEnd: string;
  }) {
    try {
      // Backend expects these fields: title, description, duration, totalMark, passingMark, instructions, scheduleStart, scheduleEnd
      const payload = {
        title: examData.title,
        description: examData.description || '',
        duration: examData.duration,
        totalMark: examData.totalMark,
        passingMark: examData.passingMark,
        instructions: examData.instructions,
        scheduleStart: examData.scheduleStart,
        scheduleEnd: examData.scheduleEnd,
        numberOfQuestions: examData.numberOfQuestions, // Include for future use
      };
      
      const { data } = await axios.post(`${API_BASE_URL}/exam/create`, payload, {
        headers: this.getAuthHeaders(),
      });
      return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to create exam");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Edit Exam by ID
  async updateExam(examId: string, examData: {
    title: string;
    description?: string;
    duration: number;
    numberOfQuestions: number;
    totalMark: number;
    passingMark: number;
    instructions: string;
    scheduleStart: string;
    scheduleEnd: string;
  }) {
    try {
      const payload = {
        title: examData.title,
        description: examData.description || '',
        duration: examData.duration,
        totalMark: examData.totalMark,
        passingMark: examData.passingMark,
        instructions: examData.instructions,
        scheduleStart: examData.scheduleStart,
        scheduleEnd: examData.scheduleEnd,
        numberOfQuestions: examData.numberOfQuestions,
      };
      
      const { data } = await axios.put(`${API_BASE_URL}/exam/${examId}`, payload, {
        headers: this.getAuthHeaders(),
      });
      return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to update exam");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Delete Exam
  async deleteExam(examId: string) {
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/exam/${examId}`, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to delete exam");
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

export const examApi = new ExamApi();
