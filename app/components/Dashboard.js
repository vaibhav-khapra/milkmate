
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';
import { FiUsers, FiActivity, FiTrendingUp } from 'react-icons/fi';
import Navbar from './Navbar';
import AdditionalSale from './AdditionalSale';
import CustomerDeliveryStatus from './CustomerDeliveryStatus'; // Adjust path if needed
import SummaryCards from './Summary';


const Dashboard = () => {
  const { data: session, status } = useSession();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0
  });
  const [undeliveredCustomers, setUndeliveredCustomers] = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCustomers();
    }
  }, [status]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/allcustomer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerEmail: session?.user?.email }),
      });

      const data = await res.json();

      if (data.success) {
        setCustomers(data.customers);

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const activeCustomers = data.customers.filter(c => c.status === 'active');
        const newThisMonth = data.customers.filter(c => {
          const date = new Date(c.dateStarted);
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        }).length;

        setStats({
          total: data.customers.length,
          active: activeCustomers.length,
          newThisMonth
        });

        const undeliveredSet = new Set(
          data.undelivered.map(u => `${u.name}-${new Date(u.dateNotDelivered).toDateString()}`)
        );

        setUndeliveredCustomers(data.customers.map(c => {
          const key = `${c.name}-${new Date().toDateString()}`;
          return { ...c, isDelivered: !undeliveredSet.has(key) };
        }));
      } else {
        toast.error(data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Something went wrong while fetching customers');
    } finally {
      setLoading(false);
    }
  };

  

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm h-36 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-4 md:p-8">
        

        {/* Stats Cards */}
        
        <SummaryCards title="Dashboard Overview"></SummaryCards>

        <CustomerDeliveryStatus
          undeliveredCustomers={undeliveredCustomers}
          setUndeliveredCustomers={setUndeliveredCustomers}
          loading={loading}
          setTogglingId={setTogglingId}
          togglingId={togglingId}
          fetchCustomers={fetchCustomers}
        />

        <AdditionalSale customers={customers} />





      </main>
    </div>
  );
};

export default Dashboard;

