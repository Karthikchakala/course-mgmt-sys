// frontend/src/pages/admin/AdminPaymentReports.jsx

import React from 'react';

const AdminPaymentReports = () => {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Payment and Revenue Reports 💳</h1>
            <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-400">
                <p className="text-yellow-800">
                    <span className="font-semibold">Note:</span> This feature is pending implementation. It will query the 
                    <code className="bg-yellow-200 p-1 rounded mx-1">/admin/payments</code> endpoint for total revenue and order history.
                </p>
            </div>
        </div>
    );
};

export default AdminPaymentReports;