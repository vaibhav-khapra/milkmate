'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiTrash2, FiEdit2, FiAlertTriangle, FiCalendar, FiUser, FiDroplet, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function AdditionalSale({ customers, month }) {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [extra, setExtra] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingSale, setEditingSale] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const salesPerPage = 5;

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/sales/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setExtra(prev => prev.filter(sale => sale._id !== id));
                toast.success('Sale deleted successfully', {
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    }
                });
            } else {
                throw new Error('Failed to delete sale');
            }
        } catch (err) {
            toast.error('Error deleting sale. Please try again.', {
                position: 'top-center'
            });
            console.error("Error deleting sale:", err);
        }
    };

    const confirmDelete = (id) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                bg-white p-4 rounded-lg shadow-lg border border-red-100`}>
                <div className="flex items-start gap-3">
                    <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-medium text-gray-900">Confirm Deletion</h3>
                        <p className="text-sm text-gray-500 mt-1">Are you sure you want to delete this sale?</p>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleDelete(id);
                                    toast.dismiss(t.id);
                                }}
                                className="px-3 py-1.5 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ), {
            position: 'top-center',
            duration: 5000
        });
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchSales();
        }
    }, [status, month]); // Add month to dependency array

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/extra-sale/recent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ownerEmail: session?.user?.email,
                    month: month // Pass the selected month to the API
                }),
            });

            const data = await res.json();

            if (data.success) {
                // Sort sales by date (newest first)
                const sortedSales = data.extra.sort((a, b) => new Date(b.date) - new Date(a.date));
                setExtra(sortedSales);
            } else {
                toast.error(data.message || 'Failed to fetch sales');
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
            toast.error('Something went wrong while fetching sales');
        } finally {
            setIsLoading(false);
        }
    };

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            name: '',
            quantity: '',
        },
    });

    const onSubmit = async (data) => {
        try {
            const endpoint = editingSale ? `/api/sales/${editingSale._id}` : '/api/extra-sale';
            const method = editingSale ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    ownerEmail: session?.user?.email,
                    quantity: parseFloat(data.quantity),
                }),
            });

            const result = await res.json();
            if (result.success) {
                toast.success(editingSale ? 'Sale updated successfully!' : 'Sale recorded successfully!', {
                    position: 'top-center',
                });
                reset();
                setIsOpen(false);
                setEditingSale(null);
                fetchSales();
                setCurrentPage(1); // Reset to first page after adding/editing
            } else {
                throw new Error(result.message || 'Error saving sale');
            }
        } catch (err) {
            toast.error(err.message || 'Something went wrong. Please try again.', {
                position: 'top-center',
            });
            console.error(err);
        }
    };

    const handleEdit = (sale) => {
        setEditingSale(sale);
        setValue('name', sale.name);
        setValue('quantity', sale.quantity);
        setValue('date', new Date(sale.date).toISOString().split('T')[0]);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setEditingSale(null);
        reset();
    };

    // Filter sales by selected month (client-side fallback)
    const filteredSales = extra.filter(sale => {
        if (month === undefined) return true;
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === month;
    });

    // Pagination logic
    const indexOfLastSale = currentPage * salesPerPage;
    const indexOfFirstSale = indexOfLastSale - salesPerPage;
    const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
    const totalPages = Math.ceil(filteredSales.length / salesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Get month name for display
    const monthName = month !== undefined
        ? new Date(0, month).toLocaleString('default', { month: 'long' })
        : 'All';

    return (
        <div className="p-6 mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Additional Sales</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {month !== undefined
                            ? `Showing sales for ${monthName}`
                            : 'Track one-time sales outside regular deliveries'}
                    </p>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                    <FiPlus className="text-lg" />
                    Add New Sale
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : filteredSales.length > 0 ? (
                <div className="space-y-4">
                    <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentSales.map((sale) => (
                                        <tr key={sale._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <FiDroplet className="text-blue-500" />
                                                    {sale.quantity} kg
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <FiCalendar className="text-blue-500" />
                                                    {new Date(sale.date).toLocaleDateString("en-IN")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(sale)}
                                                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded-full hover:bg-blue-50"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(sale._id)}
                                                        className="text-red-600 hover:text-red-900 p-1.5 rounded-full hover:bg-red-50"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination controls */}
                    {filteredSales.length > salesPerPage && (
                        <div className="flex items-center justify-between px-2 py-3">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-medium">{indexOfFirstSale + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(indexOfLastSale, filteredSales.length)}
                                </span>{' '}
                                of <span className="font-medium">{filteredSales.length}</span> sales
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-md border ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                                >
                                    <FiChevronLeft />
                                </button>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-md border ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FiDroplet className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No additional sales</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {month !== undefined
                            ? `No sales found for ${monthName}`
                            : 'Get started by adding a new sale.'}
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                            Add Sale
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editingSale ? 'Edit Sale' : 'Record New Sale'}
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <FiX className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <FiUser className="text-gray-400" />
                                        Customer
                                    </label>
                                    <select
                                        {...register('name', { required: 'Customer is required' })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    >
                                        <option value="">Select Customer</option>
                                        {customers.map((cust) => (
                                            <option key={cust._id} value={cust.name}>
                                                {cust.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <FiDroplet className="text-gray-400" />
                                        Quantity (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        {...register('quantity', {
                                            required: 'Quantity is required',
                                            min: { value: 0.01, message: 'Must be greater than 0' }
                                        })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="0.00"
                                    />
                                    {errors.quantity && (
                                        <p className="mt-1 text-sm text-red-500">{errors.quantity.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <FiCalendar className="text-gray-400" />
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        {...register('date', { required: 'Date is required' })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                    {errors.date && (
                                        <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {editingSale ? 'Updating...' : 'Saving...'}
                                            </>
                                        ) : (
                                            editingSale ? 'Update Sale' : 'Save Sale'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}