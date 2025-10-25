// // frontend/src/pages/courses/CourseDetailsPage.jsx

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import apiClient from '../../services/api';
// import { useAuth } from '../../contexts/AuthContext';
// import axios from 'axios'; // Import axios for the verification call

// // NOTE: This file relies on the Razorpay SDK script tag in frontend/index.html

// const CourseDetailsPage = () => {
//     const { id: courseId } = useParams();
//     const navigate = useNavigate();
//     const { isAuthenticated, user } = useAuth();
    
//     const [course, setCourse] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [paymentLoading, setPaymentLoading] = useState(false);
    
//     // State to track which lesson is currently active for viewing
//     const [activeLesson, setActiveLesson] = useState(null);

//     // Endpoint for backend verification (Explicitly defined)
//     const RAZORPAY_VERIFY_URL = 'http://localhost:5000/orders/verify';

//     // --- Fetch Course Data ---
//     useEffect(() => {
//         const fetchDetails = async () => {
//             setLoading(true);
//             try {
//                 // The token is sent if logged in, enabling the backend to check enrollment
//                 const response = await apiClient.get(`/courses/${courseId}`); 
//                 setCourse(response.data);
                
//                 // If enrolled, set the first lesson as active by default
//                 if (response.data.isEnrolled && response.data.lessons.length > 0) {
//                     setActiveLesson(response.data.lessons[0]);
//                 }
//                 setError(null);
//             } catch (err) {
//                 console.error("Failed to fetch course details:", err);
//                 setError('Could not load course details. It may not exist.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchDetails();
//     }, [courseId, isAuthenticated]);

//     // --- Handle Payment Initiation ---
//     const handlePurchase = async () => {
//         // 1. FIX: Check authentication first. Redirect if not logged in.
//         if (!isAuthenticated) {
//             alert("Please log in or register to purchase this course.");
//             return navigate('/login');
//         }

//         setPaymentLoading(true);
//         try {
//             // 2. Call backend to create Razorpay Order (POST /orders/pay)
//             const response = await apiClient.post('/orders/pay', {
//                 course_id: courseId,
//                 amount: course.price, 
//             });

//             const { orderId, keyId, name, email, amount } = response.data;

//             // 3. Define Razorpay options and handler
//             const options = {
//                 key: keyId, 
//                 amount: amount * 100, // Amount in paise
//                 currency: 'INR',
//                 name: "CMS Learning Platform",
//                 description: course.title,
//                 order_id: orderId, 
//                 handler: async (paymentResponse) => {
//                     // This handler runs on successful payment
//                     try {
//                         // Call backend verification endpoint (POST /orders/verify)
//                         await axios.post(RAZORPAY_VERIFY_URL, {
//                             razorpay_order_id: paymentResponse.razorpay_order_id,
//                             razorpay_payment_id: paymentResponse.razorpay_payment_id,
//                             razorpay_signature: paymentResponse.razorpay_signature,
//                             course_id: courseId,
//                             user_id: user.id, // User ID from AuthContext
//                         });
                        
//                         alert('Payment Successful! Enrollment confirmed.');
//                         // Refresh the page to update isEnrolled status
//                         window.location.reload(); 

//                     } catch (verificationError) {
//                         alert('Payment verified, but enrollment failed due to a server error.');
//                         console.error("Verification Error:", verificationError);
//                     }
//                 },
//                 prefill: {
//                     name: name,
//                     email: email,
//                 },
//                 theme: {
//                     color: "#4F46E5"
//                 }
//             };
            
//             // 4. Open the Razorpay modal
//             const rzp = new window.Razorpay(options);
//             rzp.on('payment.failed', function (response) {
//                  alert(`Payment failed: ${response.error.description}`);
//             });
//             rzp.open();

//         } catch (err) {
//             console.error("Payment initiation failed:", err);
//             const msg = err.response?.data?.message || 'Payment failed. Already enrolled or server error.';
//             setError(msg);
//         } finally {
//             setPaymentLoading(false);
//         }
//     };

//     // --- Render Logic ---

//     if (loading) {
//         return <div className="text-center p-12 text-xl">Loading Course...</div>;
//     }

//     if (error) {
//         return <div className="text-center p-12 text-red-600 bg-red-100 border border-red-400 m-4 rounded">{error}</div>;
//     }

//     if (!course) {
//         return <div className="text-center p-12 text-gray-600">Course not found.</div>;
//     }
    
//     // Determine the text for the action button
//     const actionButtonText = isAuthenticated && !course.isEnrolled ? 'Buy Course Now' : 'Log In to Buy';
    
//     return (
//         <div className="container mx-auto p-8">
//             <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{course.title}</h1>
//             <p className="text-lg text-gray-500 mb-6">{course.category}</p>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
//                 {/* 1. Lessons/Sidebar Column (Appears only if enrolled) */}
//                 {course.isEnrolled && (
//                     <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-full">
//                         <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Course Content</h3>
//                         <div className="space-y-3">
//                             {course.lessons.map((lesson, index) => (
//                                 <div 
//                                     key={lesson.id} 
//                                     onClick={() => setActiveLesson(lesson)}
//                                     className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition duration-150 
//                                         ${activeLesson?.id === lesson.id ? 'bg-indigo-100 text-indigo-800 font-bold border-l-4 border-indigo-600' : 'hover:bg-gray-50 text-gray-700'}`}
//                                 >
//                                     <span>{index + 1}. {lesson.title}</span>
//                                     {lesson.isCompleted && (
//                                         <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done</span>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}

