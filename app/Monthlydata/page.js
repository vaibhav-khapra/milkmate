'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';
import { FiChevronDown, FiCheck, FiX, FiCalendar } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import DeliveryStatusComponent from '../components/DeliveryStatusComponent';
import { useRouter } from 'next/navigation';

const Monthlydata = () => {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [deliveryData, setDeliveryData] = useState({});
    const [apiData, setApiData] = useState({ customers: [], undelivered: [] });

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
                year: year,
                label: new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })
            });
        }

        return options;
    };

    const monthOptions = getMonthOptions();
    const router = useRouter()

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status]);
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push("/")
        }
    }, [status]);

    useEffect(() => {
        if (apiData.customers.length > 0) {
            generateDeliveryData();
        }
    }, [apiData, selectedMonth, selectedYear]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/allcustomer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ownerEmail: session?.user?.email }),
            });

            const data = await res.json();

            if (data.success) {
                setApiData({
                    customers: data.customers,
                    undelivered: data.undelivered
                });
            } else {
                toast.error(data.message || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Something went wrong while fetching data');
        } finally {
            setLoading(false);
        }
    };

    const generateDeliveryData = () => {
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
                days: {}
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
                data[customer._id].days[day] = isUndelivered ? 'undelivered' : 'delivered';
            }
        });

        setDeliveryData(data);
    };

    const handleMonthChange = (e) => {
        const selectedOption = monthOptions.find(opt => opt.value.toString() === e.target.value);
        setSelectedMonth(selectedOption.value);
        setSelectedYear(selectedOption.year);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Navbar />
                <div className="p-4 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-8 w-64 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-10 w-40 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm h-96 animate-pulse"></div>
                </div>
            </div>
        );
    }

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />
            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Delivery Records</h1>
                        <p className="text-gray-500 mt-2">Track daily delivery status for all customers</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                            <FiChevronDown className="text-gray-500 ml-auto" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[250px]">
                                        Customer
                                    </th>
                                    {daysArray.map(day => (
                                        <th key={day} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700">
                                                {day}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y  divide-gray-200">
                                {apiData.customers.map(customer => (
                                    <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-medium shadow-inner">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{customer.name}</div>
                                                    <div className="text-xs text-gray-500">Since {new Date(customer.startDate).toLocaleDateString("en-IN")}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {daysArray.map(day => {
                                            const status = deliveryData[customer._id]?.days[day] || 'not-started';

                                            if (status === 'not-started' || status === 'future') {
                                                return (
                                                    <td key={`${customer._id}-${day}`} className="px-1 py-4 text-center">
                                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${status === 'future' ? 'text-gray-200' : 'text-gray-300'}`}>
                                                            -
                                                        </span>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td key={`${customer._id}-${day}`} className="px-1 py-4 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <DeliveryStatusComponent
                                                            status={status}
                                                            customer={{
                                                                name: customer.name,
                                                                ownerEmail: session?.user?.email,
                                                                dateNotDelivered: new Date(selectedYear, selectedMonth, day).toISOString()
                                                            }}
                                                            onChangeStatus={(newStatus) => {
                                                                setDeliveryData(prev => {
                                                                    const updated = { ...prev };
                                                                    if (updated[customer._id]) {
                                                                        updated[customer._id].days[day] = newStatus;
                                                                    }
                                                                    return updated;
                                                                });
                                                            }}
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

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all">
                        <div className="w-4 h-4 bg-green-50 rounded-full flex items-center justify-center">
                            <FiCheck className="text-green-500 text-xs" />
                        </div>
                        <span className="text-gray-600">Delivered</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all">
                        <div className="w-4 h-4 bg-red-50 rounded-full flex items-center justify-center">
                            <FiX className="text-red-500 text-xs" />
                        </div>
                        <span className="text-gray-600">Not Delivered</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all">
                        <span className="text-gray-300">-</span>
                        <span className="text-gray-600">Not Started</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-all">
                        <span className="text-gray-200">-</span>
                        <span className="text-gray-600">Future Date</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Monthlydata;