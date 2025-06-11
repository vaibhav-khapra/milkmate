"use client";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import AddSaleModal from '../components/AddSaleModal';
import 'react-loading-skeleton/dist/skeleton.css';
import {
    FiRefreshCw,
    FiEdit2,
    FiTrash2,
    FiUser,
    FiPhone,
    FiDroplet,
    FiDollarSign,
    FiCalendar,
    FiX,
    FiMail,
    FiChevronLeft,
    FiPlusCircle,
    FiInfo,
    FiUsers,
    FiPlus,
    FiBarChart2,
    FiFileText,
    FiHome
} from 'react-icons/fi';
import EditModal from '../components/EditModal';
import DeleteModal from '../components/DeleteModal';
import AddCustomerModal from '../components/AddCustomerModal';
import ViewBill from '../components/ViewBill';
import Monthlydata from '../components/Monthlydata';
import SummaryCards from './Summary';

export default function ViewDetail({ owner, onClose }) {
    const [ownerData, setOwnerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [viewAllCustomers, setViewAllCustomers] = useState(false);
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [Showviewbill, setShowviewbill] = useState(false)
    const [activeTab, setActiveTab] = useState('owner');
    const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
    const [selectedCustomerForSale, setSelectedCustomerForSale] = useState(null);

    const fetchOwnerDetails = async () => {
        try {
            const response = await fetch(`/api/owner/specific?owner=${encodeURIComponent(owner)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch owner: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                setOwnerData(data.owners);
            } else {
                setError(data.message || 'Failed to fetch owner');
            }
        } catch (err) {
            console.error("Error fetching owner:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        if (!owner) return;

        try {
            const res = await fetch('/api/allcustomer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ownerEmail: owner }),
            });

            const data = await res.json();
            if (data.success) {
                setCustomers(data.customers);
            } else {
                console.error(data.message || 'Failed to fetch customers');
                setError(data.message || 'Failed to fetch customers');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchOwnerDetails();
        fetchCustomers();
    }, [owner]);

    const customersCount = customers.length;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    

    const openAdditionalSaleModal = (customer) => {
        setSelectedCustomerForSale(customer);
        setIsAddSaleOpen(true);
    };

    const handleSaveAdditionalSale = async (saleData) => {
        try {
            const response = await fetch('/api/extra-sale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...saleData,
                    ownerEmail: owner,
                    customerId: selectedCustomerForSale._id,
                    quantity: parseFloat(saleData.quantity),
                }),
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Additional sale recorded successfully!', {
                    position: 'top-center',
                });
                fetchCustomers();
                return true;
            } else {
                throw new Error(result.message || 'Error saving additional sale');
            }
        } catch (err) {
            toast.error(err.message || 'Something went wrong. Please try again.', {
                position: 'top-center',
            });
            console.error(err);
            return false;
        }
    };

    const openEditModal = (customer) => {
        setSelectedCustomer(customer);
        setIsEditOpen(true);
    };

    const openDeleteModal = (customer) => {
        setSelectedCustomer(customer);
        setIsDeleteOpen(true);
    };

    const handleCustomerAction = () => {
        setIsEditOpen(false);
        setIsDeleteOpen(false);
        fetchCustomers();
        toast.success("Customer data updated!");
    };

    const handleAddCustomerSuccess = () => {
        setShowAddCustomer(false);
        fetchCustomers();
        setActiveTab('customers');
        toast.success("Customer added successfully!");
    };

    const handlebillSuccess = () => {
        setShowviewbill(false);
        fetchCustomers();
    };

    const renderOwnerView = () => (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white relative">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold">Owner Profile</h2>
                        <p className="text-blue-100 text-sm mt-1">Detailed information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-white/10"
                        aria-label="Close"
                    >
                        <FiX size={24} />
                    </button>
                </div>
            </div>

            <div className="p-6 flex-grow overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center py-12 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="text-gray-600">Loading owner details...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg">
                        <div className="flex items-start">
                            <FiInfo className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                                <button
                                    onClick={() => { setLoading(true); setError(null); fetchOwnerDetails(); fetchCustomers(); }}
                                    className="mt-2 inline-flex items-center text-sm font-medium text-red-700 hover:text-red-900"
                                >
                                    <FiRefreshCw className="mr-1.5 h-4 w-4" /> Retry
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex-shrink-0">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    {ownerData?.name?.charAt(0)?.toUpperCase() || 'O'}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{ownerData?.name || 'N/A'}</h3>
                                <p className="text-blue-600 flex items-center gap-1.5 mt-1 text-sm">
                                    <FiMail size={14} />
                                    {ownerData?.email || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</p>
                                <p className="text-gray-900 font-medium flex items-center gap-1.5 mt-1">
                                    <FiCalendar size={14} />
                                    {ownerData?.date
                                        ? new Date(ownerData.date).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })
                                        : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-2xl font-bold text-blue-600">{customersCount}</span>
                                    <button
                                        onClick={() => setActiveTab('customers')}
                                        className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                                    >
                                        <FiUsers size={12} /> View
                                    </button>
                                </div>
                            </div>
                        </div>

                        {customers.length > 0 && (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Recent Customers</h4>
                                    {customers.length > 3 && (
                                        <button
                                            onClick={() => setActiveTab('customers')}
                                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            View all
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {customers.slice(0, 3).map(customer => (
                                        <div key={customer._id} className="p-3 bg-white rounded-lg border border-gray-100 shadow-xs hover:shadow-sm transition-shadow flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800">{customer.name}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <FiPhone size={12} />
                                                    {customer.phoneno}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-blue-600 font-semibold">₹{customer.price?.toLocaleString() || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{customer.quantity} Ltr.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                    Close
                </button>
                <button
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    onClick={() => {
                        if (ownerData?.email) {
                            window.location.href = `mailto:${ownerData.email}`;
                        } else {
                            toast.error("Owner email not available.");
                        }
                    }}
                >
                    <FiMail size={16} />
                    Contact
                </button>
            </div>
        </div>
    );

    const renderCustomersView = () => (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex items-center justify-between  z-10">
                <button
                    onClick={() => setActiveTab('owner')}
                    className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
                >
                    <FiChevronLeft size={20} />
                    <span className="hidden sm:inline">Back</span>
                </button>
                <h2 className="text-xl font-bold text-center">
                    {ownerData?.name || 'Owner'}'s Customers
                </h2>
                <button
                    onClick={onClose}
                    className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-white/10"
                    aria-label="Close"
                >
                    <FiX size={24} />
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-gray-50 border-b border-gray-100 z-10">
                <button
                    onClick={() => setActiveTab('addCustomer')}
                    className="flex flex-col items-center p-2 bg-white rounded-lg shadow-xs hover:shadow-sm transition-all"
                >
                    <FiPlusCircle className="text-blue-600 mb-1" size={18} />
                    <span className="text-xs font-medium">Add Customer</span>
                </button>
                <button
                    onClick={() => setActiveTab('ViewBill')}
                    className="flex flex-col items-center p-2 bg-white rounded-lg shadow-xs hover:shadow-sm transition-all"
                >
                    <FiFileText className="text-green-600 mb-1" size={18} />
                    <span className="text-xs font-medium">View Bills</span>
                </button>
                <button
                    onClick={() => setActiveTab('ViewSummary')}
                    className="flex flex-col items-center p-2 bg-white rounded-lg shadow-xs hover:shadow-sm transition-all"
                >
                    <FiBarChart2 className="text-yellow-600 mb-1" size={18} />
                    <span className="text-xs font-medium">Summary</span>
                </button>
                <button
                    onClick={() => setActiveTab('MonthlyData')}
                    className="flex flex-col items-center p-2 bg-white rounded-lg shadow-xs hover:shadow-sm transition-all"
                >
                    <FiCalendar className="text-purple-600 mb-1" size={18} />
                    <span className="text-xs font-medium">Monthly Data</span>
                </button>
            </div>

            <div className="p-4 flex-grow overflow-y-auto">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse h-32"></div>
                        ))}
                    </div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <FiUsers className="text-blue-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No customers found</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">Add new customers to start managing their water deliveries</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setActiveTab('addCustomer')}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <FiPlusCircle size={16} />
                                Add Customer
                            </button>
                            <button
                                onClick={() => { setLoading(true); setError(null); fetchCustomers(); }}
                                className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
                            >
                                <FiRefreshCw size={16} />
                                Refresh
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customers.map((customer) => (
                            <div
                                key={customer._id}
                                className={`p-4 rounded-lg border ${customer.isDelivered ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
                                    } shadow-xs hover:shadow-sm transition-shadow`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">{customer.name}</h3>
                                        <p className="text-sm text-gray-600 truncate">{customer.phoneno}</p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${customer.isDelivered ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                            } whitespace-nowrap`}
                                    >
                                        {customer.isDelivered ? 'Delivered' : 'Pending'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <FiDroplet size={14} className="text-gray-500" />
                                        <span>{customer.quantity} Ltr.</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <FiDollarSign size={14} className="text-gray-500" />
                                        <span>₹{customer.price?.toLocaleString() || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-3">
                                    <button
                                        onClick={() => openEditModal(customer)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        aria-label="Edit"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(customer)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        aria-label="Delete"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => openAdditionalSaleModal(customer)}
                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                        aria-label="Add Sale"
                                    >
                                        <FiPlus size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start p-4 z-50 overflow-y-auto ">
            <div className="w-full flex items-center justify-center ">
                {activeTab === 'owner' && renderOwnerView()}
                {activeTab === 'customers' && renderCustomersView()}
                {activeTab === 'addCustomer' && (
                    <AddCustomerModal
                        ownerEmail={owner}
                        onClose={() => setActiveTab('customers')}
                        onSuccess={handleAddCustomerSuccess}
                    />
                )}
                {activeTab === 'ViewBill' && (
                    <ViewBill
                        ownerEmail={owner}
                        onClose={() => setActiveTab('customers')}
                        onSuccess={handlebillSuccess}
                    />
                )}
                {activeTab === 'MonthlyData' && (
                    <Monthlydata
                        ownerEmail={owner}
                        onClose={() => setActiveTab('customers')}
                    />
                )}
                {activeTab === 'ViewSummary' && (
                    <SummaryCards
                        ownerEmail={owner}
                        onClose={() => setActiveTab('customers')}
                    />
                )}
            </div>

            {isEditOpen && selectedCustomer && (
                <EditModal
                    customer={selectedCustomer}
                    onClose={() => setIsEditOpen(false)}
                    onSave={handleCustomerAction}
                />
            )}

            {isDeleteOpen && selectedCustomer && (
                <DeleteModal
                    customer={selectedCustomer}
                    onClose={() => setIsDeleteOpen(false)}
                    onDelete={handleAddCustomerSuccess}
                />
            )}

            {isAddSaleOpen && selectedCustomerForSale && (
                <AddSaleModal
                    isOpen={isAddSaleOpen}
                    onClose={() => {
                        setIsAddSaleOpen(false);
                        setSelectedCustomerForSale(null);
                    }}
                    customers={[selectedCustomerForSale]}
                    onSave={handleSaveAdditionalSale}
                    session={{ user: { email: owner } }}
                />
            )}
        </div>
    );
}