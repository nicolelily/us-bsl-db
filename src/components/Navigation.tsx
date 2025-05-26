
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, BarChart3, Info } from 'lucide-react';
import UserMenu from './UserMenu';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/stats', label: 'Statistics', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-dogdata-muted">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-dogdata-blue">
              BSL Database
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
                        ? 'text-dogdata-blue bg-dogdata-background'
                        : 'text-dogdata-text hover:text-dogdata-blue hover:bg-dogdata-background'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
