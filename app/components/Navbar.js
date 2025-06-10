"use client"
import React, { useState } from 'react'
import { useSession, signIn, signOut } from "next-auth/react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = (props) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Helper function to determine if a link is active
  const isActive = (href) => {
    return pathname === href;
  };

  const baseLinkClasses = "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  const activeLinkClasses = "border-indigo-500 text-gray-900";
  const inactiveLinkClasses = "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700";

  const baseMobileLinkClasses = "block pl-3 pr-4 py-2 border-l-4 text-base font-medium";
  const activeMobileLinkClasses = "bg-indigo-50 border-indigo-500 text-indigo-700";
  const inactiveMobileLinkClasses = "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700";


  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Milk Mate</h1>
              </div>
              {session && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/"
                    className={`${baseLinkClasses} ${isActive("/") ? activeLinkClasses : inactiveLinkClasses}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/Addcustomer"
                    className={`${baseLinkClasses} ${isActive("/Addcustomer") ? activeLinkClasses : inactiveLinkClasses}`}
                  >
                    Add Customer
                  </Link>
                  <Link
                    href="/Allcustomer"
                    className={`${baseLinkClasses} ${isActive("/Allcustomer") ? activeLinkClasses : inactiveLinkClasses}`}
                  >
                    All Customers
                  </Link>
                  <Link
                    href="/Bill"
                    className={`${baseLinkClasses} ${isActive("/Bill") ? activeLinkClasses : inactiveLinkClasses}`}
                  >
                    Bills
                  </Link>
                  <Link
                    href="/Monthlydata"
                    className={`${baseLinkClasses} ${isActive("/Monthlydata") ? activeLinkClasses : inactiveLinkClasses}`}
                  >
                    Monthly Data
                  </Link>
                </div>
              )}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <span className="text-gray-500 mr-4 text-sm font-medium">
                {new Date().getDate()} {new Date().toLocaleString('default', { month: 'long' })}
              </span>
              {!session ? (
                <button
                  onClick={() => signIn("google")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </button>
              ) : (
                <div className="ml-3 relative flex items-center">
                  <span className="text-gray-700 mr-3 text-sm font-medium">
                    {session.user?.name}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                {!isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  // Close icon
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {session && (
                <>
                  <Link
                    href="/"
                    className={`${baseMobileLinkClasses} ${isActive("/") ? activeMobileLinkClasses : inactiveMobileLinkClasses}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/Addcustomer"
                    className={`${baseMobileLinkClasses} ${isActive("/Addcustomer") ? activeMobileLinkClasses : inactiveMobileLinkClasses}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Add Customer
                  </Link>
                  <Link
                    href="/Allcustomer"
                    className={`${baseMobileLinkClasses} ${isActive("/Allcustomer") ? activeMobileLinkClasses : inactiveMobileLinkClasses}`}
                    onClick={() => setIsOpen(false)}
                  >
                    All Customers
                  </Link>
                  <Link
                    href="/Bill"
                    className={`${baseMobileLinkClasses} ${isActive("/Bill") ? activeMobileLinkClasses : inactiveMobileLinkClasses}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Bills
                  </Link>
                  <Link
                    href="/Monthlydata"
                    className={`${baseMobileLinkClasses} ${isActive("/Monthlydata") ? activeMobileLinkClasses : inactiveMobileLinkClasses}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Monthly Data
                  </Link>
                </>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {!session ? (
                <div className="px-4">
                  <button
                    onClick={() => signIn("google")}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sign in
                  </button>
                </div>
              ) : (
                <div className="px-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {/* You can add user avatar here if available */}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {session.user?.name}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <button
                      onClick={() => signOut()}
                      className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar