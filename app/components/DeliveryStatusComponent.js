import { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";

export default function DeliveryStatusComponent({ status, customer, onChangeStatus }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleStatusChange = async (newStatus) => {
        const isDelivered = newStatus === "delivered";

        try {
            const res = await fetch("/api/saveUndelivered", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customersToSave: [{
                        name: customer.name,
                        ownerEmail: customer.ownerEmail,
                        dateNotDelivered: customer.dateNotDelivered,
                        isDelivered,
                    }],
                }),
            });

            const data = await res.json();
            if (data.success) {
                onChangeStatus(newStatus); // update parent state
                closeModal();
            } else {
                alert("Failed to update status: " + data.message);
            }
        } catch (err) {
            console.error("Status update error:", err);
            alert("Something went wrong");
        }
    };

    return (
        <>
            <div
                onClick={openModal}
                className="w-6 h-6 mx-auto flex items-center justify-center rounded cursor-pointer hover:bg-gray-100"
            >
                {status === "delivered" ? (
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <FiCheck className="text-green-600 text-xs" />
                    </div>
                ) : (
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                        <FiX className="text-red-600 text-xs" />
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                        <h2 className="text-lg font-semibold mb-4">Change Delivery Status</h2>
                        <button
                            onClick={() => handleStatusChange("delivered")}
                            className="w-full bg-green-600 text-white py-2 rounded mb-2 hover:bg-green-700"
                        >
                            Mark as Delivered
                        </button>
                        <button
                            onClick={() => handleStatusChange("not-delivered")}
                            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                        >
                            Mark as Not Delivered
                        </button>
                        <button onClick={closeModal} className="mt-4 text-gray-500 text-sm hover:underline">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
