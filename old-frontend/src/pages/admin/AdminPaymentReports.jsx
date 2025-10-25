// frontend/src/pages/admin/AdminPaymentReports.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

const AdminPaymentReports = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // Backend endpoint: GET /admin/payments
                const response = await apiClient.get('/admin/payments');
                setTransactions(response.data.transactions || []);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load transaction reports.');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const getStatusClasses = (status) => {
        switch (status) {
            case 'TXN_SUCCESS': return 'bg-green-100 text-green-800 border-green-500';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            case 'FAILURE': return 'bg-red-100 text-red-800 border-red-500';
            default: return 'bg-gray-100 text-gray-800 border-gray-500';
        }
    };

    if (loading) {
        return <div className="text-center p-12">Loading Payment Reports...</div>;
    }

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 border-b pb-4">Financial & Transaction Report 💳</h1>
            
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4">Total Transactions: {transactions.length}</h2>
                
                {transactions.length === 0 ? (
                    <p className="text-gray-600">No payment transactions found in the database.</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((txn) => (
                                <tr key={txn.razorpayOrderId}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</td>
                                    {/* 🛑 FIX 1: Changed className- to className */}
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{txn.courseTitle}</td> 
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{txn.studentName} ({txn.studentEmail})</td>
                                    {/* 🛑 FIX 2: Correctly apply styling to the Amount column */}
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold text-indigo-700">${parseFloat(txn.amount).toFixed(2)}</td> 
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusClasses(txn.txn_status)}`}>
                                            {txn.txn_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">{txn.razorpayOrderId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminPaymentReports;