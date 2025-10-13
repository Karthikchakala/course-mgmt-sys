// frontend/src/pages/admin/AdminStudentManagement.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

const AdminStudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    // --- Fetch Students ---
    const fetchStudents = async () => {
        setLoading(true);
        try {
            // Backend endpoint: GET /admin/students (Fetches all users where role='student')
            const response = await apiClient.get('/admin/students'); 
            setStudents(response.data.students || []); 
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch students.');
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // --- Student CRUD Handlers ---

    const handleEdit = (student) => {
        setEditingStudent(student);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student account? This action cannot be undone.")) return;
        try {
            // Assuming you implemented a DELETE /admin/student/:id endpoint in your backend
            // For now, we'll use a mock success as the DELETE route was a placeholder in the backend
            // await apiClient.delete(`/admin/student/${id}`); 
            alert('Student deletion simulated successfully. Refreshing list.');
            fetchStudents(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete student.');
        }
    };
    
    const handleSave = async (formData, isNew) => {
        const studentId = formData.id;
        try {
            if (isNew) {
                // Request goes to POST /admin/student
                await apiClient.post('/admin/student', formData);
            } else {
                // Request goes to PUT /admin/student/:id (only sending name/email)
                await apiClient.put(`/admin/student/${studentId}`, { name: formData.name, email: formData.email });
            }
            
            alert(`Student ${isNew ? 'added' : 'updated'} successfully.`);
            setShowForm(false);
            setEditingStudent(null);
            fetchStudents();
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isNew ? 'add' : 'update'} student.`);
        }
    };


    // --- Render ---

    if (loading) {
        return <div className="text-center p-12">Loading Student Management Dashboard...</div>;
    }

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
            <header className="mb-8 flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
                <button 
                    onClick={() => { setEditingStudent(null); setShowForm(true); }}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
                >
                    + Add New Student
                </button>
            </header>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            
            {/* Student Form (Add/Edit) */}
            {showForm && (
                <StudentForm 
                    student={editingStudent} 
                    onSave={handleSave} 
                    onCancel={() => { setShowForm(false); setEditingStudent(null); }}
                />
            )}

            {/* Student List Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
                <h2 className="text-xl font-semibold mb-4">All Student Accounts ({students.length})</h2>
                <StudentTable students={students} handleEdit={handleEdit} handleDelete={handleDelete} />
            </div>
        </div>
    );
};

// -----------------------------------------------------------------
// 🧩 Reusable Components (Forms and Tables)
// -----------------------------------------------------------------

const StudentForm = ({ student, onSave, onCancel }) => {
    const isNew = !student;
    const [formData, setFormData] = useState({
        name: student?.name || '',
        email: student?.email || '',
        password: '', // Only required for creation
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Pass ID only if updating
        await onSave({ ...formData, id: student?.id }, isNew);
        setIsSaving(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 border border-green-200">
            <h3 className="text-2xl font-bold text-green-700 mb-4">{isNew ? 'Add New Student' : `Edit Student: ${student.name}`}</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-1">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                {isNew && (
                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-1">Password (Required)</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required={isNew} />
                    </div>
                )}
                
                <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50">
                        {isSaving ? 'Saving...' : (isNew ? 'Create Account' : 'Update Details')}
                    </button>
                </div>
            </form>
        </div>
    );
};

const StudentTable = ({ students, handleEdit, handleDelete }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                    <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(student.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button onClick={() => handleEdit(student)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                            <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default AdminStudentManagement;