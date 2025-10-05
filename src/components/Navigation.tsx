
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, BarChart3, Info, Contact, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/stats', label: 'Charts', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Contact },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-bsl-border">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/lovable-uploads/009d4537-5a1c-40cd-93af-4624fe786dc4.png" 
                alt="BSLDB Logo" 
                className="h-12 w-12 sm:h-16 sm:w-16"
              />
              <span className="text-lg sm:text-xl font-bold text-bsl-brown">
                <span className="hidden sm:inline">BSL Database</span>
                <span className="sm:hidden">BSL DB</span>
              </span>
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-bsl-teal bg-bsl-cream'
                        : 'text-bsl-brown hover:text-bsl-teal hover:bg-bsl-cream'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Contribute Button - Always visible */}
            <Link
              to={user ? "/submit" : "/auth?redirect=/submit"}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 sm:px-6 rounded-lg text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-1 sm:space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Contribute</span>
              <span className="sm:hidden">+</span>
            </Link>
            
            {user ? (
              <UserMenu />
            ) : (
              <Link
                to="/auth"
                className="bg-bsl-teal text-white px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium hover:bg-bsl-teal/90 transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
