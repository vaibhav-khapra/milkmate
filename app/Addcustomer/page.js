'use client';
import Navbar from '../components/Navbar';
import { useSession, signIn, signOut } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiUser, FiPhone, FiDroplet, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { usePathname } from 'next/navigation';


const Page = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { data: session, status } = useSession();
    const pathname1 = usePathname();
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const userEmail = session?.user?.email;

            const payload = {
                ...data,
                ownerEmail: userEmail,
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

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        rotate: {
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "linear"
                        },
                        scale: {
                            repeat: Infinity,
                            duration: 1,
                            repeatType: "reverse"
                        }
                    }}
                    className="h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent"
                />
            </div>
        );
    }

    return (
        <>
            <Navbar pathname1={pathname1} />
            <div className="min-h-[88vh] bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-md mx-auto"
                >
                    <div className="text-center mb-8">
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl font-extrabold text-gray-900"
                        >
                            Add New Customer
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-2 text-sm text-gray-600"
                        >
                            Fill in the details below to register a new customer
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="bg-white shadow-xl rounded-xl overflow-hidden"
                    >
                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FiUser className="mr-2 text-blue-500" />
                                        Full Name
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        id="name"
                                        {...register("name", { required: "Name is required" })}
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none focus:ring-2 transition-all duration-200`}
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
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FiPhone className="mr-2 text-blue-500" />
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
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none focus:ring-2 transition-all duration-200`}
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
                            </motion.div>

                            <motion.div
                                className="grid grid-cols-2 gap-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center">
                                            <FiDroplet className="mr-2 text-blue-500" />
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
                                                    message: "Quantity must be at least 0.1 litres"
                                                }
                                            })}
                                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.quantity ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none focus:ring-2 transition-all duration-200`}
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
                                    <label htmlFor="pricePerLitre" className="block text-sm font-medium text-gray-700 mb-1">
                                        <div className="flex items-center">
                                            <FiDollarSign className="mr-2 text-blue-500" />
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
                                            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.pricePerLitre ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none focus:ring-2 transition-all duration-200`}
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
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FiCalendar className="mr-2 text-blue-500" />
                                        Start Date
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        id="startDate"
                                        type='date'
                                        {...register("startDate", { required: "Start date is required" })}
                                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.startDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none focus:ring-2 transition-all duration-200`}
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
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${isSubmitting ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-md'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                            </motion.div>
                        </form>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
};

export default Page;