'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';
import { FiChevronDown, FiCalendar, FiUsers } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import DeliveryStatusComponent from '../components/DeliveryStatusComponent';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

const Monthlydata = () => {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [baseDeliveryStatus, setBaseDeliveryStatus] = useState({});
    const [dailyCombinedQuantities, setDailyCombinedQuantities] = useState({});
    const [extraSaleQuantitiesForDays, setExtraSaleQuantitiesForDays] = useState({});
    const [apiData, setApiData] = useState({ customers: [], undelivered: [], extras: [] });
    const pathname1 = usePathname();
   
    const getMonthOptions = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const options = [];

        for (let i = 0; i < 6; i++) {
            const month = (currentMonth - i + 12) % 12;
            // Adjust year for previous months if they cross into the previous year
            const year = (month > currentMonth && i > 0) ? currentYear - 1 : currentYear;

            options.push({
                value: month,
                year: year,
                label: new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })
            });
        }
        return options;
    };

    const monthOptions = useMemo(getMonthOptions, []);
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push("/");
        }
    }, [status, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const customerRes = await fetch('/api/allcustomer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ownerEmail: session?.user?.email }),
            });
            const customerData = await customerRes.json();

            const extraRes = await fetch('/api/totalextra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ownerEmail: session?.user?.email,
                    month: selectedMonth,
                    year: selectedYear,
                })
            });
            const extraData = await extraRes.json();

            if (customerData.success && extraData.success) {
                setApiData({
                    customers: customerData.customers,
                    undelivered: customerData.undelivered,
                    extras: extraData.extras
                });
            } else {
                toast.error(customerData.message || extraData.message || 'Failed to fetch data');
            }
        } catch (error) {
            toast.error('Something went wrong while fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email) {
            fetchData();
        }
    }, [status, session?.user?.email, selectedMonth, selectedYear]);


    useEffect(() => {
        if (apiData.customers.length > 0) {
            generateDeliveryData();
        } else {
            // Clear data if no customers are present to avoid stale data display
            setBaseDeliveryStatus({});
            setDailyCombinedQuantities({});
            setExtraSaleQuantitiesForDays({});
        }
    }, [apiData, selectedMonth, selectedYear]);

    const generateDeliveryData = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const newBaseDeliveryStatus = {};
        const newCombinedQuantities = {};
        const newExtraSaleQuantitiesForDays = {};

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

        const formatDate = (date) => date.toLocaleDateString('en-CA'); // Consistent date string for mapping

        // Pre-process undelivered and extra data for efficient lookup
        const undeliveredMap = {};
        apiData.undelivered.forEach(record => {
            const recordDate = new Date(record.dateNotDelivered);
            recordDate.setHours(0, 0, 0, 0);
            const recordDateString = formatDate(recordDate);
            if (!undeliveredMap[record.name]) {
                undeliveredMap[record.name] = new Set();
            }
            undeliveredMap[record.name].add(recordDateString);
        });

        const extraMap = {};
        apiData.extras.forEach(extra => {
            const extraDate = new Date(extra.date);
            extraDate.setHours(0, 0, 0, 0);
            const extraDateString = formatDate(extraDate);
            if (!extraMap[extraDateString]) {
                extraMap[extraDateString] = {};
            }
            if (!extraMap[extraDateString][extra.name]) {
                extraMap[extraDateString][extra.name] = 0;
            }
            extraMap[extraDateString][extra.name] += extra.quantity;
        });

        apiData.customers.forEach(customer => {
            const customerStartDate = new Date(customer.startDate);
            customerStartDate.setHours(0, 0, 0, 0);

            newBaseDeliveryStatus[customer._id] = {
                name: customer.name,
                quantity: customer.quantity,
                days: {}
            };
            newCombinedQuantities[customer._id] = {
                name: customer.name,
                days: {}
            };
            newExtraSaleQuantitiesForDays[customer._id] = {
                name: customer.name,
                days: {}
            };

            for (let day = 1; day <= daysInMonth; day++) {
                const currentDate = new Date(selectedYear, selectedMonth, day);
                currentDate.setHours(0, 0, 0, 0);
                const currentDateString = formatDate(currentDate);

                const customerStarted = (currentDate >= customerStartDate);

                if (!customerStarted) {
                    newBaseDeliveryStatus[customer._id].days[day] = 'not-started';
                    newCombinedQuantities[customer._id].days[day] = '-';
                    newExtraSaleQuantitiesForDays[customer._id].days[day] = 0;
                    continue;
                }

                // If the current date is in the future, mark as 'future'
                if (currentDate > today) {
                    newBaseDeliveryStatus[customer._id].days[day] = 'future';
                    newCombinedQuantities[customer._id].days[day] = '-';
                    newExtraSaleQuantitiesForDays[customer._id].days[day] = 0;
                    continue;
                }

                const isUndelivered = undeliveredMap[customer.name]?.has(currentDateString);
                const status = isUndelivered ? 'undelivered' : 'delivered';
                newBaseDeliveryStatus[customer._id].days[day] = status;

                const extraForCustomerOnDay = extraMap[currentDateString]?.[customer.name] || 0;
                newExtraSaleQuantitiesForDays[customer._id].days[day] = extraForCustomerOnDay;

                let totalQuantityForDay = 0;
                if (status === 'delivered') {
                    totalQuantityForDay += customer.quantity;
                }
                totalQuantityForDay += extraForCustomerOnDay;

                newCombinedQuantities[customer._id].days[day] = totalQuantityForDay;
            }
        });

        setBaseDeliveryStatus(newBaseDeliveryStatus);
        setDailyCombinedQuantities(newCombinedQuantities);
        setExtraSaleQuantitiesForDays(newExtraSaleQuantitiesForDays);
    };

    const handleMonthChange = (e) => {
        const selectedOption = monthOptions.find(opt => opt.value.toString() === e.target.value);
        if (selectedOption) {
            setSelectedMonth(selectedOption.value);
            setSelectedYear(selectedOption.year);
        }
    };

    const filteredCustomers = useMemo(() => {
        return apiData.customers.filter(customer => {
            const customerBaseStatus = baseDeliveryStatus[customer._id];
            const customerCombinedQty = dailyCombinedQuantities[customer._id];

            if (!customerBaseStatus || !customerCombinedQty) {
                // If data for this customer hasn't been generated yet for the selected month,
                // or if there's an issue, default to not showing them.
                return false;
            }

            // A customer should be shown if they have any activity (delivery or extra sale)
            // within the currently selected month, for days up to 'today'.
            const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let hasActivityInSelectedMonth = false;
            for (let day = 1; day <= daysInSelectedMonth; day++) {
                const currentDate = new Date(selectedYear, selectedMonth, day);
                currentDate.setHours(0, 0, 0, 0);

                // Only consider days up to or before today
                if (currentDate > today) continue;

                const status = customerBaseStatus.days[day];
                const extraQuantity = extraSaleQuantitiesForDays[customer._id]?.days[day] || 0;

                // If base delivery was "delivered" OR if there was any extra sale quantity
                if (status === 'delivered' || extraQuantity > 0) {
                    hasActivityInSelectedMonth = true;
                    break;
                }
            }
            return hasActivityInSelectedMonth;
        }).sort((a, b) => a.name.localeCompare(b.name)); // Sort customers alphabetically
    }, [apiData.customers, baseDeliveryStatus, dailyCombinedQuantities, extraSaleQuantitiesForDays, selectedMonth, selectedYear]);


    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Navbar />
                <div className="p-4 md:p-8 max-w-7xl mx-auto"> {/* Centered loading state */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-8 w-64 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-10 w-40 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm h-96 animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar pathname1={pathname1} />
            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Delivery Records</h1>
                        <p className="text-gray-500 mt-2 text-sm md:text-base">Track daily delivery status for all customers</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <FiCalendar className="text-gray-500" />
                            <select
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className="appearance-none bg-transparent pr-8 py-1 text-gray-700 focus:outline-none cursor-pointer w-full" // w-full for mobile
                            >
                                {monthOptions.map((option) => (
                                    <option key={`${option.year}-${option.value}`} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown className="text-gray-500 ml-auto" />
                        </div>
                    </div>
                </div>

                {filteredCustomers.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto"> {/* This handles horizontal scrolling for the table */}
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[200px] sm:min-w-[250px]"> {/* Adjusted min-width for better mobile */}
                                            Customer
                                        </th>
                                        {daysArray.map(day => (
                                            <th key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 text-gray-700 text-xs sm:text-sm"> {/* Smaller day circle on mobile */}
                                                    {day}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCustomers.map(customer => (
                                        <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-medium shadow-inner text-sm sm:text-base"> {/* Adjusted avatar size */}
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 text-sm sm:text-base">{customer.name}</div> {/* Adjusted text size */}
                                                        <div className="text-xs text-gray-500">Since {new Date(customer.startDate).toLocaleDateString("en-IN")}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {daysArray.map(day => {
                                                const currentDayBaseStatus = baseDeliveryStatus[customer._id]?.days[day] || 'not-started';
                                                const quantityToDisplay = dailyCombinedQuantities[customer._id]?.days[day];
                                                const extraQuantityForThisDay = extraSaleQuantitiesForDays[customer._id]?.days[day] || 0;
                                                const dateForToggle = new Date(selectedYear, selectedMonth, day).toISOString();

                                                return (
                                                    <td key={`${customer._id}-${day}`} className="px-1 py-4 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <DeliveryStatusComponent
                                                                currentDayStatus={currentDayBaseStatus}
                                                                displayQuantity={quantityToDisplay}
                                                                customer={{
                                                                    _id: customer._id,
                                                                    name: customer.name,
                                                                }}
                                                                customerBaseQuantity={customer.quantity}
                                                                extraSaleQuantityForDay={extraQuantityForThisDay}
                                                                dateForToggle={dateForToggle}
                                                                ownerEmail={session?.user?.email}
                                                                onChangeStatus={fetchData}
                                                            />
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 text-center">
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"> {/* Adjusted icon container size */}
                                <FiUsers className="text-gray-400 text-2xl sm:text-3xl" /> {/* Adjusted icon size */}
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                                {apiData.customers.length === 0 ? "No customers found" : "No deliveries found"}
                            </h3>
                            <p className="text-gray-500 max-w-xs sm:max-w-md text-sm sm:text-base"> {/* Adjusted text size and max-width */}
                                {apiData.customers.length === 0
                                    ? "You don't have any customers yet. Add customers to track deliveries."
                                    : "No customers had deliveries in the selected month. Try selecting a different month."}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm"> {/* Adjusted legend text size */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-50 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-green-700 text-xs">Q</span> {/* Smaller Q */}
                        </div>
                        <span className="text-gray-600">Delivered (Base + Extra)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-yellow-50 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-yellow-700 text-xs">Q</span> {/* Smaller Q */}
                        </div>
                        <span className="text-gray-600">Extra Sale Only (Base Not Delivered)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-50 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-red-700 text-xs">0</span> {/* Smaller 0 */}
                        </div>
                        <span className="text-gray-600">Not Delivered (No Extra Sale)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all">
                        <span className="text-gray-300 text-lg sm:text-xl leading-none">-</span> {/* Adjusted size for '-' */}
                        <span className="text-gray-600">Not Started / Future</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Monthlydata;