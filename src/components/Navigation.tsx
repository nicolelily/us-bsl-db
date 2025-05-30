
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, BarChart3, Info, Contact } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/stats', label: 'Charts', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info },
    { path: '/contact', label: 'Contact', icon: Contact },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-bsl-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/009d4537-5a1c-40cd-93af-4624fe786dc4.png" 
                alt="BSLDB Logo" 
                className="h-10 w-10"
              />
              <span className="text-xl font-bold text-bsl-brown">
                BSL Database
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
