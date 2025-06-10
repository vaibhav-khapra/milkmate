'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';
import {
  FiCreditCard,
  FiTrendingUp,
  FiUserPlus,
  FiTruck,
  FiDollarSign,
  FiUsers,
  FiUser,
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiRefreshCw
} from 'react-icons/fi';
import Navbar from './Navbar';
import AdditionalSale from './AdditionalSale';
import CustomerDeliveryStatus from './CustomerDeliveryStatus';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';



// Reusing the existing calculation functions (no changes here)
const calculateBillStatus = (customer, deliveryData, extraMap, settledBills) => {
  const baseAmount = customer.price * customer.quantity * (deliveryData[customer._id]?.totalDelivered ?? 0);
  const extraAmount = extraMap[customer.name] ? (extraMap[customer.name] * customer.price) : 0;
  const currentTotalBill = baseAmount + extraAmount;
  const existingBill = settledBills[customer.name];

  if (!existingBill) {
    return {
      totalBill: currentTotalBill,
      paid: 0,
      remaining: currentTotalBill,
      isSettled: currentTotalBill === 0,
      hasNewCharges: false,
      originalTotal: 0,
      newCharges: 0
    };
  }

  const hasNewCharges = currentTotalBill > existingBill.total;

  if (hasNewCharges) {
    const newCharges = currentTotalBill - existingBill.total;
    return {
      totalBill: currentTotalBill,
      paid: existingBill.paid,
      remaining: existingBill.remaining + newCharges,
      isSettled: false,
      hasNewCharges: true,
      newCharges,
      originalTotal: existingBill.total
    };
  } else {
    const remaining = Math.max(0, currentTotalBill - existingBill.paid);
    return {
      totalBill: currentTotalBill,
      paid: existingBill.paid,
      remaining,
      isSettled: remaining <= 0,
      hasNewCharges: false,
      newCharges: 0,
      originalTotal: existingBill.total
    };
  }
};

const generateDeliveryData = (apiData, selectedMonth, selectedYear) => {
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const data = {};
  const today = new Date();
  // Normalize today to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  const formatDate = (date) => date.toLocaleDateString('en-CA'); // This consistently gives YYYY-MM-DD


  const undeliveredMap = {};
  apiData.undelivered.forEach(record => {
    const recordDate = new Date(record.dateNotDelivered);
    // Normalize recordDate to start of day
    recordDate.setHours(0, 0, 0, 0);
    const recordDateString = formatDate(recordDate);
    if (!undeliveredMap[record.name]) {
      undeliveredMap[record.name] = new Set();
    }
    undeliveredMap[record.name].add(recordDateString);
  });

  apiData.customers.forEach(customer => {
    const customerStartDate = new Date(customer.startDate);
    // Normalize customerStartDate to start of day
    customerStartDate.setHours(0, 0, 0, 0);

    data[customer._id] = {
      name: customer.name,
      quantity: customer.quantity,
      isDeliveredInitially: customer.isDelivered,
      days: {},
      totalDelivered: 0
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedYear, selectedMonth, day);
      currentDate.setHours(0, 0, 0, 0); // Normalize currentDate
      const currentDateString = formatDate(currentDate);

      // Determine if delivery should have started for this customer
      const customerStarted = (currentDate >= customerStartDate);

      if (!customerStarted) {
        data[customer._id].days[day] = 'not-started';
        continue;
      }

      if (currentDate > today) {
        data[customer._id].days[day] = 'future';
        continue;
      }

      const isUndelivered = undeliveredMap[customer.name]?.has(currentDateString);
      const status = isUndelivered ? 'undelivered' : 'delivered';
      data[customer._id].days[day] = status;

      if (status === 'delivered') {
        data[customer._id].totalDelivered += 1;
      }
    }
  });

  return data;
};

// CircularProgressBar Component (no changes)
const CircularProgressBar = ({ progress, size = 100, strokeWidth = 10, color = '#22c55e', bgColor = '#e0e0e0' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform -rotate-90"
    >
      <circle
        stroke={bgColor}
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference + ' ' + circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ transition: 'stroke-dashoffset 0.35s ease' }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="transform rotate-90"
        style={{ transformOrigin: 'center center', fontSize: `${size / 4}px`, fill: '#4b5563' }}
      >
        {`${Math.round(progress)}%`}
      </text>
    </svg>
  );
};


