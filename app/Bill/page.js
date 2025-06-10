'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import Navbar from '../components/Navbar'
import 'react-loading-skeleton/dist/skeleton.css'
import { useRouter } from 'next/navigation'
import {
    FiChevronDown,
    FiCheck,
    FiAlertCircle,
    FiX,
    FiCalendar,
    FiRefreshCw,
    FiUser,
    FiPhone,
    FiDroplet,
    FiDollarSign,
    FiCreditCard,
    FiPlus
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

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
            newCharges: newCharges,
            originalTotal: existingBill.total
        };
    } else {
        const remaining = Math.max(0, currentTotalBill - existingBill.paid);
        return {
            totalBill: currentTotalBill,
            paid: existingBill.paid,
            remaining: remaining,
            isSettled: remaining <= 0,
            hasNewCharges: false,
            newCharges: 0,
            originalTotal: existingBill.total
        };
    }
};

export default function Bill() {
    const router = useRouter()
    const { data: session, status } = useSession()

    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [isSettleOpen, setIsSettleOpen] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [deliveryData, setDeliveryData] = useState({})
    const [apiData, setApiData] = useState({ customers: [], undelivered: [] })
    const [extras, setExtras] = useState([])
    const [paidAmount, setPaidAmount] = useState('')
    const [settleLoading, setSettleLoading] = useState(false)
    const [settledBills, setSettledBills] = useState({})
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('unsettled') // 'unsettled' or 'settled'
    const pathname1 = usePathname();
    
    const getMonthOptions = () => {
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        const options = []

        for (let i = 0; i < 6; i++) {
            const month = (currentMonth - i + 12) % 12
            const year = month > currentMonth ? currentYear - 1 : currentYear
            options.push({
                value: month,
                year: year,
                label: new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })
            })
        }

        return options
    }

    const monthOptions = getMonthOptions()

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    const extraMap = useMemo(() => {
        const map = {}
        extras.forEach(extra => {
            if (!map[extra.name]) {
                map[extra.name] = 0
            }
            map[extra.name] += extra.quantity
        })
        return map
    }, [extras])

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);
            const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase());

            if (viewMode === 'unsettled') {
                return matchesSearch && billStatus.totalBill > 0 && !billStatus.isSettled;
            } else {
                return matchesSearch && billStatus.totalBill > 0 && billStatus.isSettled;
            }
        });
    }, [customers, searchQuery, deliveryData, extraMap, settledBills, viewMode]);

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/allcustomer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ownerEmail: session?.user?.email }),
            })

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

            const data = await res.json()
            if (data.success) {
                setApiData({
                    customers: data.customers,
                    undelivered: data.undelivered
                })
                setCustomers(data.customers)
            } else {
                throw new Error(data.message || 'Failed to fetch data')
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong while fetching data')
        } finally {
            setLoading(false)
        }
    }

    const fetchSettledBills = async () => {
        try {
            const res = await fetch('/api/getsettledbills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ownerEmail: session?.user?.email,
                    month: selectedMonth,
                    year: selectedYear,
                }),
            })

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

            const data = await res.json()
            if (data.success) {
                const billsMap = {}
                data.bills.forEach(bill => {
                    billsMap[bill.customerName] = bill
                })
                setSettledBills(billsMap)
            } else {
                throw new Error(data.message || 'Failed to fetch settled bills')
            }
        } catch (error) {
            
            toast.error(error.message || 'Something went wrong while fetching settled bills')
        }
    }

    const fetchExtras = async () => {
        try {
            const res = await fetch('/api/totalextra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ownerEmail: session?.user?.email,
                    month: selectedMonth,
                    year: selectedYear,
                }),
            })

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

            const data = await res.json()
            if (data.success) {
                setExtras(data.extras)
            } else {
                throw new Error(data.message || 'Failed to fetch extras')
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong while fetching extras')
        }
    }

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email) {
            Promise.all([
                fetchData(),
                fetchExtras(),
                fetchSettledBills()
            ])
        }
    }, [status, selectedMonth, selectedYear, session?.user?.email])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status, router])

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
        fetchExtras();
        fetchSettledBills();
    };

    const totalCustomers = customers.length;
    const pendingBills = useMemo(() => {
        return customers.filter(customer => {
            const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);
            return !billStatus.isSettled;
        }).length;
    }, [customers, deliveryData, extraMap, settledBills]);
    const settledCount = totalCustomers - pendingBills;

    useEffect(() => {
        if (apiData.customers.length > 0) {
            generateDeliveryData()
        }
    }, [apiData, selectedMonth, selectedYear])

    const handleSettleBill = async () => {
        if (!selectedCustomer || !paidAmount) return;

        const billStatus = calculateBillStatus(selectedCustomer, deliveryData, extraMap, settledBills);

        if (Number(paidAmount) > billStatus.remaining) {
            toast.error('Paid amount cannot be more than remaining amount');
            return;
        }

        if (Number(paidAmount) <= 0) {
            toast.error('Paid amount must be greater than 0');
            return;
        }

        try {
            setSettleLoading(true);

            const newPaidAmount = billStatus.paid + Number(paidAmount);
            const newRemainingAmount = billStatus.remaining - Number(paidAmount);

            const res = await fetch('/api/settlebill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: selectedCustomer.name,
                    ownerEmail: session.user.email,
                    month: selectedMonth,
                    year: selectedYear,
                    total: billStatus.totalBill,
                    paid: newPaidAmount,
                    remaining: newRemainingAmount
                })
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

            const data = await res.json();
            if (data.success) {
                toast.success('Payment recorded successfully');
                setIsSettleOpen(false);
                setSelectedCustomer(null);
                setPaidAmount('');
                fetchSettledBills();
            } else {
                throw new Error(data.message || 'Failed to record payment');
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong while recording payment');
        } finally {
            setSettleLoading(false);
        }
    }

    const fetchCustomers = async () => {
        try {
            setRefreshing(true)
            await fetchData()
        } catch (error) {
        } finally {
            setRefreshing(false)
        }
    }

    const generateDeliveryData = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
        const data = {}
        const today = new Date()
        const formatDate = (date) => date.toLocaleDateString('en-CA')

        const undeliveredMap = {}
        apiData.undelivered.forEach(record => {
            const recordDate = new Date(record.dateNotDelivered)
            const recordDateString = formatDate(recordDate)
            if (!undeliveredMap[record.name]) {
                undeliveredMap[record.name] = new Set()
            }
            undeliveredMap[record.name].add(recordDateString)
        })

        apiData.customers.forEach(customer => {
            const customerStartDate = new Date(customer.startDate)
            const customerStartYear = customerStartDate.getFullYear()
            const customerStartMonth = customerStartDate.getMonth()
            const customerStartDay = customerStartDate.getDate()

            data[customer._id] = {
                name: customer.name,
                days: {},
                totalDelivered: 0
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const currentDate = new Date(selectedYear, selectedMonth, day)
                const currentDateString = formatDate(currentDate)

                if (currentDate > today) {
                    data[customer._id].days[day] = 'future'
                    continue
                }

                if (
                    selectedYear < customerStartYear ||
                    (selectedYear === customerStartYear && selectedMonth < customerStartMonth) ||
                    (selectedYear === customerStartYear && selectedMonth === customerStartMonth && day < customerStartDay)
                ) {
                    data[customer._id].days[day] = 'not-started'
                    continue
                }

                const isUndelivered = undeliveredMap[customer.name]?.has(currentDateString)
                const status = isUndelivered ? 'undelivered' : 'delivered'
                data[customer._id].days[day] = status

                if (status === 'delivered') {
                    data[customer._id].totalDelivered += 1
                }
            }
        })

        setDeliveryData(data)
    }

    const handleMonthChange = (e) => {
        const selectedOption = monthOptions.find(opt => opt.value.toString() === e.target.value)
        setSelectedMonth(selectedOption.value)
        setSelectedYear(selectedOption.year)
    }

    const calculateTotalSales = () => {
        return customers.reduce((total, customer) => {
            const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);
            return total + billStatus.totalBill;
        }, 0);
    };
    const totalSales = calculateTotalSales();

    const summaryStats = useMemo(() => {
        const totalCustomers = customers.length;
        const pendingBills = customers.filter(customer => {
            const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);
            return !billStatus.isSettled;
        }).length;

        const totalSales = calculateTotalSales(customers, deliveryData, extraMap, settledBills);

        return {
            totalCustomers,
            totalPendingBills: pendingBills,
            totalSettledBills: totalCustomers - pendingBills,
            totalSales
        };
    }, [customers, deliveryData, extraMap, settledBills]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar pathname1={pathname1} />

                <div className="p-6 max-w-6xl mx-auto">
                    <Skeleton height={40} width={240} className="mb-8 rounded-lg" />
                    <div className="grid gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-6 bg-white rounded-xl shadow-sm">
                                <Skeleton count={4} height={24} className="mb-3" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar pathname1={pathname1} />

            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                <div>
                    <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Billing Overview</h1>
                        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
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
                            </div>

                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                                <button
                                    onClick={() => setViewMode('unsettled')}
                                    className={`px-3 py-1 rounded-lg text-sm ${viewMode === 'unsettled' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                                >
                                    Unsettled
                                </button>
                                <button
                                    onClick={() => setViewMode('settled')}
                                    className={`px-3 py-1 rounded-lg text-sm ${viewMode === 'settled' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                                >
                                    Settled
                                </button>
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

                   
                </div>

                {loading ? (
                    <div className="grid gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-6 bg-white rounded-xl shadow-sm">
                                <Skeleton count={4} height={24} className="mb-3" />
                            </div>
                        ))}
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FiUser className="text-gray-400 text-3xl" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                {searchQuery ? 'No matching customers found' :
                                    viewMode === 'unsettled' ? 'No unsettled bills to display' : 'No settled bills to display'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchQuery ? 'Try a different search term' :
                                    viewMode === 'unsettled' ? 'All bills are settled for this period' : 'No bills have been settled yet'}
                            </p>
                            <button
                                onClick={fetchCustomers}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            >
                                Refresh List
                            </button>
                        </div>
                    </div>
                ) : (
                    // Modified section: grid for customer cards and linear layout within cards
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Adjusted grid for customer cards */}
                        {filteredCustomers.map((customer) => {
                            const billStatus = calculateBillStatus(customer, deliveryData, extraMap, settledBills);

                            return (
                                <motion.div
                                    key={customer._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                                >
                                    {/* Linear layout for customer details within each card */}
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${billStatus.isSettled ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                            <FiUser className="text-blue-500" />
                                            {customer.name}
                                            <span className="ml-auto text-gray-600 flex items-center gap-1"> {/* Moved phone number next to name */}
                                                <FiPhone className="text-gray-400" />
                                                {customer.phoneno}
                                            </span>
                                        </h3>

                                        <div className="flex items-center gap-2 text-gray-700">
                                            <FiDroplet className="text-blue-500" />
                                            <span className="font-medium">Quantity:</span>
                                            <span className="font-mono">{customer.quantity} Ltr.</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <FiDollarSign className="text-blue-500" />
                                            <span className="font-medium">Price:</span>
                                            <span className="font-mono">₹{customer.price.toLocaleString()}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-700">
                                            <FiCalendar className="text-blue-500" />
                                            <span className="font-medium">Start Date:</span>
                                            <span>{formatDate(customer.startDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <FiCheck className="text-blue-500" />
                                            <span className="font-medium">Delivered:</span>
                                            <span className="font-mono">{deliveryData[customer._id]?.totalDelivered ?? 0} days</span>
                                        </div>

                                        {extraMap[customer.name] && (
                                            <>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <FiDroplet className="text-blue-500" />
                                                    <span className="font-medium">Extra:</span>
                                                    <span className="font-mono">{extraMap[customer.name]} Ltr.</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <FiDollarSign className="text-blue-500" />
                                                    <span className="font-medium">Extra Bill:</span>
                                                    <span className="font-mono">₹{(extraMap[customer.name] * customer.price).toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}

                                        <div className="pt-2 border-t border-gray-100 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-700">Total Bill:</span>
                                                <span className="font-mono font-semibold">₹{billStatus.totalBill.toFixed(2)}</span>
                                            </div>

                                            {billStatus.paid > 0 && (
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-700">Paid:</span>
                                                    <span className="font-mono text-green-600">₹{billStatus.paid.toFixed(2)}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-700">Remaining:</span>
                                                <span className={`font-mono ${billStatus.remaining > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    ₹{billStatus.remaining.toFixed(2)}
                                                </span>
                                            </div>

                                            {billStatus.hasNewCharges && (
                                                <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <FiPlus className="text-yellow-600" size={14} />
                                                    <span className="text-xs text-yellow-700 font-medium">
                                                        New charges: ₹{billStatus.newCharges.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}

                                            {settledBills[customer.name] && (
                                                <div className="text-xs text-gray-500 text-right">
                                                    Last payment: {new Date(settledBills[customer.name].settledAt).toLocaleDateString("en-IN")}
                                                </div>
                                            )}
                                        </div>

                                        {billStatus.totalBill > 0 && !billStatus.isSettled && (
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCustomer(customer)
                                                        setIsSettleOpen(true)
                                                        setPaidAmount('')
                                                    }}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-md flex items-center gap-1"
                                                >
                                                    <FiCreditCard size={14} />
                                                    {billStatus.hasNewCharges ? 'Pay New Charges' : 'Settle Bill'}
                                                </button>
                                            </div>
                                        )}
                                        {/* Added Edit and Delete buttons as per the image */}
                                      
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </main>

            <AnimatePresence>
                {isSettleOpen && selectedCustomer && (() => {
                    const billStatus = calculateBillStatus(selectedCustomer, deliveryData, extraMap, settledBills);

                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                className="bg-white rounded-xl p-6 w-full max-w-md"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800">Settle Bill</h3>
                                    <button
                                        onClick={() => setIsSettleOpen(false)}
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-600">Customer: <span className="font-medium">{selectedCustomer.name}</span></p>
                                        <p className="text-gray-600">Month: <span className="font-medium">
                                            {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </span></p>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <div className="flex justify-between items-center">
                                            <p className="text-gray-800 font-medium">Total Bill:</p>
                                            <p className="font-mono font-semibold">₹{billStatus.totalBill.toFixed(2)}</p>
                                        </div>
                                        {billStatus.paid > 0 && (
                                            <div className="mt-2 pt-2 border-t border-blue-100">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-gray-700 text-sm">Already Paid:</p>
                                                    <p className="font-mono text-sm text-green-600">₹{billStatus.paid.toFixed(2)}</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-gray-700 text-sm">Remaining:</p>
                                                    <p className="font-mono text-sm text-yellow-600">₹{billStatus.remaining.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount Paid
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                id="paidAmount"
                                                value={paidAmount}
                                                onChange={(e) => {
                                                    const value = Math.min(Number(e.target.value), billStatus.remaining);
                                                    setPaidAmount(value);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSettleBill();
                                                    }
                                                }}
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder={`Enter amount (max ₹${billStatus.remaining.toFixed(2)})`}
                                                max={billStatus.remaining}
                                            />
                                        </div>
                                    </div>

                                    {paidAmount && (
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-700">New Payment:</span>
                                                <span className="font-mono font-medium">₹{Number(paidAmount).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-gray-700">Remaining After Payment:</span>
                                                <span className="font-mono font-medium">
                                                    ₹{(billStatus.remaining - Number(paidAmount)).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            onClick={() => setIsSettleOpen(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSettleBill}
                                            disabled={settleLoading || !paidAmount}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                        >
                                            {settleLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <FiRefreshCw className="animate-spin" />
                                                    Processing...
                                                </span>
                                            ) : 'Settle Bill'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                })()}
            </AnimatePresence>
        </div>
    )
}