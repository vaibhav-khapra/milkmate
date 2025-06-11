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
    FiPlus
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
    const [activeTab, setActiveTab] = useState('owner'); // 'owner', 'customers', 'addCustomer', 'ViewBill', 'MonthlyData', 'ViewSummary'
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
                fetchCustomers(); // Refresh customer data
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
        <div className='fixed top-0 '>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white rounded-t-2xl relative shadow-md">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold font-display">Owner Profile</h2>
                        <p className="text-blue-200 text-sm">Detailed information about the owner</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-blue-100 transition-colors p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="Close"
                    >
                        <FiX size={24} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center py-12 gap-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                        <p className="text-gray-600 text-lg">Loading owner details...</p>
                        <Skeleton count={3} height={40} className="w-3/4" />
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border-l-4 border-red-500 p-5 mb-6 rounded-lg text-red-800">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <FiInfo className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold">Error loading data</h3>
                                <p className="text-sm mt-1">{error}</p>
                                <button
                                    onClick={() => { setLoading(true); setError(null); fetchOwnerDetails(); fetchCustomers(); }}
                                    className="mt-3 px-4 py-2 border border-red-400 rounded-md text-red-700 hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-1"
                                >
                                    <FiRefreshCw size={16} /> Retry
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-5 p-4 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                            <div className="flex-shrink-0">
                                <div className="h-20 w-20 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-3xl font-extrabold shadow-inner">
                                    {ownerData?.name?.charAt(0)?.toUpperCase() || 'O'}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 font-display">{ownerData?.name || 'N/A'}</h3>
                                <p className="text-blue-700 flex items-center gap-2 mt-1 text-base">
                                    <FiMail size={16} className="text-blue-500" />
                                    {ownerData?.email || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Date Joined</p>
                                    <p className="text-gray-900 font-semibold flex items-center gap-2">
                                        <FiCalendar size={16} className="text-gray-400" />
                                        {ownerData?.date
                                            ? new Date(ownerData.date).toLocaleDateString('en-IN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Total Customers</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-3xl font-bold text-blue-600">{customersCount}</span>
                                        <button
                                            onClick={() => setActiveTab('customers')}
                                            className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 transform hover:scale-105"
                                        >
                                            <FiUsers size={16} /> View All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {customers.length > 0 && (
                            <div>
                                <h4 className="text-xl font-semibold text-gray-800 mb-4 font-display">Recent Customers</h4>
                                <div className="space-y-4">
                                    {customers.slice(0, 3).map(customer => (
                                        <div key={customer._id} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-800 text-lg">{customer.name}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <FiPhone size={14} className="text-gray-400" />
                                                    {customer.phoneno}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-blue-600 font-bold text-lg">₹{customer.price?.toLocaleString() || 'N/A'}/Ltr.</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{customer.quantity} Ltr.</p>
                                            </div>
                                        </div>
                                    ))}
                                    {customers.length > 3 && (
                                        <button
                                            onClick={() => setActiveTab('customers')}
                                            className="w-full text-center py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                        >
                                            Show All {customersCount - 3} More Customers <FiChevronLeft size={14} className="rotate-180" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 rounded-b-2xl shadow-inner">
                <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors text-base font-medium flex items-center gap-2"
                >
                    Close
                </button>
                <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-base font-medium flex items-center gap-2 shadow-md"
                    onClick={() => {
                        if (ownerData?.email) {
                            window.location.href = `mailto:${ownerData.email}`;
                        } else {
                            toast.error("Owner email not available.");
                        }
                    }}
                >
                    <FiMail size={18} />
                    Contact Owner
                </button>
            </div>
        </div>
        </div>
    );

    const renderCustomersView = () => (
        <div className='fixed top-0 '>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col h-[90vh]">
            
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white rounded-t-2xl shadow-md flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={() => setActiveTab('owner')}
                    className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <FiChevronLeft size={24} />
                    <span className="hidden sm:inline">Back to Owner</span>
                </button>
                <h2 className="text-2xl font-bold font-display text-center flex-grow">
                    Customers for {ownerData?.name || 'N/A'}
                </h2>
                <button
                    onClick={onClose}
                    className="text-white hover:text-blue-100 transition-colors p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Close"
                >
                    <FiX size={24} />
                </button>
            </div>

            {/* Navigation Buttons - Made Sticky */}
            <div className='flex flex-wrap justify-center items-center gap-4 mb-6 p-4 bg-white border-b border-gray-100 sticky top-[80px] z-10'> {/* Adjusted top value based on header height */}
                <button
                    onClick={() => setActiveTab('addCustomer')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                >
                    <FiPlusCircle size={18} />
                    Add Customer
                </button>
                <button
                    onClick={() => setActiveTab('ViewBill')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                >
                    <FiDollarSign size={18} />
                    View Bills
                </button>
                <button
                    onClick={() => setActiveTab('ViewSummary')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-md flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                >
                    <FiDollarSign size={18} />
                    View Summary
                </button>
                <button
                    onClick={() => setActiveTab('MonthlyData')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                >
                    <FiCalendar size={18} />
                    Monthly Data
                </button>
            </div>

            {/* Customers List Content */}
            <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="p-6 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
                                <Skeleton count={4} height={20} className="mb-3" />
                                <Skeleton width={100} height={30} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {customers.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-md border border-gray-100">
                                <div className="max-w-md mx-auto">
                                    <div className="w-28 h-28 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                                        <FiUsers className="text-blue-400 text-5xl" />
                                    </div>
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-3 font-display">No customers found</h3>
                                    <p className="text-gray-600 mb-8 leading-relaxed">This owner doesn't have any customers yet. Add new customers to get started!</p>
                                    <button
                                        onClick={() => setActiveTab('addCustomer')}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-3 mx-auto text-base font-medium"
                                    >
                                        <FiPlusCircle size={18} />
                                        Add New Customer
                                    </button>
                                    <button
                                        onClick={() => { setLoading(true); setError(null); fetchCustomers(); }}
                                        className="mt-4 px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors shadow-md flex items-center gap-3 mx-auto text-base font-medium"
                                    >
                                        <FiRefreshCw size={18} />
                                        Refresh Customers
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {customers.map((customer) => (
                                    <div
                                        key={customer._id}
                                        className={`p-5 rounded-xl shadow-sm hover:shadow-lg transition-shadow border-t-4
                                            ${customer.isDelivered ? 'bg-white border-green-500' : 'bg-red-50 border-red-500'}
                                        `}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3">
                                                <FiUser className="text-gray-500 flex-shrink-0" size={18} />
                                                <p className="font-semibold text-gray-900 text-lg truncate">{customer.name}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiPhone className="text-gray-500 flex-shrink-0" size={18} />
                                                <p className="text-gray-700 text-base">{customer.phoneno}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiDroplet className="text-gray-500 flex-shrink-0" size={18} />
                                                <p className="text-gray-700 text-base">
                                                    <span className="font-medium">Quantity:</span> {customer.quantity} Ltr.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiDollarSign className="text-gray-500 flex-shrink-0" size={18} />
                                                <p className="text-gray-700 text-base">
                                                    <span className="font-medium">Price:</span> ₹{customer.price?.toLocaleString() || 'N/A'}/Ltr.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiCalendar className="text-gray-500 flex-shrink-0" size={18} />
                                                <p className="text-sm text-gray-600">
                                                    Added: {formatDate(customer.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
                                            <span className={`text-sm px-3 py-1.5 rounded-full font-semibold shadow-sm
                                                ${customer.isDelivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {customer.isDelivered ? 'Delivered' : 'Pending'}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(customer)}
                                                    className="p-2.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                    aria-label="Edit Customer"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(customer)}
                                                    className="p-2.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                                                    aria-label="Delete Customer"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openAdditionalSaleModal(customer)}
                                                    className="p-2.5 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                                    aria-label="Additional Sale"
                                                >
                                                    <FiPlus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in overflow-y-auto">
            {/* Main container that centers both modals */}
            <div className="w-full max-w-6xl flex justify-center items-start my-8">
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

            {/* Modals for Edit/Delete/Add Sale (these will float on top of the main view) */}
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
                    customers={[selectedCustomerForSale]} // Pass only the selected customer
                    onSave={handleSaveAdditionalSale}
                    session={{ user: { email: owner } }} // Mock session object
                />
            )}
        </div>
    );
}