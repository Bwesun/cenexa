import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiService } from "../services/api";
import { useLocation } from "react-router-dom";

interface UserResponse {
  user: User;
}


interface AuthResponse {
  token: string;
  user: User;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  ranNo?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  association?: string;
  conference?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (ranNo: string, password: string) => Promise<any>;
  register: (userData: {
    name: string;
    email: string;
    ranNo?: string;
    password: string;
    role?: string;
    phone?: string;
    association?: string;
    conference?: string;
    address?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuth();
  }, []);

 const checkAuth = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Ensure token is sent in request
    const response = await apiService.getCurrentUser() as UserResponse;

      setUser(response.user);

      // Send any stored device token to backend after auth check
      // await resendStoredDeviceToken();
  } catch (error) {
    console.error("Auth check failed:", error);
    localStorage.removeItem("token");
  } finally {
    setIsLoading(false);
  }
};



  const login = async (ranNo: string, password: string) => {
    try {
      const response = await apiService.login(ranNo, password) as AuthResponse;
      localStorage.setItem("token", response.token);
      setUser(response.user);

      // Send any stored device token to backend after login
      // await resendStoredDeviceToken();

      return response.user
    } catch (error) {
      console.log("Error:", error)
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    ranNo?: string;
    password: string;
    role?: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      const response = await apiService.register(userData) as AuthResponse;
      localStorage.setItem("token", response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async() => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(userData) as AuthResponse;
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
