import axios, { AxiosRequestConfig } from "axios";
import { apiService } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class QuestionApi {

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

//   Get All Questions - Admin Only
async getAllQuestions(examId: string, 
    params: {
        search?: string;
        page?: number;
        limit?: number;
  }) {
    try{
      const { data } = await axios.get(`${API_BASE_URL}/question/admin-questions/${examId}`, {
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

//   Get Questions for Examiner only
async getExaminerQuestions(examId: string, params: {
    search?: string;
    page?: number;
    limit?: number;
    status?: boolean;
  }) {
    try{
      const { data } = await axios.get(`${API_BASE_URL}/question/examiner-questions/${examId}`, {
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

//   Get Question by ID
async getQuestion(questionId: string) {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/question/${questionId}`, {
      headers: this.getAuthHeaders(),
    });
    return data;
    } catch (error: any) {
      if (error.response) {
        console.error("Backend error:", error.response.data || error.response.statusText);
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to get question");
      } else {
        console.error("Unknown error:", error.message);
        throw new Error(error.message || "Network error");
      }
    }
  }

  // Add Question
  async addQuestion(examData: {
    text: string;
    options?: {
        text: string;
        isCorrect: boolean;
    }[];
    exam: string;
    // mark: number;
  }) {
    try {
      // Backend expects these fields: text, options
      const payload = {
        text: examData.text,
        options: examData.options || [],
        // mark: examData.mark,
      };
      
    //   console.log("To be sent: ", payload)
      const { data } = await axios.post(`${API_BASE_URL}/question/add-question/${examData.exam}`, payload, {
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
  async updateQuestion(questionId: string, examData: {
    text: string;
    options?: {
        text: string;
        isCorrect: boolean;
    }[];
    exam: string;
  }) {
    try {
      const payload = {
        text: examData.text,
        options: examData.options || [],
      };
      
      const { data } = await axios.put(`${API_BASE_URL}/question/${questionId}`, payload, {
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

  // Delete Question
  async deleteQuestion(questionId: string) {
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/question/${questionId}`, {
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

  // Bulk upload questions
  async uploadBulkQuestions(examId: string, formData: FormData) {
    try{
        const headers: Record<string, string> = { ...this.getAuthHeaders() as Record<string, string> };
        delete headers["Content-Type"];
        const { data } = await axios.post(`${API_BASE_URL}/question/upload/${examId}`, formData, {
        headers,
        });
        return data;
    }catch(error: any){
        if (error.response) {
            console.error("Backend error:", error.response.data || error.response.statusText);
            throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to upload questions");
        } else {
            console.error("Unknown error:", error.message);
            throw new Error(error.message || "Network error");
        }
    }
  }

  // Download bulk upload template
  async downloadTemplate() {
    try {
        const response = await axios.get(`${API_BASE_URL}/question/download-template`, {
            headers: this.getAuthHeaders(),
            responseType: "blob", // Important for file download
        });

        // Create blob and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `question_template_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error: any) {
        if (error.response) {
            console.error("Backend error:", error.response.data || error.response.statusText);
            throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to download template");
        } else {
            console.error("Unknown error:", error.message);
            throw new Error(error.message || "Network error");
        }
    }
  }
}


export const questionApi = new QuestionApi();
