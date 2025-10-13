// frontend/src/pages/admin/AdminCourseManagement.jsx (Complete & Corrected Code)

import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

// -----------------------------------------------------------------
// ⚙️ 1. Reusable Form Input Group 
// -----------------------------------------------------------------
const InputGroup = ({ label, name, type = 'text', value, onChange, required, step }) => (
    <div>
        <label className="block text-gray-700 text-sm font-semibold mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            required={required}
            step={step}
        />
    </div>
);


// -----------------------------------------------------------------
// 🧩 2. COURSE FORM COMPONENT
// -----------------------------------------------------------------

const CourseForm = ({ course, fetchCourses, setShowForm, setEditingCourse }) => {
    const [formData, setFormData] = useState({
        title: '', description: '', price: '', image_url: '', category: ''
    });
    const [formError, setFormError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (course) {
            // Populate form if editing
            setFormData({
                title: course.title, description: course.description, 
                price: course.price, image_url: course.image_url, category: course.category
            });
        } else {
            // Reset form for adding new
            setFormData({ title: '', description: '', price: '', image_url: '', category: '' });
        }
    }, [course]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSaving(true);
        
        const isUpdate = !!course;
        const url = isUpdate ? `/admin/course/${course.id}` : '/admin/course'; 
        const method = isUpdate ? 'put' : 'post';

        try {
            let response;
            if (method === 'post') {
                response = await apiClient.post(url, formData);
            } else {
                response = await apiClient.put(url, formData);
            }

            alert(`Course ${isUpdate ? 'updated' : 'added'} successfully! ID: ${response.data.courseId || course.id}`);
            fetchCourses(); // Refresh list of courses
            setShowForm(false);
            if (!isUpdate) setEditingCourse(null); 
        } catch (err) {
            setFormError(err.response?.data?.message || `Failed to ${isUpdate ? 'update' : 'add'} course.`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">{course ? `Edit Course: ${course.title}` : 'Add New Course'}</h2>
            
            {formError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{formError}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputGroup label="Title" name="title" value={formData.title} onChange={handleChange} required />
                <InputGroup label="Category" name="category" value={formData.category} onChange={handleChange} required />
                <InputGroup label="Price ($)" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
                <InputGroup label="Image URL" name="image_url" value={formData.image_url} onChange={handleChange} />
                
                <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-1">Description</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        rows="4"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                    <button 
                        type="button" 
                        onClick={() => { setShowForm(false); setEditingCourse(null); }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : (course ? 'Update Course' : 'Create Course')}
                    </button>
                </div>
            </form>
        </div>
    );
};


// -----------------------------------------------------------------
// 🎬 3. LESSON FORM COMPONENT 
// -----------------------------------------------------------------

const LessonForm = ({ lesson, handleSaveLesson, setEditingLesson, lessonError }) => {
    const isNew = !lesson || !lesson.id;
    const [formData, setFormData] = useState({
        title: lesson?.title || '', video_url: lesson?.video_url || '', 
        notes: lesson?.notes || '', order_number: lesson?.order_number || '', id: lesson?.id
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (lesson) {
             setFormData({
                title: lesson.title || '', video_url: lesson.video_url || '', 
                notes: lesson.notes || '', order_number: lesson.order_number || '',
                id: lesson.id,
            });
        } else if (!isNew) {
             setFormData({ title: '', video_url: '', notes: '', order_number: '' });
        }
    }, [lesson, isNew]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await handleSaveLesson(formData); 
        setIsSaving(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-inner border border-green-200">
            <h3 className="text-xl font-bold text-green-700 mb-4">{isNew ? 'Add New Lesson' : `Edit Lesson: ${lesson.title}`}</h3>
            
            {lessonError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{lessonError}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-3">
                <InputGroup label="Lesson Title" name="title" value={formData.title} onChange={handleChange} required />
                <InputGroup label="Video URL" name="video_url" value={formData.video_url} onChange={handleChange} required />
                <InputGroup label="Order Number" name="order_number" type="number" value={formData.order_number} onChange={handleChange} required />
                
                <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-1">Notes</label>
                    <textarea 
                        name="notes" 
                        value={formData.notes || ''} 
                        onChange={handleChange} 
                        rows="3"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                    <button 
                        type="button" 
                        onClick={() => setEditingLesson(null)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                    >
                        Close
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : (isNew ? 'Create Lesson' : 'Update Lesson')}
                    </button>
                </div>
            </form>
        </div>
    );
};


// -----------------------------------------------------------------
// 🎬 4. LESSON MANAGEMENT DISPLAY COMPONENT
// -----------------------------------------------------------------

const LessonManagement = ({ courseId, courseName, lessons, fetchLessons, handleDeleteLesson, lessonError, editingLesson, setEditingLesson }) => {
    // 🛑 FIX: Receives and uses courseName
    
    // Handler must be defined here to get the data
    const handleSaveLesson = async (lessonData) => {
        const url = lessonData.id 
            ? `/admin/lesson/${lessonData.id}` 
            : `/admin/lesson`; 
        const method = lessonData.id ? 'put' : 'post';
        
        // Add courseId for POST requests
        if (!lessonData.id) {
            lessonData.course_id = courseId;
        }

        try {
            if (method === 'post') {
                await apiClient.post(url, lessonData);
            } else {
                await apiClient.put(url, lessonData);
            }
            alert('Lesson saved successfully.');
            setEditingLesson(null); 
            fetchLessons(courseId); 
        } catch (err) {
            setLessonError(err.response?.data?.message || 'Failed to save lesson.');
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            {/* 🛑 FIX: Display courseName instead of just ID */}
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex justify-between items-center">
                Lessons for: {courseName}
                {!editingLesson && (
                    <button 
                        onClick={() => setEditingLesson({})} // Start adding a new lesson
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1.5 px-3 rounded-md text-sm transition"
                    >
                        + Add Lesson
                    </button>
                )}
            </h2>

            {lessonError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{lessonError}</div>}
            
            {/* Show the Lesson Form if adding or editing */}
            {editingLesson && (
                <div className="mb-6">
                    <LessonForm 
                        lesson={editingLesson.id ? editingLesson : null} 
                        courseId={courseId} 
                        handleSaveLesson={handleSaveLesson} // Pass the save handler
                        setEditingLesson={setEditingLesson}
                        lessonError={lessonError}
                    />
                </div>
            )}
            
            {/* List of Lessons */}
            <ul className="space-y-2 border-t pt-4">
                {lessons.length === 0 ? (
                    <p className="text-gray-500">No lessons defined for this course.</p>
                ) : (
                    lessons.map(lesson => (
                        <li key={lesson.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                            <span className="font-medium">
                                {lesson.order_number}. {lesson.title} 
                                <span className="ml-3 text-xs text-gray-500 text-gray-500/70">(ID: {lesson.id})</span>
                            </span>
                            <div className="space-x-2">
                                <button 
                                    onClick={() => setEditingLesson(lesson)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteLesson(lesson.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};


// -----------------------------------------------------------------
// 🚀 5. MAIN ADMIN COURSE MANAGEMENT COMPONENT
// -----------------------------------------------------------------

const AdminCourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null); 
    const [showForm, setShowForm] = useState(false);
    
    // States for Lessons
    const [lessons, setLessons] = useState([]);
    const [lessonError, setLessonError] = useState(null);
    const [editingLesson, setEditingLesson] = useState(null); 

    // --- Fetch Courses ---
    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/admin/courses');
            setCourses(response.data.courses || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch courses.');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // --- Fetch Lessons for a specific course ---
    const fetchLessons = async (courseId) => {
        setLessons([]);
        setLessonError(null);
        try {
            const response = await apiClient.get(`/admin/lessons/${courseId}`);
            setLessons(response.data.lessons || []);
        } catch (err) {
            setLessonError(err.response?.data?.message || 'Failed to fetch lessons.');
        }
    };


    // --- Course CRUD Handlers ---

    const handleEditCourse = (course) => {
        // 🛑 FIX: Pass the course object to setEditingCourse
        setEditingCourse(course);
        setShowForm(true);
        fetchLessons(course.id);
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course and all its lessons?")) return;
        try {
            await apiClient.delete(`/admin/course/${courseId}`);
            alert('Course deleted successfully.');
            fetchCourses();
            setEditingCourse(null);
            setLessons([]);
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete course.');
        }
    };


    // --- Lesson CRUD Handlers (Passed to LessonManagement) ---
    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        try {
            await apiClient.delete(`/admin/lesson/${lessonId}`);
            alert('Lesson deleted successfully.');
            fetchLessons(editingCourse.id);
        } catch (err) {
            setLessonError(err.response?.data?.message || 'Failed to delete lesson.');
        }
    };


    // --- Main Render ---

    if (loading) {
        return <div className="text-center p-12">Loading Course Management Dashboard...</div>;
    }

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Course & Lesson Management</h1>
                <button 
                    onClick={() => { setEditingCourse(null); setShowForm(true); setLessons([]); setEditingLesson(null); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md"
                >
                    + Add New Course
                </button>
            </header>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- 1. Course List Sidebar --- */}
                <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-lg h-fit max-h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Existing Courses ({courses.length})</h2>
                    <ul className="space-y-3">
                        {courses.map(course => (
                            <li 
                                key={course.id} 
                                className={`p-3 rounded-lg transition duration-150 border-l-4 border-transparent flex justify-between items-center 
                                    ${editingCourse?.id === course.id ? 'bg-indigo-500 text-white' : 'bg-gray-50 hover:bg-gray-100 hover:border-gray-300'}`}
                            >
                                <span className={`font-medium truncate ${editingCourse?.id === course.id ? 'text-white' : 'text-gray-800'}`} title={course.title}>{course.title}</span>
                                <div className="flex space-x-2 ml-4 flex-shrink-0">
                                    <button 
                                        onClick={() => handleEditCourse(course)}
                                        className={`text-sm font-medium ${editingCourse?.id === course.id ? 'text-indigo-200 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className={`text-sm font-medium ${editingCourse?.id === course.id ? 'text-red-300 hover:text-red-100' : 'text-red-600 hover:text-red-800'}`}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* --- 2. Course/Lesson Form Area --- */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Course Add/Edit Form */}
                    {showForm && (
                         <CourseForm 
                            course={editingCourse} 
                            fetchCourses={fetchCourses} 
                            setShowForm={setShowForm}
                            setEditingCourse={setEditingCourse}
                        />
                    )}
                   
                    {/* Lesson Management Area */}
                    {editingCourse && (
                        <LessonManagement 
                            courseId={editingCourse.id} 
                            courseName={editingCourse.title} // 🛑 PASSING THE NAME
                            lessons={lessons} 
                            fetchLessons={fetchLessons}
                            handleDeleteLesson={handleDeleteLesson}
                            editingLesson={editingLesson}
                            setEditingLesson={setEditingLesson}
                            lessonError={lessonError}
                        />
                    )}

                    {!editingCourse && !showForm && (
                        <div className="p-10 bg-white rounded-xl shadow-lg text-center text-gray-500">
                            Select a course from the left, or click "Add New Course" above.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCourseManagement;