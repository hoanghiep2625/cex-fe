"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function MenuBar({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="bg-[#181A20] flex justify-between p-4 h-[62px]">
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
        <ul className="text-white flex gap-8 text-[14px]">
          <li>Mua crypto</li>
          <li>Thị trường</li>
          <li>Giao dịch</li>
          <li>Futures</li>
          <li>Earn</li>
          <li>Square</li>
          <li>Nhiều hơn</li>
        </ul>
      </div>
      <div className="flex gap-4 justify-center items-center">
        <Image src="/search-outline.svg" alt="Search" width={25} height={25} />

        {loading ? (
          // Đang check auth
          <div className="text-gray-400 text-sm">Đang kiểm tra...</div>
        ) : isAuthenticated ? (
          // Đã đăng nhập
          <>
            <div className="flex items-center gap-3 px-4 py-1 border border-gray-500 bg-[#181A20] rounded-md">
              <span className="text-white text-sm">
                {user?.email || user?.username}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-white bg-[#E63946] hover:bg-[#d62828] px-3 py-[5px] rounded-md text-sm transition"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          // Chưa đăng nhập
          <>
            <Link
              href="/login"
              className="text-white bg-[#333B47] px-2 py-[5px] rounded-md text-sm hover:bg-[#444C57] transition"
            >
              Đăng nhập
            </Link>
            <button className="text-black bg-[#FCD535] hover:bg-yellow-400 px-2 py-[5px] rounded-md text-sm transition">
              Đăng ký
            </button>
          </>
        )}

        <div className="flex gap-4 justify-center items-center">
          <svg
            className="bn-svg w-6 h-6 text-white text-PrimaryText hover:text-PrimaryYellow"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.5 1.8c.828 0 1.5.616 1.5 1.374v17.652c0 .758-.672 1.374-1.5 1.374H7.179C4.87 22.2 3 20.487 3 18.375V5.625C3 3.513 4.871 1.8 7.179 1.8H19.5zM7.4 18.5a2.1 2.1 0 00-1.91 1.23c.411.43 1.014.704 1.689.704H19.07V18.5H7.4zM7.18 3.566c-1.243 0-2.25.922-2.25 2.059v11.96a3.883 3.883 0 012.471-.886h11.67V3.566H7.18zm4.716 9.574a1 1 0 01.996 1.005 1 1 0 01-.995 1.005 1 1 0 01-.996-1.005 1 1 0 01.995-1.005zM11.9 5.4c1.622 0 2.9 1.388 2.9 2.9 0 1.266-.935 2.348-2 2.736v.765a.901.901 0 01-1.8 0v-.917c0-.856.677-1.359 1.173-1.533.477-.168.827-.657.827-1.05 0-.559-.512-1.1-1.1-1.1-.207 0-.49.113-.738.362-.248.248-.361.53-.361.738A.901.901 0 019 8.3c0-.793.388-1.51.889-2.012.5-.501 1.219-.889 2.011-.889z"
              fill="currentColor"
            ></path>
          </svg>
          <svg
            className="bn-svg w-6 h-6 text-white text-PrimaryText cursor-pointer mx-[5px] hover:text-PrimaryYellow"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.14 8.04v7.92L12 19.92l6.86-3.96V8.04L12 4.077 5.14 8.04zm15.52 8.094l-.012.199a1.5 1.5 0 01-.738 1.1l-7.16 4.134-.179.088c-.365.15-.777.15-1.142 0l-.179-.088-7.16-4.134a1.5 1.5 0 01-.737-1.1l-.013-.2V7.867a1.5 1.5 0 01.75-1.299l7.16-4.134a1.5 1.5 0 011.5 0l7.16 4.134a1.5 1.5 0 01.75 1.3v8.267z"
              fill="currentColor"
            ></path>
            <path
              d="M12 8.82l3.182 3.182L12 15.184l-3.182-3.182L12 8.82z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
