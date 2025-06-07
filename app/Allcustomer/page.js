'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import Navbar from '../components/Navbar'
import 'react-loading-skeleton/dist/skeleton.css'
import { useRouter } from 'next/navigation'
import EditModal from '../components/EditModal'
import DeleteModal from '../components/DeleteModal'
import { FiRefreshCw, FiEdit2, FiTrash2, FiUser, FiPhone, FiDroplet, FiDollarSign, FiCalendar } from 'react-icons/fi'

export default function CustomerList() {
    const { data: session, status } = useSession()
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState()
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const router = useRouter()
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/')
        }
    }, [status])

    useEffect(() => {
        if (status === 'authenticated') {
            fetchCustomers()
        }
    }, [status])

    const fetchCustomers = async () => {
        try {
            setRefreshing(true)
            const res = await fetch('/api/allcustomer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ownerEmail: session?.user?.email }),
            })

            const data = await res.json();
            console.log(data.customers);

            if (data.success) {
                setCustomers(data.customers)
            } else {
                toast.error(data.message || 'Failed to fetch customers')
            }
        } catch (error) {
            console.error('Error fetching customers:', error)
            toast.error('Something went wrong while fetching customers')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
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

    const openEditModal = (customer) => {
        setSelectedCustomer(customer)
        setIsEditOpen(true)
    }

    const openDeleteModal = (customer) => {
        setSelectedCustomer(customer)
        setIsDeleteOpen(true)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="p-4 md:p-8 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold text-gray-800">Customer List</h2>
                    <button
                        onClick={fetchCustomers}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors shadow-sm"
                    >
                        <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {loading ? (
                    <div className="grid gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-6 bg-white rounded-xl shadow-sm">
                                <Skeleton count={4} height={24} className="mb-3" />
                            </div>
                        ))}
                    </div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FiUser className="text-gray-400 text-3xl" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No customers found</h3>
                            <p className="text-gray-500 mb-6">Add your first customer to get started</p>
                            <button
                                onClick={fetchCustomers}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                            >
                                Refresh List
                            </button>
                        </div>
                    </div>
                ) : (
                            <div className="grid gap-4 md:gap-6">
                                {customers.map((customer) => (
                                    <div
                                        key={customer._id}
                                        className={`p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border ${customer.isDelivered
                                                ? 'bg-white border-gray-100'
                                                : 'bg-red-50 border-red-200'
                                            }`}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <FiUser className="text-gray-400" />
                                                    <p className="font-medium text-gray-900 text-lg">{customer.name}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <FiPhone className="text-gray-400" />
                                                    <p className="text-gray-600">{customer.phoneno}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <FiDroplet className="text-gray-400" />
                                                    <p>
                                                        <span className="font-medium">Quantity:</span> {customer.quantity} Ltr.
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <FiDollarSign className="text-gray-400" />
                                                    <p>
                                                        <span className="font-medium">Price:</span> ₹{customer.price.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <FiCalendar className="text-gray-400" />
                                                    <p>
                                                        <span className="font-medium">Start Date:</span> {formatDate(customer.startDate)}
                                                    </p>
                                                </div>
                                                <div className="flex justify-start md:justify-end gap-3 pt-2">
                                                    <button
                                                        onClick={() => openEditModal(customer)}
                                                        className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        <FiEdit2 size={16} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(customer)}
                                                        className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    >
                                                        <FiTrash2 size={16} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                
                )}
            </main>

            {isEditOpen && selectedCustomer && (
                <EditModal
                    customer={selectedCustomer}
                    onClose={() => setIsEditOpen(false)}
                    onSave={fetchCustomers}
                />
            )}

            {isDeleteOpen && selectedCustomer && (
                <DeleteModal
                    customer={selectedCustomer}
                    onClose={() => setIsDeleteOpen(false)}
                    onDelete={fetchCustomers}
                />
            )}
        </div>
    )
}