import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
    FiUser,
    FiAlertCircle,
    FiCalendar,
    FiCheck,
    FiDollarSign,
    FiRefreshCw
} from 'react-icons/fi';

// Utility function to calculate bill status (copy from your Bill component)
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

const SummaryCards = (props) => {
    const { data: session, status } = useSession();
    const [customers, setCustomers] = useState([]);
    const [undelivered, setUndelivered] = useState([]);
    const [deliveryData, setDeliveryData] = useState({});
    const [extras, setExtras] = useState([]);
    const [extraMap, setExtraMap] = useState({});
    const [settledBills, setSettledBills] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Month options reused from main component
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
                label: new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })
            });
        }

        return options;
    };

    const monthOptions = getMonthOptions();

    // Fetch customers and undelivered
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
            console.error('Error fetching extras:', error);
            toast.error(error.message || 'Something went wrong while fetching extras');
        }
    };

    // Fetch settled bills
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
        if (customers.length && undelivered.length) {
            const apiData = { customers, undelivered };
            const data = generateDeliveryData(apiData, selectedMonth, selectedYear);
            setDeliveryData(data);
        }
    }, [customers, undelivered, selectedMonth, selectedYear]);

    // Combined data fetch on mount and when month/year changes
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

    const calculateTotalSales = () => {
        return customers.reduce((total, customer) => {
            const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);
            return total + billStatus.totalBill;
        }, 0);
    };

    const totalSales = calculateTotalSales();

    const settledCount = totalCustomers - pendingBills;

    // Handle month change
    const handleMonthChange = (e) => {
        const selectedOption = monthOptions.find(opt => opt.value.toString() === e.target.value);
        if (!selectedOption) return;
        setSelectedMonth(selectedOption.value);
        setSelectedYear(selectedOption.year);
    };

    // Refresh data button
    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
        fetchExtras();
        fetchSettledBills();
    };

    if (status === 'loading' || loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{props.title}</h1>
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                    <FiCalendar className="text-gray-500" />
                    <select
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        className="appearance-none bg-transparent pr-8 py-1 text-gray-700 focus:outline-none cursor-pointer"
                    >
                        {monthOptions.map((option) => (
                            <option key={`${option.year}-${option.value}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {/* Chevron icon not added here to keep minimal */}
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
                >
                    <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-800">{totalCustomers}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full">
                            <FiUser className="text-blue-500" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending Bills</p>
                            <p className="text-2xl font-bold text-yellow-600">{pendingBills}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-full">
                            <FiAlertCircle className="text-yellow-500" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Current Month</p>
                            <p className="text-xl font-bold text-gray-800">
                                {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <FiCalendar className="text-green-500" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Settled Bills</p>
                            <p className="text-2xl font-bold text-green-600">{settledCount}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <FiCheck className="text-green-500" size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Sales</p>
                            <p className="text-2xl font-bold text-purple-600">₹{totalSales.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full">
                            <FiDollarSign className="text-purple-500" size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryCards;

