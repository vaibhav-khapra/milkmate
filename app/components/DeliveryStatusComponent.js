'use client';

import React, { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Helper function to format date to YYYY-MM-DD
const formatToYYYYMMDD = (isoDateString) => {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const DeliveryStatusComponent = ({
    currentDayStatus,
    displayQuantity,
    customer,
    customerBaseQuantity,
    extraSaleQuantityForDay,
    dateForToggle,
    ownerEmail,
    onChangeStatus
}) => {
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        if (isToggling || currentDayStatus === 'not-started' || currentDayStatus === 'future' || !ownerEmail) {
            if (!ownerEmail) toast.error('Owner email is missing.');
            return;
        }

        setIsToggling(true);

        let newBaseDeliveryStatus;

        if (currentDayStatus === 'delivered') {
            newBaseDeliveryStatus = false;
        } else { // currentDayStatus === 'undelivered' (includes red and yellow states)
            newBaseDeliveryStatus = true;
        }

        // Format the date to YYYY-MM-DD string, matching your DB storage assumption
        const formattedDateForApi = formatToYYYYMMDD(dateForToggle);

        try {
            const res = await fetch('/api/saveUndelivered', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customersToSave: [
                        {
                            name: customer.name,
                            ownerEmail: ownerEmail,
                            dateNotDelivered: formattedDateForApi, // Use the formatted date here
                            isDelivered: newBaseDeliveryStatus,
                        },
                    ],
                }),
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            if (data.success) {
                toast.success('Delivery status updated!');
                onChangeStatus();
            } else {
                throw new Error(data.message || 'Failed to update delivery status');
            }
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsToggling(false);
        }
    };

    let displayContent;
    let cellClasses = 'w-8 h-8 rounded-full flex items-center justify-center';

    if (isToggling) {
        displayContent = <FiRefreshCw className="animate-spin text-blue-500" />;
        cellClasses += ' bg-gray-50';
    } else {
        if (currentDayStatus === 'delivered') {
            displayContent = displayQuantity;
            cellClasses += ' bg-green-50 text-green-700 font-semibold cursor-pointer hover:bg-green-100';
        } else if (currentDayStatus === 'undelivered' && extraSaleQuantityForDay > 0) {
            displayContent = extraSaleQuantityForDay;
            cellClasses += ' bg-yellow-50 text-yellow-700 font-semibold cursor-pointer hover:bg-yellow-100';
        } else if (currentDayStatus === 'undelivered') {
            displayContent = '0';
            cellClasses += ' bg-red-50 text-red-700 font-semibold cursor-pointer hover:bg-red-100';
        } else if (currentDayStatus === 'not-started') {
            displayContent = '-';
            cellClasses += ' text-gray-400';
        } else if (currentDayStatus === 'future') {
            displayContent = '-';
            cellClasses += ' text-gray-300';
        } else {
            displayContent = '';
            cellClasses += ' text-gray-500';
        }
    }

    return (
        <div
            className={cellClasses}
            onClick={handleToggle}
        >
            {displayContent}
        </div>
    );
};

export default DeliveryStatusComponent;