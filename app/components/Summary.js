import { useEffect, useState, useMemo } from 'react';
// No need for useSession if ownerEmail is passed as a prop
// import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
    FiUser,
    FiAlertCircle,
    FiCalendar,
    FiCheck,
    FiDollarSign,
    FiRefreshCw,
    FiPieChart // New icon for collected amount
} from 'react-icons/fi';

// Utility function to calculate bill status
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

// Utility to generate delivery data
const generateDeliveryData = (apiData, selectedMonth, selectedYear) => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const data = {};
    const today = new Date();
    const formatDate = (date) => date.toLocaleDateString('en-CA');

    const undeliveredMap = {};
    apiData.undelivered.forEach(record => {
        const recordDate = new Date(record.dateNotDelivered);
        const recordDateString = formatDate(recordDate);
        if (!undeliveredMap[record.name]) {
            undeliveredMap[record.name] = new Set();
        }
        undeliveredMap[record.name].add(recordDateString);
    });

    apiData.customers.forEach(customer => {
        const customerStartDate = new Date(customer.startDate);
        const customerStartYear = customerStartDate.getFullYear();
        const customerStartMonth = customerStartDate.getMonth();
        const customerStartDay = customerStartDate.getDate();

        data[customer._id] = {
            name: customer.name,
            days: {},
            totalDelivered: 0
        };

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(selectedYear, selectedMonth, day);
            const currentDateString = formatDate(currentDate);

            if (currentDate > today) {
                data[customer._id].days[day] = 'future';
                continue;
            }

            if (
                selectedYear < customerStartYear ||
                (selectedYear === customerStartYear && selectedMonth < customerStartMonth) ||
                (selectedYear === customerStartYear && selectedMonth === customerStartMonth && day < customerStartDay)
            ) {
                data[customer._id].days[day] = 'not-started';
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

// Circular ProgressBar Component
const CircularProgressBar = ({ progress, size = 60, strokeWidth = 8, color = 'var(--primary-600, #4F46E5)', bgColor = 'rgb(229, 231, 235)' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
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
                style={{ transition: 'stroke-dashoffset 0.35s ease-out' }}
            />
            <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill={color}
                className="transform rotate-90 origin-center" // Counter-rotate text
            >
                {Math.round(progress)}%
            </text>
        </svg>
    );
};

const SummaryCards = ({ ownerEmail, onClose }) => {
    const [customers, setCustomers] = useState([]);
    const [undelivered, setUndelivered] = useState([]);
    const [deliveryData, setDeliveryData] = useState({});
    const [extras, setExtras] = useState([]);
    const [extraMap, setExtraMap] = useState({});
    const [settledBills, setSettledBills] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true); // Set initial loading to true
    const [refreshing, setRefreshing] = useState(false);

    // Month options
    const getMonthOptions = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const options = [];

        for (let i = 0; i < 6; i++) {
            const month = (currentMonth - i + 12) % 12;
            const year = month > currentMonth ? currentYear - 1 : currentYear;
            options.push({
                value: month,
                year,
                label: new Date(year, month).toLocaleString('en-IN', { month: 'long', year: 'numeric' }) // Use 'en-IN' for consistency with Rupee symbol
            });
        }
        return options;
    };

    const monthOptions = useMemo(() => getMonthOptions(), []); // Memoize month options

    // Fetch customers and undelivered
    const fetchData = async () => {
        if (!ownerEmail) {
            setLoading(false); // Stop loading if no email
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/allcustomer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ownerEmail }),
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            if (data.success) {
                setCustomers(data.customers);
                setUndelivered(data.undelivered);
            } else {
                throw new Error(data.message || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(error.message || 'Something went wrong while fetching data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch extras
    const fetchExtras = async () => {
        if (!ownerEmail) return;
        try {
            const res = await fetch('/api/totalextra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ownerEmail,
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
            console.error('Error fetching extras:', error);
            toast.error(error.message || 'Something went wrong while fetching extras');
        }
    };

    // Fetch settled bills
    const fetchSettledBills = async () => {
        if (!ownerEmail) return;
        try {
            const res = await fetch('/api/getsettledbills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ownerEmail,
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
            console.error('Error fetching settled bills:', error);
            toast.error(error.message || 'Something went wrong while fetching settled bills');
        }
    };

    // Update extraMap when extras change
    useEffect(() => {
        const map = {};
        extras.forEach(extra => {
            if (!map[extra.name]) map[extra.name] = 0;
            map[extra.name] += extra.quantity;
        });
        setExtraMap(map);
    }, [extras]);

    // Generate delivery data whenever customers, undelivered, month, or year changes
    useEffect(() => {
        if (customers.length > 0 || undelivered.length > 0) { // Check for actual data
            const apiData = { customers, undelivered };
            const data = generateDeliveryData(apiData, selectedMonth, selectedYear);
            setDeliveryData(data);
        } else {
            setDeliveryData({}); // Clear delivery data if no customers/undelivered
        }
    }, [customers, undelivered, selectedMonth, selectedYear]);

    // Combined data fetch on ownerEmail, selectedMonth, or selectedYear change
    useEffect(() => {
        // Only fetch if ownerEmail is available
        if (ownerEmail) {
            fetchData();
            fetchExtras();
            fetchSettledBills();
        }
    }, [ownerEmail, selectedMonth, selectedYear]);

    const totalCustomers = customers.length;

    const pendingBills = useMemo(() => {
        return customers.filter(customer => {
            const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);
            return !billStatus.isSettled;
        }).length;
    }, [customers, deliveryData, extraMap, settledBills]);

    const calculateTotalSales = () => {
        return customers.reduce((total, customer) => {
            const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);
            return total + billStatus.totalBill;
        }, 0);
    };

    const totalSales = calculateTotalSales();

    const settledCount = useMemo(() => {
        return customers.filter(customer => {
            const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);
            return billStatus.isSettled;
        }).length;
    }, [customers, deliveryData, extraMap, settledBills]);

    const totalPaid = useMemo(() => {
        return Object.values(settledBills).reduce((sum, bill) => sum + bill.paid, 0);
    }, [settledBills]);

    const collectedPercentage = totalSales > 0 ? (totalPaid / totalSales) * 100 : 0;


    // Handle month change
    const handleMonthChange = (e) => {
        const selectedOption = monthOptions.find(opt => opt.value.toString() === e.target.value);
        if (!selectedOption) return;
        setSelectedMonth(selectedOption.value);
        setSelectedYear(selectedOption.year);
    };

    // Handle refresh data button
    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
        fetchExtras();
        fetchSettledBills();
    };

    if (!ownerEmail) {
        return (
            <div className="text-center py-8 text-gray-500">
                Please log in to view summary.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-28 bg-gray-200 rounded-xl shadow-md" />
                ))}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br backdrop-blur-sm p-4"> 
        {/* Added padding and light background */}
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h1 className="text-3xl font-extrabold text-white leading-tight">Summary</h1>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-blue-200">
                        <FiCalendar className="text-gray-500" />
                        <select
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="appearance-none bg-transparent pr-8 py-1 text-gray-800 font-medium cursor-pointer focus:outline-none"
                        >
                            {monthOptions.map((option) => (
                                <option key={`${option.year}-${option.value}`} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border transition-all duration-200
                                   ${refreshing ? 'bg-blue-100 text-blue-500 cursor-not-allowed' : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600 shadow-md'}`}
                    >
                        <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''} text-lg`} />
                        <span className="font-semibold">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                    </button>
                    {/* Optional: Close button using onClose prop */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-red-400 text-red-600 bg-white hover:bg-red-50 transition-colors shadow-sm"
                        >
                            <span className="font-semibold">Close</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
                {/* Total Customers */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between transition-all duration-200 hover:shadow-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Customers</p>
                        <p className="text-3xl font-bold text-gray-800">{totalCustomers}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                        <FiUser className="text-blue-600" size={24} />
                    </div>
                </div>

                {/* Pending Bills */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between transition-all duration-200 hover:shadow-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Pending Bills</p>
                        <p className="text-3xl font-bold text-yellow-600">{pendingBills}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                        <FiAlertCircle className="text-yellow-600" size={24} />
                    </div>
                </div>

                {/* Settled Bills */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between transition-all duration-200 hover:shadow-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Settled Bills</p>
                        <p className="text-3xl font-bold text-green-600">{settledCount}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                        <FiCheck className="text-green-600" size={24} />
                    </div>
                </div>

                {/* Total Sales */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between transition-all duration-200 hover:shadow-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Sales ({new Date(selectedYear, selectedMonth).toLocaleString('en-IN', { month: 'short' })})</p>
                        <p className="text-3xl font-bold text-purple-600">₹{totalSales.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                        <FiDollarSign className="text-purple-600" size={24} />
                    </div>
                </div>

                {/* Amount Collected (Circular Progress Bar) */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center transition-all duration-200 hover:shadow-lg text-center">
                    <p className="text-sm font-medium text-gray-500 mb-3">Amount Collected</p>
                    <CircularProgressBar
                        progress={collectedPercentage}
                        size={80}
                        strokeWidth={10}
                        color="rgb(34, 197, 94)" // Green for collected
                        bgColor="rgb(229, 231, 235)" // Light gray for background
                    />
                    <p className="text-lg font-semibold text-gray-800 mt-3">₹{totalPaid.toLocaleString('en-IN')}</p>
                </div>
            </div>
            {/* You can add more sections/components here */}
            </div>
        </div>
    );
};

export default SummaryCards;