//                 {/* 2. Main Content Column (Player or Description) */}
//                 <div className={`${course.isEnrolled ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8`}>
                    
//                     {/* Lesson Player (Shown only if enrolled and a lesson is active) */}
//                     {course.isEnrolled && activeLesson ? (
//                         <div className="bg-gray-800 rounded-xl shadow-2xl p-4">
//                             <h2 className="text-white text-3xl mb-4">{activeLesson.title}</h2>
//                             {/* Placeholder for the actual Lesson Player Component */}
//                             <div className="aspect-video bg-black flex items-center justify-center text-white text-xl">
//                                 Video Player Placeholder (URL: {activeLesson.video_url})
//                             </div>
//                             <div className="mt-4 p-4 bg-gray-700 rounded-lg text-gray-200">
//                                 <h4 className="font-semibold mb-1">Lesson Notes:</h4>
//                                 <p className="text-sm">{activeLesson.notes || 'No notes provided for this lesson.'}</p>
//                             </div>
//                             {/* In a real app, you'd add a "Mark as Complete" button here */}
//                         </div>
//                     ) : (
//                         /* Default View: Course Description */
//                         <div className="bg-white p-6 rounded-xl shadow-lg">
//                             <h3 className="text-2xl font-semibold text-gray-800 mb-3">Course Overview</h3>
//                             <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
//                         </div>
//                     )}
                    
//                     {/* Action Card: Buy Button or Status */}
//                     <div className="bg-indigo-50 p-6 rounded-xl shadow-inner border border-indigo-200">
//                         <div className="flex justify-between items-center">
//                             <h3 className="text-3xl font-extrabold text-indigo-700">
//                                 Price: ${parseFloat(course.price).toFixed(2)}
//                             </h3>
                            
//                             {/* 🛑 FIX 2: Correct button display logic */}
//                             {course.isEnrolled ? (
//                                 <span className="bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-md">
//                                     ENROLLED
//                                 </span>
//                             ) : (
//                                 <button
//                                     onClick={handlePurchase} // This handles the login redirect OR payment
//                                     disabled={paymentLoading}
//                                     className={`
//                                         font-bold py-3 px-6 rounded-full text-lg shadow-lg transition duration-200 disabled:opacity-50
//                                         ${isAuthenticated ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 hover:bg-gray-800 text-white'}
//                                     `}
//                                 >
//                                     {paymentLoading ? 'Processing...' : (isAuthenticated ? 'Buy Course Now' : 'Log In to Buy')}
//                                 </button>
//                             )}
//                         </div>
                        
//                         {/* Status message */}
//                         {!isAuthenticated && !course.isEnrolled && (
//                             <p className="text-sm text-indigo-600 mt-3 font-medium">
//                                 You must be logged in to purchase.
//                             </p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CourseDetailsPage;

// frontend/src/pages/courses/CourseDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Utility to extract YouTube Video ID
const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// Mark Lesson Complete Button Component
const MarkLessonCompleteButton = ({ courseId, lessonId, isCompleted, onComplete }) => {
    const [status, setStatus] = useState(isCompleted ? 'Completed!' : 'Mark as Complete');
    const [isDisabled, setIsDisabled] = useState(isCompleted);

    const handleComplete = async () => {
        if (isDisabled) return;
        setIsDisabled(true);
        setStatus('Saving...');
        try {
            await apiClient.post('/orders/progress', { course_id: courseId, lesson_id: lessonId });
            setStatus('Completed!');
            onComplete(lessonId);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to mark lesson complete.");
            setStatus('Error');
            setIsDisabled(false);
        }
    };

    return (
        <div className="mt-6 flex justify-end">
            <button 
                onClick={handleComplete}
                disabled={isDisabled}
                className={`py-2 px-4 rounded-lg font-semibold transition duration-200 shadow-md
                    ${status === 'Completed!' ? 'bg-green-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
                    disabled:opacity-60
                `}
            >
                {status}
            </button>
        </div>
    );
};

