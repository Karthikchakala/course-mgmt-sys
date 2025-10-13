// frontend/src/pages/AboutPage.jsx

import React from 'react';

const AboutPage = () => {
    
    // Define the key metrics
    const stats = [
        { icon: '🎓', value: '1,000+', label: 'Students Enrolled', color: 'text-indigo-600' },
        { icon: '📚', value: '150+', label: 'Courses Available', color: 'text-green-600' },
        { icon: '🌍', value: '20+', label: 'Expert Instructors', color: 'text-blue-600' },
    ];

    // Define the key highlights
    const highlights = [
        { 
            title: 'Verified Global Experts', 
            description: 'Learn from industry leaders vetted for quality and practical experience.', 
            color: 'border-yellow-500' 
        },
        { 
            title: 'Seamless Security', 
            description: 'Integrated Paytm payments ensure your transactions are always secure and reliable.', 
            color: 'border-red-500' 
        },
        { 
            title: 'Trackable Progress', 
            description: 'Intuitive dashboards and progress markers keep you motivated and on track to completion.', 
            color: 'border-green-500' 
        },
    ];

    return (
        <div className="container mx-auto p-8 bg-white min-h-screen">
            
            {/* Header and Mission */}
            <header className="text-center max-w-4xl mx-auto mb-16">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
                    About CMS Learning Platform
                </h1>
                <p className="text-xl text-gray-600">
                    Our mission is to democratize high-quality education by connecting dedicated learners with industry experts through a secure, feature-rich, and easy-to-use platform.
                </p>
            </header>

            {/* Stats / Achievements Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Our Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <div 
                            key={index} 
                            className="text-center p-8 bg-gray-50 rounded-xl shadow-lg border-t-4 border-indigo-400"
                        >
                            <span className={`text-5xl mb-3 block ${stat.color}`}>{stat.icon}</span>
                            <h3 className="text-4xl font-extrabold text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-lg font-medium text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <hr className="mb-16"/>

            {/* Why Choose Us Section */}
            <section>
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Why Choose CMS Learning?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {highlights.map((item, index) => (
                        <div 
                            key={index} 
                            className={`p-6 bg-white rounded-xl shadow-xl border-l-4 ${item.color} transition duration-300 hover:shadow-2xl`}
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-gray-600">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AboutPage;