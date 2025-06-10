import React from 'react';
import toast from 'react-hot-toast';

const CustomerDeliveryStatus = ({
    undeliveredCustomers,
    setUndeliveredCustomers, // For optimistic UI
    loading,
    setTogglingId,
    togglingId,
    fetchCustomers, // To refetch customer data
    session // To get ownerEmail
}) => {
    const handleCheckboxChange = async (customerId) => {
        setTogglingId(customerId);

        // Optimistic UI update
        setUndeliveredCustomers(prev =>
            prev.map(c =>
                c._id === customerId ? { ...c, isDelivered: !c.isDelivered } : c
            )
        );

        // Reset spinner shortly after toggle for better UX
        setTimeout(() => setTogglingId(null), 300);
    };

    const saveUndeliveredCustomers = async () => {
        if (!session?.user?.email) {
            toast.error("Owner email is missing. Please log in.");
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];

            const customersToSave = undeliveredCustomers.map(customer => ({
                name: customer.name,
                ownerEmail: session.user.email,
                isDelivered: customer.isDelivered,
                dateNotDelivered: today
            }));

            const res = await fetch('/api/saveUndelivered', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customersToSave }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Delivery status updated successfully');
                fetchCustomers(); // Refresh customers list
            } else {
                toast.error(data.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    return (
        <div className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Customer Delivery Status</h2>
                <button
                    onClick={saveUndeliveredCustomers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : 'Save Delivery Status'}
                </button>
            </div>

            {undeliveredCustomers.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <p className="text-gray-500">No customers found</p>
                </div>
            ) : (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {undeliveredCustomers.map(customer => (
                                <tr key={customer._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {togglingId === customer._id ? (
                                            <div className="w-11 h-6 flex items-center justify-center">
                                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={customer.isDelivered}
                                                    onChange={() => handleCheckboxChange(customer._id)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-700">
                                                    {customer.isDelivered ? 'Delivered' : 'Pending'}
                                                </span>
                                            </label>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CustomerDeliveryStatus;
