"use client";

import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: HeaderProps) {
  const [showLanguage, setShowLanguage] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="bg-white border-b z-40 px-4 lg:px-6 xl:px-10 py-4 border-gray-100 flex items-center justify-between sticky top-0">
      <div className="flex items-center gap-4">
        <button
          className="xl:hidden p-2 text-light-primary-text hover:bg-gray-100 rounded-md"
          onClick={onToggleSidebar}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 32 32"
            className="size-5.5"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M26.667 16H13.333M26.667 6.667H5.333M26.667 25.333H5.333"
            ></path>
          </svg>
        </button>

      </div>
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="relative">
          <button
            className="inline-flex items-center gap-2 justify-center text-sm font-medium text-gray-700 focus:outline-none"
            onClick={() => setShowLanguage(!showLanguage)}
            type="button"
          >
            <span className="w-6 h-6 rounded-md overflow-hidden relative block">
              <img
                alt="English"
                className="object-cover"
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                }}
                src="/admin/images/flag/GB.svg"
              />
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              className="size-5 text-light-primary-text"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M14.47 6.97a.75.75 0 1 1 1.06 1.06l-4.293 4.293c-.151.152-.318.32-.476.44a1.3 1.3 0 0 1-.64.273l-.121.007a1.23 1.23 0 0 1-.76-.28c-.16-.12-.326-.288-.477-.44L4.47 8.03a.75.75 0 1 1 1.06-1.06l4.293 4.293.177.174.177-.174z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          {showLanguage && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-md shadow-lg py-1 z-50">
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                onClick={() => setShowLanguage(false)}
              >
                <span className="w-5 h-5 relative block">
                  <img src="/admin/images/flag/GB.svg" alt="English" className="object-cover w-full h-full" />
                </span>
                English
              </button>
            </div>
          )}
        </div>

        {/* Message / Inbox Icon */}
        <Link
          className="relative size-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors focus:outline-none"
          href="/admin/inbox"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
            className="w-5 h-5 text-light-primary-text"
          >
            <path
              fill="currentColor"
              d="M8.14 1.394a28 28 0 0 1 3.718 0c3.87.257 6.937 3.38 7.19 7.283.047.724.047 1.473 0 2.197-.252 3.903-3.32 7.026-7.19 7.283a28 28 0 0 1-3.717 0 4.8 4.8 0 0 1-1.474-.338c-.16-.066-.277-.112-.366-.146q-.087.06-.233.168c-.681.502-1.542.854-2.755.824-.234-.006-.506-.01-.728-.054-.258-.05-.594-.178-.804-.536-.23-.392-.134-.785-.052-1.014.081-.227.222-.491.357-.747.39-.737.466-1.29.284-1.63-.695-1.053-1.325-2.358-1.419-3.81a17 17 0 0 1 0-2.197c.253-3.903 3.32-7.026 7.19-7.283M11.76 2.89a27 27 0 0 0-3.519 0c-3.102.206-5.587 2.715-5.792 5.883-.042.659-.042 1.344 0 2.003.063.965.448 1.9.968 2.757l.23.362.033.053c.59 1.07.152 2.273-.266 3.066l-.078.15h.016c.86.021 1.398-.216 1.827-.532.149-.11.289-.213.405-.288.095-.061.289-.184.53-.214.251-.031.491.054.595.09.143.051.325.127.53.212.303.124.668.205 1.002.227 1.154.077 2.363.077 3.519 0 3.102-.206 5.587-2.715 5.792-5.883.042-.66.042-1.344 0-2.003-.205-3.168-2.69-5.677-5.792-5.883m1.157 8.442a.75.75 0 0 1 0 1.5H7.083a.75.75 0 0 1 0-1.5zM10 7.166a.75.75 0 0 1 0 1.5H7.083a.75.75 0 1 1 0-1.5z"
            ></path>
          </svg>
          <span className="absolute top-[2px] right-0 h-4.5 w-4.5 flex items-center justify-center rounded-full bg-warning text-xs font-bold text-light-primary-text">
            5
          </span>
        </Link>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            className="relative size-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors focus:outline-none"
            onClick={() => setShowNotifications(!showNotifications)}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              className="w-5 h-5 text-text-primary-text"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4.299 9.576c-.062 1.163.009 2.401-1.03 3.181a1.92 1.92 0 0 0-.769 1.537c0 .832.652 1.54 1.5 1.54h12c.849 0 1.5-.708 1.5-1.54 0-.605-.285-1.174-.768-1.537-1.04-.78-.97-2.018-1.03-3.181a5.71 5.71 0 0 0-11.403 0"
              ></path>
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                d="M8.75 2.604c0 .69.56 1.563 1.25 1.563s1.25-.872 1.25-1.563c0-.69-.56-.937-1.25-.937s-1.25.247-1.25.937Z"
              ></path>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12.5 15.833a2.5 2.5 0 0 1-5 0"
              ></path>
            </svg>
            <span className="absolute top-[2px] right-0 h-4.5 w-4.5 flex items-center justify-center rounded-full bg-error text-xs font-bold text-white">
              8
            </span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-md shadow-lg py-2 z-50">
              <div className="px-4 py-2 font-semibold text-sm border-b border-gray-50 text-gray-800">
                Notifications
              </div>
              <div className="px-4 py-3 text-xs text-gray-500 text-center">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="text-right relative">
          <button
            className="inline-flex items-center gap-2 w-full justify-center focus:outline-none text-sm"
            onClick={() => setShowProfile(!showProfile)}
            type="button"
          >
            <span className="h-8 w-8 relative rounded-full overflow-hidden block">
              <img
                alt="User"
                className="object-cover w-full h-full"
                src="/admin/images/user/manface.avif"
              />
            </span>
            <span className="hidden text-left md:block">
              <span className="text-sm font-semibold text-text-primary-text block">
                John Smith
              </span>
              <span className="text-xs text-text-secondary-text block capitalize">
                master
              </span>
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              className={`size-5 text-text-primary-text transition-transform duration-200 ${
                showProfile ? "rotate-180" : ""
              }`}
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M14.47 6.97a.75.75 0 1 1 1.06 1.06l-4.293 4.293c-.151.152-.318.32-.476.44a1.3 1.3 0 0 1-.64.273l-.121.007a1.23 1.23 0 0 1-.76-.28c-.16-.12-.326-.288-.477-.44L4.47 8.03a.75.75 0 1 1 1.06-1.06l4.293 4.293.177.174.177-.174z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 text-xs border-b border-gray-50 text-gray-500">
                Manage Account
              </div>
              <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                Profile
              </button>
              <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                Settings
              </button>
              <div className="border-t border-gray-50" />
              <button className="block px-4 py-2 text-sm text-error hover:bg-gray-50 w-full text-left">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
