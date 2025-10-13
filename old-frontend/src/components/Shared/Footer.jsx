// frontend/src/components/Shared/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const SocialIcon = ({ IconComponent, href, name }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition duration-150">
            {/* Placeholder for actual SVG icons (e.g., from heroicons or FontAwesome) */}
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.87 7.5L12 12.37l-3.87-2.87c.07-.06.15-.12.23-.17l3.64 2.76 3.64-2.76c.08.05.16.11.23.17zM12 18c-3.313 0-6-2.687-6-6s2.687-6 6-6 6 2.687 6 6-2.687 6-6 6zM8 12c0 2.209 1.791 4 4 4s4-1.791 4-4-1.791-4-4-4-4 1.791-4 4z"/></svg>
            <span className="sr-only">{name}</span>
        </a>
    );

    return (
        <footer className="bg-gray-800 text-white pt-10 pb-6 shadow-inner">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-gray-700 pb-8">
                    
                    {/* Brand/Mission Statement */}
                    <div>
                        <h3 className="text-xl font-bold mb-3 text-blue-400">CMS Learning</h3>
                        <p className="text-sm text-gray-400">
                            Your gateway to expert-led courses and professional development. Secure learning, managed simply.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
                            <li><Link to="/courses" className="text-gray-400 hover:text-white transition">Catalog</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
                            {/* <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li> */}
                            <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Contact</h3>
                        <p className="text-sm text-gray-400 mb-2">Email: support@cms.com</p>
                        <p className="text-sm text-gray-400">Phone: (+91) 1234567890</p>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Connect</h3>
                        <div className="flex space-x-4">
                            <SocialIcon name="LinkedIn" href="#" />
                            <SocialIcon name="Instagram" href="#" />
                            <SocialIcon name="YouTube" href="#" />
                        </div>
                    </div>
                </div>

                {/* Copyright Notice */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    &copy; {currentYear} CMS Learning Platform. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;