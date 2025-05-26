'use client';
import Navbar from '../components/Navbar';
import { useSession, signIn, signOut } from "next-auth/react";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const Page = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { data: session, status } = useSession();

   

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
            console.log("Customer Data:", data);

            if (result.success) {
                setSubmitSuccess(true);
                reset();
                toast.success("Customer added successfully!");
            } else {
                toast.error(result.message || "Failed to add customer.");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
            console.error("Error adding customer:", error);
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-md mx-auto"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">Add New Customer</h2>
                        <p className="mt-2 text-sm text-gray-600">Fill in the details below to register a new customer</p>
                    </div>

                    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    {...register("name", { required: "Name is required" })}
                                   
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none focus:ring-2`}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    {...register("phone", {
                                        required: "Phone number is required",
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: "Please enter a valid 10-digit phone number"
                                        }
                                    })}
                                    
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none focus:ring-2`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity (L)
                                    </label>
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
                                        
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.quantity ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none focus:ring-2`}
                                    />
                                    {errors.quantity && (
                                        <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="pricePerLitre" className="block text-sm font-medium text-gray-700 mb-1">
                                        Price/Litre (₹)
                                    </label>
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
                                       
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.pricePerLitre ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none focus:ring-2`}
                                    />
                                    {errors.pricePerLitre && (
                                        <p className="mt-1 text-sm text-red-600">{errors.pricePerLitre.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        id="startDate"
                                        type='date'
                                        {...register("startDate", { required: true , message:"This field is required" })}

                                        className={`w-full px-4 py-3 rounded-lg border ${errors.startDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none focus:ring-2`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : 'Add Customer'}
                                </button>
                            </div>

                            {submitSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 text-sm text-green-700 bg-green-50 rounded-lg"
                                >
                                    Customer added successfully!
                                </motion.div>
                            )}
                        </form>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default Page;
