
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, BarChart3, Info, Contact, Plus, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';
import MobileBottomNav from './MobileBottomNav';
import * as Dialog from '@radix-ui/react-dialog';

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

  // Radix Dialog provides focus trap, aria handling and restores focus on close.

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-bsl-border">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/assets/images/bsldb-logo.png" 
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
            {/* Mobile hamburger for secondary links (About / Contact) using Radix Dialog */}
            <div className="md:hidden">
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button
                    type="button"
                    className="p-2 rounded-md text-bsl-brown hover:text-bsl-teal focus:outline-none focus:ring-2 focus:ring-bsl-teal"
                    aria-label="Open more menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </Dialog.Trigger>

                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                  <Dialog.Content
                    className="fixed bottom-0 left-0 right-0 w-full bg-white rounded-t-lg shadow-xl ring-1 ring-black/5 p-4 md:hidden"
                    aria-label="More menu"
                  >
                        <div className="flex items-center justify-between mb-4">
                          <Dialog.Title asChild>
                            <h3 className="text-lg font-semibold text-bsl-brown">More</h3>
                          </Dialog.Title>
                          <Dialog.Close asChild>
                            <button className="p-2 rounded-md text-bsl-brown focus-visible:ring-2 focus-visible:ring-bsl-teal" aria-label="Close menu">
                              <X className="w-5 h-5" />
                            </button>
                          </Dialog.Close>
                        </div>
                        <Dialog.Description asChild>
                          <p className="text-sm text-bsl-brown mb-3">Navigate to additional pages</p>
                        </Dialog.Description>
                        <div className="flex flex-col space-y-2">
                          <Dialog.Close asChild>
                            <Link to="/about" className="px-3 py-3 rounded-md text-bsl-brown hover:bg-bsl-cream focus-visible:ring-2 focus-visible:ring-bsl-teal"> 
                              <div className="flex items-center space-x-2">
                                <Info className="w-4 h-4" />
                                <span>About</span>
                              </div>
                            </Link>
                          </Dialog.Close>
                          <Dialog.Close asChild>
                            <Link to="/contact" className="px-3 py-3 rounded-md text-bsl-brown hover:bg-bsl-cream focus-visible:ring-2 focus-visible:ring-bsl-teal"> 
                              <div className="flex items-center space-x-2">
                                <Contact className="w-4 h-4" />
                                <span>Contact</span>
                              </div>
                            </Link>
                          </Dialog.Close>
                        </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
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

      {/* Radix Dialog handles the mobile drawer; no manual rendering needed here */}

      {/* Mobile bottom tab bar (primary routes) */}
      <MobileBottomNav />
    </>
  );
};

export default Navigation;
