'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiDroplet, FiCalendar } from 'react-icons/fi';

export default function AddSaleModal({
    isOpen,
    onClose,
    customers,
    editingSale,
    onSave,
    session
}) {
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

    // Set form values when editing or if only one customer exists
    useEffect(() => {
        if (editingSale) {
            setValue('name', editingSale.name);
            setValue('quantity', editingSale.quantity);
            setValue('date', new Date(editingSale.date).toISOString().split('T')[0]);
        } else {
            reset();
            // If only one customer, pre-select their name
            if (customers.length === 1) {
                setValue('name', customers[0].name);
            }
        }
    }, [editingSale, setValue, reset, customers]);

    const onSubmit = async (data) => {
        try {
            await onSave({
                ...data,
                quantity: parseFloat(data.quantity),
            });
            reset();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Something went wrong. Please try again.', {
                position: 'top-center',
            });
            console.error(err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br backdrop-blur-sm p-4"
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
                                onClick={onClose}
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
                                {customers.length === 1 ? (
                                    <input
                                        type="text"
                                        value={customers[0].name}
                                        readOnly
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed"
                                    />
                                ) : (
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
                                )}
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
                                    onClick={onClose}
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
    );
}