const Dashboard = () => {
  const { data: session, status } = useSession();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0
  });
  const [currentDayDeliveryStatus, setCurrentDayDeliveryStatus] = useState([]);
  const [togglingId, setTogglingId] = useState(null);
  const [undelivered, setUndelivered] = useState([]);
  const [deliveryData, setDeliveryData] = useState({});
  const [extras, setExtras] = useState([]);
  const [extraMap, setExtraMap] = useState({});
  const [settledBills, setSettledBills] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);
  const [openDay, setOpenDay] = useState(null); // State for accordion

  // Get current month to compare with selectedMonth
  const currentMonthActual = new Date().getMonth();
  const currentYearActual = new Date().getFullYear();


  const getMonthOptions = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const options = [];

    for (let i = 0; i < 6; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      options.push({
        value: month,
        year: year,
        label: new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })
      });
    }
    return options;
  };
  const router = useRouter()

  const monthOptions = useMemo(getMonthOptions, []);

  const fetchData = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/allcustomer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerEmail: session.user.email }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        setUndelivered(data.undelivered); // This is the full historical undelivered array

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const activeCustomers = data.customers.filter(c => c.isDelivered === true);
        const newThisMonth = data.customers.filter(c => {
          const date = new Date(c.startDate);
          return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        }).length;

        setStats({
          total: data.customers.length,
          active: activeCustomers.length,
          newThisMonth
        });

        // --- CRITICAL FIX START ---
        // Create a map for today's undelivered status using the consistent YYYY-MM-DD format
        const todayFormatted = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const undeliveredTodaySet = new Set(
          data.undelivered
            .filter(u => new Date(u.dateNotDelivered).toLocaleDateString('en-CA') === todayFormatted)
            .map(u => u.name) // Just store name as the key for checking today's status
        );

        // Populate currentDayDeliveryStatus based on today's undelivered records
        setCurrentDayDeliveryStatus(data.customers.map(c => {
          // if customer's name exists in undeliveredTodaySet, then they are NOT delivered today
          const isDeliveredForToday = !undeliveredTodaySet.has(c.name);
          return { ...c, isDelivered: isDeliveredForToday };
        }));
        // --- CRITICAL FIX END ---

      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (error) {
      
      toast.error(error.message || 'Something went wrong while fetching data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchExtras = async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch('/api/totalextra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail: session.user.email,
          month: selectedMonth,
          year: selectedYear,
        })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setExtras(data.extras);
      } else {
        throw new Error(data.message || 'Failed to fetch extras');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong while fetching extras');
    }
  };

  const fetchSettledBills = async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch('/api/getsettledbills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerEmail: session.user.email,
          month: selectedMonth,
          year: selectedYear,
        })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        const billsMap = {};
        data.bills.forEach(bill => {
          billsMap[bill.customerName] = bill;
        });
        setSettledBills(billsMap);
      } else {
        throw new Error(data.message || 'Failed to fetch settled bills');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong while fetching settled bills');
    }
  };

  useEffect(() => {
    const map = {};
    extras.forEach(extra => {
      if (!map[extra.name]) map[extra.name] = 0;
      map[extra.name] += extra.quantity;
    });
    setExtraMap(map);
  }, [extras]);

  useEffect(() => {
    if (customers.length || undelivered.length) {
      const apiData = { customers, undelivered };
      const data = generateDeliveryData(apiData, selectedMonth, selectedYear);
      setDeliveryData(data);
    } else {
      setDeliveryData({});
    }
  }, [customers, undelivered, selectedMonth, selectedYear]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchData();
      fetchExtras();
      fetchSettledBills();
    }
  }, [status, session?.user?.email, selectedMonth, selectedYear]);

  const totalCustomers = customers.length;

  const pendingBills = useMemo(() => {
    return customers.filter(customer => {
      const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);
      return !billStatus.isSettled;
    }).length;
  }, [customers, deliveryData, extraMap, settledBills]);

  const { totalSales, totalCollected } = useMemo(() => {
    let sales = 0;
    let collected = 0;
    customers.forEach(customer => {
      const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);
      sales += billStatus.totalBill;
      collected += billStatus.paid;
    });
    return { totalSales: sales, totalCollected: collected };
  }, [customers, deliveryData, extraMap, settledBills]);

  const collectedPercentage = totalSales > 0 ? (totalCollected / totalSales) * 100 : 0;


  const settledCount = totalCustomers - pendingBills;

  const handleMonthChange = (e) => {
    const selectedOption = monthOptions.find(opt => opt.value.toString() === e.target.value);
    if (!selectedOption) return;
    setSelectedMonth(selectedOption.value);
    setSelectedYear(selectedOption.year);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
    fetchExtras();
    fetchSettledBills();
  };
  // Inside Dashboard.js
  const quickActions = [
    {
      name: "Add Customer",      // The text displayed on the button
      icon: FiUserPlus,          // The icon from 'react-icons/fi'
      onClick: () => router.push("/Addcustomer"), // The function to execute when clicked (navigates to /Addcustomer page)
      bgColor: "bg-blue-500",    // Tailwind CSS class for background color
      textColor: "text-white",   // Tailwind CSS class for text color
      hoverBg: "hover:bg-blue-600"// Tailwind CSS class for hover background color
    },
    {
      name: "Deliveries",
      icon: FiTruck,
      onClick: () => router.push("/Monthlydata"),
      bgColor: "bg-purple-500",
      textColor: "text-white",
      hoverBg: "hover:bg-purple-600"
    },
    {
      name: "Settle Bills",
      icon: FiCreditCard,
      onClick: () => router.push("/Bill"),
      bgColor: "bg-green-500",
      textColor: "text-white",
      hoverBg: "hover:bg-green-600"
    },
    {
      name: "All Customers",
      icon: FiUsers,
      onClick: () => router.push("/Allcustomer"),
      bgColor: "bg-indigo-500",
      textColor: "text-white",
      hoverBg: "hover:bg-indigo-600"
    },
  ];


  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm h-32 animate-pulse"></div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm h-80 animate-pulse lg:col-span-1"></div>
            <div className="bg-white p-6 rounded-lg shadow-sm h-80 animate-pulse lg:col-span-2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header with Title and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">
              {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthOptions.map((option) => (
                <option key={`${option.year}-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Total Customers */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{totalCustomers}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FiUser className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Active Customers */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Customers</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.active}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Pending Bills */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Bills</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{pendingBills}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FiAlertCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Total Sales */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">₹{totalSales.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FiTrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Collected Amount */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Amount Collected</p>
                <p className="text-2xl font-bold text-green-600 mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiDollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Progress Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Collection Progress</h3>
            <div className="flex flex-col items-center">
              <CircularProgressBar
                progress={collectedPercentage}
                size={160}
                strokeWidth={12}
                color="#10B981"
                bgColor="#E5E7EB"
              />
              <div className="mt-4 text-center">
                <p className="text-gray-600">
                  Collected <span className="font-bold text-green-600">₹{totalCollected.toLocaleString('en-IN')}</span> of <span className="font-bold">₹{totalSales.toLocaleString('en-IN')}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {collectedPercentage.toFixed(1)}% of total sales collected
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`flex items-center gap-3 hover:cursor-pointer p-4 rounded-lg transition-all ${action.bgColor} ${action.hoverBg} ${action.textColor} font-medium`}
                >
                  <action.icon className="h-5 w-5" />
                  <span>{action.name}</span>
                </button>
              ))}
            </div>

            {/* Stats Summary */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">New This Month</p>
                <p className="text-xl font-bold text-blue-800">{stats.newThisMonth}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Settled Bills</p>
                <p className="text-xl font-bold text-green-800">{settledCount}</p>
              </div>
            </div>
          </div>
        </div>


        {/* CustomerDeliveryStatus component - CONDITIONAL RENDERING */}
        {selectedMonth === currentMonthActual && selectedYear === currentYearActual && (
          <CustomerDeliveryStatus
            undeliveredCustomers={currentDayDeliveryStatus}
            setUndeliveredCustomers={setCurrentDayDeliveryStatus}
            loading={loading}
            setTogglingId={setTogglingId}
            togglingId={togglingId}
            fetchCustomers={fetchData}
            session={session}
          />
        )}

        <AdditionalSale customers={customers} month={selectedMonth} />
      </main>
    </div>
  );
};

export default Dashboard;