"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ViewDetail from './ViewDetail';

const AllOwnersModal = ({ owners, onClose, onViewDetail, onDelete }) => {
    return (
        <div>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">All Owners ({owners.length})</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-3xl font-semibold"
                    >
                        &times;
                    </button>
                </div>
                {owners.length === 0 ? (
                    <p className="text-gray-600">No owners to display.</p>
                ) : (
                    <div className="space-y-4">
                        {owners.map((owner) => (
                            <div
                                key={owner._id}
                                className="bg-gray-50 p-4 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{owner.name}</h3>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {new Date(owner.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-medium">Email:</span> {owner.email}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onViewDetail(owner.email)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => onDelete(owner.email)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default function OwnersPage() {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [opendetail, setopendetail] = useState(false);
    const [selectedowner, setselectedowner] = useState("");
    const [showAllOwnersModal, setShowAllOwnersModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const response = await fetch('/api/owner', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch owners: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.success) {
                    const sortedOwners = data.owners.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setOwners(sortedOwners);
                } else {
                    setError(data.message || 'Failed to fetch owners');
                }
            } catch (err) {
                console.error("Error fetching owners:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOwners();
    }, []);

    const router = useRouter();

    const handledelete = async (email) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this owner?");
        if (!confirmDelete) return;

        try {
            const res = await fetch('/api/deleteowner', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Owner deleted successfully', {
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    }
                });
                setOwners(prev => prev.filter(owner => owner.email !== email));
            } else {
                toast.error(data.message || 'Failed to delete owner', {
                    position: 'top-center'
                });
            }
        } catch (err) {
            toast.error('Error deleting owner. Please try again.', {
                position: 'top-center'
            });
            console.error('Delete error:', err);
        }
    };

    const handleview = (email) => {
        setopendetail(true);
        setselectedowner(email);
    };

    const handleShowAllClick = () => {
        setShowAllOwnersModal(true);
    };

    const handleCloseAllOwnersModal = () => {
        setShowAllOwnersModal(false);
    };

    const filteredOwners = owners.filter(owner =>
        owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const recentOwners = filteredOwners.slice(0, 3);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg text-gray-700">Loading owners...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Owners</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800">All Owners</h1>
                        <p className="text-gray-600 mt-2">Manage all property owners in the system</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search owners..."
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {filteredOwners.length > 0 && (
                            <button
                                onClick={handleShowAllClick}
                                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200 whitespace-nowrap"
                            >
                                View All ({filteredOwners.length})
                            </button>
                        )}
                    </div>
                </div>

                {filteredOwners.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Owners Found</h3>
                        <p className="text-gray-500 mb-4">{searchTerm ? "Try a different search term" : "No owners have been added yet"}</p>
                        <Link href="/add-owner" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200">
                            Add New Owner
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Owners</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recentOwners.map((owner) => (
                                    <div
                                        key={owner._id}
                                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center font-semibold">
                                                {owner.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{owner.name}</h3>
                                                <p className="text-gray-500 text-sm">{owner.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                            <span>Joined: {new Date(owner.date).toLocaleDateString()}</span>
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                Active
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleview(owner.email)}
                                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </button>
                                            <button
                                                onClick={() => handledelete(owner.email)}
                                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200 text-sm flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                       
                    </>
                )}

                {opendetail && selectedowner && (
                    <ViewDetail
                        owner={selectedowner}
                        onClose={() => setopendetail(false)}
                    />
                )}

                {showAllOwnersModal && (
                    <AllOwnersModal
                        owners={filteredOwners}
                        onClose={handleCloseAllOwnersModal}
                        onViewDetail={handleview}
                        onDelete={handledelete}
                    />
                )}
            </div>
        </div>
    );
}