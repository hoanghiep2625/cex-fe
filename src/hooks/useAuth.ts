import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance";

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook để kiểm tra trạng thái đăng nhập
 * Call API POST /me để verify token và lấy user info
 *
 * @returns {Object} { user, loading, isAuthenticated, logout }
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Chỉ check một lần khi component mount
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // Nếu không có token thì chắc chắn không auth
        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Có token → call API POST /me để verify token + lấy user info
        try {
          const response = await axiosInstance.get("/users/me");
          const userData = response.data?.data || response.data;

          // Token hợp lệ, lưu user info
          setUser(userData);
          setIsAuthenticated(true);
        } catch (verifyError) {
          // Token không hợp lệ (expired, invalid, etc.)
          console.error("Token verification failed:", verifyError);
          localStorage.removeItem("accessToken");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      // Call API logout
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue logout locally even if API fails
    } finally {
      // Clear localStorage
      localStorage.removeItem("accessToken");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    logout,
  };
};
