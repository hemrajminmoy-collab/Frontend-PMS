import React from "react";
import { FaShoppingCart, FaChevronDown, FaSignOutAlt } from "react-icons/fa";

export default function PurchaseTopNav({ onLogout }) {
  return (
    <nav className="purchase-topnav w-full px-4 py-4 sm:px-8 sm:py-5 lg:px-10 flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <FaShoppingCart className="text-red-600 text-4xl sm:text-5xl shrink-0" />
        <h1
          className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide text-gray-900 leading-tight break-words"
          style={{ fontFamily: "'Agu Display', sans-serif" }}
        >
          PURCHASE MANAGEMENT SYSTEM
        </h1>
      </div>

      <div className="flex items-center gap-3 self-end lg:self-auto">
        <button
          onClick={onLogout}
          className="md:hidden px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
        >
          Logout
        </button>

        <div className="relative group hidden md:block">
          <div className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-500 opacity-80 blur-[1px]"></div>
              <div className="relative w-10 h-10 rounded-full bg-red-600 flex items-center justify-center ring-2 ring-red-300 shadow-md">
                <span className="text-white font-extrabold text-lg uppercase">
                  {localStorage.getItem("username")?.charAt(0)}
                </span>
              </div>
            </div>

            <span className="font-medium text-gray-800 whitespace-nowrap">
              {localStorage.getItem("username")}
              {localStorage.getItem("role") && (
                <span className="text-sm text-gray-500 ml-1">
                  ({localStorage.getItem("role")})
                </span>
              )}
            </span>

            <FaChevronDown className="text-gray-600 transition-transform group-hover:rotate-180" />
          </div>

          <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t"></div>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700
                        border border-transparent rounded-xl
                        hover:border-red-600 hover:bg-red-50 hover:text-red-600
                        transition"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