const CourseDetailsPage = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [activeLesson, setActiveLesson] = useState(null);

    const RAZORPAY_VERIFY_URL = 'http://localhost:5000/orders/verify';

    // Reset lesson when courseId changes
    useEffect(() => {
        // console.log("Course ID from URL:", id);
        setActiveLesson(null);
        setCourse(null);
        setError(null);

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/courses/${courseId}`);
                setCourse(response.data);

                if (response.data.isEnrolled && response.data.lessons.length > 0) {
                    // Set first incomplete lesson as active
                    const firstIncomplete = response.data.lessons.find(l => !l.isCompleted) || response.data.lessons[0];
                    setActiveLesson(firstIncomplete);
                }
            } catch (err) {
                console.error("Failed to fetch course details:", err);
                setError('Could not load course details. It may not exist.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [courseId, isAuthenticated]);

    // Handle Razorpay Payment
    const handlePurchase = async () => {
        if (!isAuthenticated) {
            alert("Please log in or register to purchase this course.");
            return navigate('/login');
        }

        setPaymentLoading(true);

        try {
            const response = await apiClient.post('/orders/pay', { course_id: courseId, amount: course.price });
            const { orderId, keyId, name, email, amount } = response.data;

            const options = {
                key: keyId,
                amount: amount * 100,
                currency: 'INR',
                name: "CMS Learning Platform",
                description: course.title,
                order_id: orderId,
                handler: async (paymentResponse) => {
                    try {
                        await axios.post(RAZORPAY_VERIFY_URL, {
                            razorpay_order_id: paymentResponse.razorpay_order_id,
                            razorpay_payment_id: paymentResponse.razorpay_payment_id,
                            razorpay_signature: paymentResponse.razorpay_signature,
                            course_id: courseId,
                            user_id: user.id,
                        });
                        alert('Payment Successful! Enrollment confirmed.');
                        window.location.reload();
                    } catch (verificationError) {
                        alert('Payment verified, but enrollment failed due to server error.');
                    }
                },
                prefill: { name, email },
                theme: { color: "#4F46E5" },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                alert(`Payment failed: ${response.error.description}`);
            });
            rzp.open();
        } catch (err) {
            console.error("Payment initiation failed:", err);
            setError(err.response?.data?.message || 'Payment failed. Already enrolled or server error.');
        } finally {
            setPaymentLoading(false);
        }
    };

    // Update lesson progress locally
    const handleLessonCompletedLocally = (completedLessonId) => {
        setCourse(prevCourse => ({
            ...prevCourse,
            lessons: prevCourse.lessons.map(lesson =>
                lesson.id === completedLessonId ? { ...lesson, isCompleted: true } : lesson
            )
        }));
    };

    if (loading) return <div className="text-center p-12 text-xl">Loading Course...</div>;
    if (error) return <div className="text-center p-12 text-red-600 bg-red-100 border border-red-400 m-4 rounded">{error}</div>;
    if (!course) return <div className="text-center p-12 text-gray-600">Course not found.</div>;

    const videoId = activeLesson ? getYouTubeVideoId(activeLesson.video_url) : null;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-lg text-gray-500 mb-6">{course.category}</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Lessons Sidebar */}
                {course.isEnrolled && (
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-full">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Course Content</h3>
                        <div className="space-y-3">
                            {course.lessons.map((lesson, index) => (
                                <div
                                    key={lesson.id}
                                    onClick={() => setActiveLesson(lesson)}
                                    className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition duration-150 
                                        ${activeLesson?.id === lesson.id ? 'bg-indigo-100 text-indigo-800 font-bold border-l-4 border-indigo-600' : 'hover:bg-gray-50 text-gray-700'}`}
                                >
                                    <span>{index + 1}. {lesson.title}</span>
                                    {lesson.isCompleted && (
                                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Done</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className={`${course.isEnrolled ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8`}>
                    
                    {course.isEnrolled && activeLesson ? (
                        <div className="bg-gray-800 rounded-xl shadow-2xl p-4">
                            <h2 className="text-white text-3xl mb-4">{activeLesson.title}</h2>

                            {videoId ? (
                                <div className="aspect-video">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                                        title={activeLesson.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full rounded-lg"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video bg-black flex items-center justify-center text-white text-xl">
                                    Video Player Placeholder (URL: {activeLesson.video_url})
                                </div>
                            )}

                            <div className="mt-4 p-4 bg-gray-700 rounded-lg text-gray-200">
                                <h4 className="font-semibold mb-1">Lesson Notes:</h4>
                                <p className="text-sm">{activeLesson.notes || 'No notes provided for this lesson.'}</p>
                            </div>

                            <MarkLessonCompleteButton 
                                courseId={courseId}
                                lessonId={activeLesson.id}
                                isCompleted={activeLesson.isCompleted}
                                onComplete={handleLessonCompletedLocally}
                            />
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Course Overview</h3>
                            <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
                        </div>
                    )}

                    {/* Buy / Enrollment Card */}
                    <div className="bg-indigo-50 p-6 rounded-xl shadow-inner border border-indigo-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-3xl font-extrabold text-indigo-700">
                                Price: {parseFloat(course.price).toFixed(2)}
                            </h3>

                            {course.isEnrolled ? (
                                <span className="bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg shadow-md">
                                    ENROLLED
                                </span>
                            ) : (
                                <button
                                    onClick={handlePurchase}
                                    disabled={paymentLoading}
                                    className={`font-bold py-3 px-6 rounded-full text-lg shadow-lg transition duration-200 disabled:opacity-60
                                        bg-indigo-600 hover:bg-indigo-700 text-white`}
                                >
                                    {paymentLoading ? 'Processing...' : 'Buy Now'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CourseDetailsPage;
