"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { LuBolt, LuBookType, LuLogOut, LuSearch } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";

export default function MenuBar() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="dark:bg-[#181A20] bg-white flex justify-between p-4 h-[62px]">
      <div className="flex gap-8 justify-center items-center">
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
        <ul className="flex text-[13px] font-semibold text-black dark:text-white">
          <li className="flex justify-center items-center px-3 h-16 hover:text-[#F0B90B] hover:cursor-pointer">
            Mua Crypto
          </li>
          <li className="flex justify-center items-center px-3 h-16 hover:text-[#F0B90B] hover:cursor-pointer">
            Thị trường
          </li>
          {/* thị trường */}
          <li className="group flex justify-center items-center px-3 h-16 hover:text-[#F0B90B] hover:cursor-pointer relative">
            Giao dịch
            <span className="w-1.5 h-1.5 bg-[#FCD535] rounded-full absolute right-[22%] top-[30%]"></span>
            <span className="ml-0.5 transition-transform duration-200 group-hover:rotate-180">
              <IoIosArrowDown />
            </span>
            <div className="absolute top-full left-[-50%] hidden group-hover:block bg-white dark:bg-[#202630] shadow-lg rounded-lg w-96 z-20 text-[13px]">
              <Link
                href="/spot/BTC_USDT"
                className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B3139]"
              >
                <p className="text-gray-900 dark:text-white">Giao dịch Spot</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  Mua và bán trên thị trường giao ngay với các công cụ tiên
                  tiến.
                </p>
              </Link>
              <Link
                href="#"
                className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B3139]"
              >
                <p className="text-gray-900 dark:text-white">
                  Giao dịch Futures
                </p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  Giao dịch hợp đồng tương lai với đòn bẩy cao và phí thấp.
                </p>
              </Link>
              <Link
                href="#"
                className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B3139]"
              >
                <p className="text-gray-900 dark:text-white">Giao dịch P2P</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  Mua và bán tiền điện tử trực tiếp với người dùng khác.
                </p>
              </Link>
              <Link
                href="#"
                className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B3139]"
              >
                <p className="text-gray-900 dark:text-white">Bot Giao Dịch</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  Tự động hóa chiến lược giao dịch của bạn 24/7.
                </p>
              </Link>
            </div>
          </li>
          {/* futures */}
          <li className="flex justify-center items-center px-3 h-16 hover:text-[#F0B90B] hover:cursor-pointer group">
            Futures
            <span className="ml-0.5 transition-transform duration-200 group-hover:rotate-180">
              <IoIosArrowDown />
            </span>
          </li>
          {/* earn */}
          <li className="flex justify-center items-center px-3 h-16 hover:text-[#F0B90B] hover:cursor-pointer group">
            Earn
            <span className="ml-0.5 transition-transform duration-200 group-hover:rotate-180">
              <IoIosArrowDown />
            </span>
          </li>
          {/* square */}
          <li className="flex justify-center items-center px-3 h-16 hover:text-[#F0B90B] hover:cursor-pointer group">
            Square
            <span className="ml-0.5 transition-transform duration-200 group-hover:rotate-180">
              <IoIosArrowDown />
            </span>
          </li>
          {/* more */}
          <li className="group flex justify-center items-center h-16 hover:text-[#F0B90B] relative hover:cursor-pointer group">
            Nhiều hơn
            <span className="ml-0.5 transition-transform duration-200 group-hover:rotate-180">
              <IoIosArrowDown />
            </span>
            <div className="absolute top-full left-[-50%] hidden group-hover:block bg-white dark:bg-[#202630] shadow-md rounded-md  w-96 z-999 text-[13px]">
              <Link
                href="/terms"
                className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B3139]"
              >
                <p className="text-gray-900 dark:text-white">Terms</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  Xem các điều khoản và điều kiện sử dụng dịch vụ của chúng tôi.
                </p>
              </Link>
              <Link
                href="/privacy"
                className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2B3139]"
              >
                <p className="text-gray-900 dark:text-white">Privacy</p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  Tìm hiểu cách chúng tôi thu thập và bảo vệ dữ liệu cá nhân của
                  bạn.
                </p>
              </Link>
            </div>
          </li>
        </ul>
      </div>
      <div className="flex gap-4 justify-center items-center">
        <LuSearch
          className="dark:text-white text-black w-6 h-6"
          strokeWidth={1.7}
        />
        {loading ? (
          <div></div>
        ) : isAuthenticated ? (
          // Đã đăng nhập
          <>
            <div className="flex items-center gap-3 px-4 py-1 border border-black dark:border-white dark:bg-[#181A20] bg-white rounded-md">
              <span className="dark:text-white text-black text-sm">
                {user?.email || user?.username}
              </span>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="text-white cursor-pointer"
            >
              <LuLogOut className="dark:text-white text-black w-6 h-6" />
            </button>
          </>
        ) : (
          // Chưa đăng nhập
          <>
            <Link
              href="/login"
              className="dark:text-white text-black text-xs dark:bg-[#333B47] bg-gray-200 px-2 py-[7px] rounded-md font-semibold dark:hover:bg-[#444C57] hover:bg-gray-300 transition"
            >
              Đăng nhập
            </Link>
            <button className="text-black bg-[#FCD535] hover:bg-[#E8A804] px-2 py-[7px] rounded-md text-xs font-semibold transition">
              Đăng ký
            </button>
          </>
        )}

        <div className="flex gap-4 justify-center items-center">
          <ThemeToggle className="w-6 h-6" />
          <LuBookType
            strokeWidth={1.7}
            className=" w-6 h-6 cursor-pointer dark:text-white text-black"
          />
          <LuBolt
            strokeWidth={1.7}
            className="dark:text-white text-black w-6 h-6 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
