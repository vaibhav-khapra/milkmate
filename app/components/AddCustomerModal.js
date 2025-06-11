'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiUser, FiPhone, FiDroplet, FiDollarSign, FiCalendar, FiX } from 'react-icons/fi';

const AddCustomerModal = ({ ownerEmail, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                ownerEmail: ownerEmail,
            };
            const response = await fetch("/api/addcustomer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (result.success) {
                reset();
                toast.success("Customer added successfully!", {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
                onSuccess(); // Call onSuccess prop
            } else {
                toast.error(result.message || "Failed to add customer.", {
                    position: "top-center"
                });
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.", {
                position: "top-center"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-gradient-to-br bg-opacity-75 flex items-center justify-center p-4 z-50"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto relative border border-gray-100"
                    variants={modalVariants}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        <FiX className="h-7 w-7" />
                    </button>
                    <div className="p-8">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">
                                Add New Customer
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Fill in the details below to register a new customer
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center">
                                        <FiUser className="mr-2 text-blue-600" />
                                        Full Name
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        id="name"
                                        {...register("name", { required: "Name is required" })}
                                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-600 focus:border-blue-600'} focus:outline-none focus:ring-2 transition-all duration-200`}
                                        placeholder="Vaibhav"
                                    />
                                    <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                                <AnimatePresence>
                                    {errors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-1 text-sm text-red-600"
                                        >
                                            {errors.name.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center">
                                        <FiPhone className="mr-2 text-blue-600" />
                                        Phone Number
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        id="phone"
                                        {...register("phone", {
                                            required: "Phone number is required",
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: "Please enter a valid 10-digit phone number"
                                            }
                                        })}
                                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-600 focus:border-blue-600'} focus:outline-none focus:ring-2 transition-all duration-200`}
                                        placeholder="9876543210"
                                    />
                                    <FiPhone className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                                <AnimatePresence>
                                    {errors.phone && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-1 text-sm text-red-600"
                                        >
                                            {errors.phone.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                        <div className="flex items-center">
                                            <FiDroplet className="mr-2 text-blue-600" />
                                            Quantity (L)
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="quantity"
                                            type="number"
                                            step="0.01"
                                            {...register("quantity", {
                                                required: "Quantity is required",
                                                min: {
                                                    value: 0.01,
                                                    message: "Quantity must be at least 0.01 litres"
                                                }
                                            })}
                                            className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${errors.quantity ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-600 focus:border-blue-600'} focus:outline-none focus:ring-2 transition-all duration-200`}
                                            placeholder="10.0"
                                        />
                                        <FiDroplet className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                    <AnimatePresence>
                                        {errors.quantity && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-1 text-sm text-red-600"
                                            >
                                                {errors.quantity.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div>
                                    <label htmlFor="pricePerLitre" className="block text-sm font-medium text-gray-700 mb-2">
                                        <div className="flex items-center">
                                            <FiDollarSign className="mr-2 text-blue-600" />
                                            Price/Litre (₹)
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="pricePerLitre"
                                            type="number"
                                            step="0.01"
                                            {...register("pricePerLitre", {
                                                required: "Price is required",
                                                min: {
                                                    value: 0.01,
                                                    message: "Price must be at least ₹0.01"
                                                }
                                            })}
                                            className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${errors.pricePerLitre ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-600 focus:border-blue-600'} focus:outline-none focus:ring-2 transition-all duration-200`}
                                            placeholder="50.00"
                                        />
                                        <FiDollarSign className="absolute left-3 top-3.5 text-gray-400" />
                                    </div>
                                    <AnimatePresence>
                                        {errors.pricePerLitre && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-1 text-sm text-red-600"
                                            >
                                                {errors.pricePerLitre.message}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center">
                                        <FiCalendar className="mr-2 text-blue-600" />
                                        Start Date
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        id="startDate"
                                        type='date'
                                        {...register("startDate", { required: "Start date is required" })}
                                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${errors.startDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-600 focus:border-blue-600'} focus:outline-none focus:ring-2 transition-all duration-200`}
                                    />
                                    <FiCalendar className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                                <AnimatePresence>
                                    {errors.startDate && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-1 text-sm text-red-600"
                                        >
                                            {errors.startDate.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all duration-300 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-lg'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <span className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Customer
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddCustomerModal;