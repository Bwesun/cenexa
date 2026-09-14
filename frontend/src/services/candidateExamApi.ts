import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class CandidateExamApi {

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

    // Initiate and Setup Exam environment
    async initiateExamSetup(examId: string) {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/candidate/initiate/${examId}`, {}, {
          headers: this.getAuthHeaders(),
        });
        return data;
      } catch (error: any) {
        if (error.response) {
          console.error("Backend error:", error.response.data || error.response.statusText);
          throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to initiate exam setup");
        } else {
          console.error("Unknown error:", error.message);
          throw new Error(error.message || "Network error");
        }
      }
    }

    // Get Candidate exam details and question array
    async getCandidateExamDetails (candidateExamId: string) {
        try {
      const { data } = await axios.get(`${API_BASE_URL}/candidate/candidate-exam/${candidateExamId}`, {
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

    // Get Exam Question by Id
    async getExamQuestion(questionId: string) {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/candidate/get-question/${questionId}`, {
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

    // Save Answer
    async saveAnswer(candidateExamId: string, questionId: string, selectedOptionIndex: number, selectedOptionText: string) {
      try {
        const { data } = await axios.patch(`${API_BASE_URL}/candidate/save/${candidateExamId}`, {
          questionId,
          selectedOptionIndex,
          selectedOptionText,
        }, {
          headers: this.getAuthHeaders(),
        });
        return data;
      } catch (error: any) {
        if (error.response) {
          console.error("Backend error:", error.response.data || error.response.statusText);
          throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to save answer");
        } else {
          console.error("Unknown error:", error.message);
          throw new Error(error.message || "Network error");
        }
      }
    }

    // Reset (delete) candidateExam for exam retake
    async resetCandidateExam(candidateExamId: string) {
      try{
        const { data } = await axios.delete(`${API_BASE_URL}/candidate/reset/${candidateExamId}`, {
          headers: this.getAuthHeaders(),
        });
        return data;
      } catch (error: any) {
        if (error.response) {
          console.error("Backend error:", error.response.data || error.response.statusText);
          throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to save answer");
        } else {
          console.error("Unknown error:", error.message);
          throw new Error(error.message || "Network error");
        }
      }
    }

    // Submit Exam
    async submitExam(candidateExamId: string) {
      try {
        const { data } = await axios.patch(`${API_BASE_URL}/candidate/submit/${candidateExamId}`, {}, {
          headers: this.getAuthHeaders(),
        });
        return data;
      } catch (error: any) {
        if (error.response) {
          console.error("Backend error:", error.response.data || error.response.statusText);
          throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to submit exam");
        } else {
          console.error("Unknown error:", error.message);
          throw new Error(error.message || "Network error");
        }
      }
    }

}

export const candidateExamApi = new CandidateExamApi();
