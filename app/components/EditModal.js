'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiX, FiUser, FiPhone, FiDroplet, FiDollarSign, FiTruck, FiStopCircle } from 'react-icons/fi'

export default function EditModal({ customer, onClose, onSave }) {
    const [formData, setFormData] = useState({ ...customer })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const toggleDelivery = async () => {
        setIsSubmitting(true);
        try {
            // 1. Update Customer's isDelivered status
            const res = await fetch('/api/updateCustomer', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    _id: customer._id,
                    isDelivered: !formData.isDelivered
                }),
            });

            const data = await res.json();
            if (data.success) {
                // 2. Call /api/saveUndelivered with the current customer data
                const undeliveredRes = await fetch('/api/saveUndelivered', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customersToSave: [
                            {
                                name: formData.name,
                                ownerEmail: customer.ownerEmail,  // make sure this is available in `customer`
                                dateNotDelivered: new Date().toISOString().split('T')[0], // or use a better formatted date if required
                                isDelivered: !formData.isDelivered
                            }
                        ]
                    }),
                });

                const undeliveredData = await undeliveredRes.json();
                if (!undeliveredData.success) {
                    toast.error('Delivery status updated, but failed to sync undelivered list.', {
                        position: 'top-center'
                    });
                }

                // 3. Show success toast
                toast.success(`Delivery ${formData.isDelivered ? 'stopped' : 'started'} successfully!`, {
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    }
                });

                // 4. Update UI state
                setFormData(prev => ({ ...prev, isDelivered: !prev.isDelivered }));
                onSave();
            } else {
                toast.error(data.message || 'Failed to update delivery status', {
                    position: 'top-center'
                });
            }
        } catch (err) {
            toast.error('Error updating delivery status. Please try again.', {
                position: 'top-center'
            });
            console.error('Delivery toggle error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/updateCustomer', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Customer updated successfully!', {
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    }
                })
                onSave()
                onClose()
            } else {
                toast.error(data.message || 'Failed to update customer', {
                    position: 'top-center'
                })
            }
        } catch (err) {
            toast.error('Error updating customer. Please try again.', {
                position: 'top-center'
            })
            console.error('Update error:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Edit Customer</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Customer Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiUser className="text-gray-400" />
                            </div>
                            <input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="phoneno" className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiPhone className="text-gray-400" />
                            </div>
                            <input
                                id="phoneno"
                                name="phoneno"
                                value={formData.phoneno}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="+91 9876543210"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                Quantity (Ltr.)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiDroplet className="text-gray-400" />
                                </div>
                                <input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0"
                                    min="0"
                                    step="0.1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                Price (₹)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiDollarSign className="text-gray-400" />
                                </div>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <button
                            type="button"
                            onClick={toggleDelivery}
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${formData.isDelivered
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'} 
                                transition-colors disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {formData.isDelivered ? (
                                <>
                                    <FiStopCircle /> Stop Delivery
                                </>
                            ) : (
                                <>
                                    <FiTruck /> Start Delivery
                                </>
                            )}
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}