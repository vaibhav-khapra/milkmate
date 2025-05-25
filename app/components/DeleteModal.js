'use client'
import toast from 'react-hot-toast'
import { FiX, FiAlertTriangle, FiTrash2 } from 'react-icons/fi'
import { useState } from 'react'

export default function DeleteModal({ customer, onClose, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const res = await fetch('/api/deletecustomer', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: customer._id }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Customer deleted successfully', {
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                    }
                })
                onDelete()
                onClose()
            } else {
                toast.error(data.message || 'Failed to delete customer', {
                    position: 'top-center'
                })
            }
        } catch (err) {
            toast.error('Error deleting customer. Please try again.', {
                position: 'top-center'
            })
            console.error('Delete error:', err)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <FiAlertTriangle className="text-yellow-500" />
                        Confirm Deletion
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-gray-700">
                        Are you sure you want to delete <strong className="text-gray-900">{customer.name}</strong>?
                        This action cannot be undone.
                    </p>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <FiTrash2 size={16} />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}