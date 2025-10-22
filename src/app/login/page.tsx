"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    message: string;
    user: {
      id: number;
      email: string;
      username: string;
      role: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };
    accessToken: string;
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      // axiosInstance trả về axios response object (không unwrap)
      // response.data = { statusCode, message, data: { accessToken, user, ... } }
      const accessToken = response.data?.data?.accessToken;

      // Save token to localStorage
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        toast.success("Đăng nhập thành công!");
        console.log("✅ Token saved successfully");
        // Redirect to home page
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        console.error("❌ No accessToken in response:", response.data);
        toast.error("Không nhận được access token từ server");
      }
    } catch (err) {
      const error = err as unknown;
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        errorResponse?.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
      console.error("❌ Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0B0E11] min-h-screen flex flex-col justify-center items-center">
      <div className="rounded-2xl border-[0.5px] border-gray-500 min-w-[425px] bg-[#181A20]">
        <div className="p-10">
          <svg
            height="24"
            width="120"
            className="bn-svg default-icon block"
            viewBox="0 0 120 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#F0B90B"
              d="M5.41406 12L2.71875 14.6953L0 12L2.71875 9.28125L5.41406 12ZM12 5.41406L16.6406 10.0547L19.3594 7.33594L12 0L4.64062 7.35938L7.35938 10.0781L12 5.41406ZM21.2812 9.28125L18.5859 12L21.3047 14.7188L24.0234 12L21.2812 9.28125ZM12 18.5859L7.35938 13.9219L4.64062 16.6406L12 24L19.3594 16.6406L16.6406 13.9219L12 18.5859ZM12 14.6953L14.7188 11.9766L12 9.28125L9.28125 12L12 14.6953ZM40.5938 14.9766V14.9297C40.5938 13.1719 39.6562 12.2812 38.1328 11.6953C39.0703 11.1797 39.8672 10.3359 39.8672 8.85938V8.8125C39.8672 6.75 38.2031 5.41406 35.5312 5.41406H29.4141V18.5625H35.6719C38.6484 18.5859 40.5938 17.3672 40.5938 14.9766ZM36.9844 9.35156C36.9844 10.3359 36.1875 10.7344 34.8984 10.7344H32.2266V7.94531H35.0859C36.3047 7.94531 36.9844 8.4375 36.9844 9.30469V9.35156ZM37.7109 14.6016C37.7109 15.5859 36.9375 16.0312 35.6719 16.0312H32.2266V13.1484H35.5781C37.0547 13.1484 37.7109 13.6875 37.7109 14.5781V14.6016ZM46.6641 18.5625V5.41406H43.7578V18.5625H46.6641ZM62.2266 18.5859V5.41406H59.3672V13.5234L53.2031 5.41406H50.5312V18.5625H53.3906V10.2188L59.7656 18.5859H62.2266ZM78.2578 18.5859L72.6094 5.34375H69.9375L64.2891 18.5859H67.2656L68.4609 15.6328H74.0156L75.2109 18.5859H78.2578ZM72.9844 13.0781H69.4922L71.25 8.8125L72.9844 13.0781ZM92.0625 18.5859V5.41406H89.2031V13.5234L83.0391 5.41406H80.3672V18.5625H83.2266V10.2188L89.6016 18.5859H92.0625ZM106.992 16.4531L105.141 14.6016C104.109 15.5391 103.195 16.1484 101.672 16.1484C99.4219 16.1484 97.8516 14.2734 97.8516 12.0234V11.9531C97.8516 9.70312 99.4453 7.85156 101.672 7.85156C102.984 7.85156 104.016 8.41406 105.047 9.32812L106.898 7.19531C105.68 6 104.203 5.15625 101.719 5.15625C97.6875 5.15625 94.8516 8.22656 94.8516 11.9531V12C94.8516 15.7734 97.7344 18.7734 101.602 18.7734C104.133 18.7969 105.633 17.9062 106.992 16.4531ZM119.344 18.5625V16.0078H112.195V13.2422H118.406V10.6641H112.195V7.99219H119.25V5.41406H109.336V18.5625H119.344Z"
            ></path>
          </svg>
          <h1 className="text-white font-semibold text-3xl py-5">Đăng nhập</h1>

          <Toaster />

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="text-white text-[15px] py-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-500 rounded-xl p-3 text-white text-[15px] bg-[#0B0E11] focus:outline-none focus:border-yellow-500 transition"
                placeholder="Nhập email của bạn"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-white text-[15px] py-2 block">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-500 rounded-xl p-3 text-white text-[15px] bg-[#0B0E11] focus:outline-none focus:border-yellow-500 transition pr-10"
                  placeholder="Nhập mật khẩu của bạn"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 transition"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#FCD535] hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-3 text-black font-semibold transition"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
