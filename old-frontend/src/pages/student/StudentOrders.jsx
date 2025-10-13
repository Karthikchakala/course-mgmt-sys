// frontend/src/pages/student/StudentOrders.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

const StudentOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Backend endpoint: GET /orders (Fetches all transactions)
                const response = await apiClient.get('/orders');
                setOrders(response.data.orders || []);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                setError(err.response?.data?.message || 'Failed to load your payment history.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
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
        return <div className="text-center p-12">Loading Payment History...</div>;
    }

    return (
        <div className="container mx-auto p-8 min-h-[calc(100vh-80px)] bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 border-b pb-4">Payment History</h1>
            
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
                <h2 className="text-xl font-semibold mb-4">Total Transactions: {orders.length}</h2>
                
                {orders.length === 0 ? (
                    <p className="text-gray-600">You have no recorded payment transactions.</p>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.order_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{order.order_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.course_title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${parseFloat(order.amount).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusClasses(order.txn_status)}`}>
                                            {order.txn_status === 'TXN_SUCCESS' ? 'Successful' : order.txn_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StudentOrders;