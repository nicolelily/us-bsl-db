import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, BarChart3 } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/map', label: 'Map', Icon: Map },
  { to: '/stats', label: 'Charts', Icon: BarChart3 },
];

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // add a class so we can add bottom padding to pages when nav is present
    document.body.classList.add('has-mobile-nav');
    return () => {
      document.body.classList.remove('has-mobile-nav');
    };
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-bsl-border md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-hidden={false}
    >
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-current={location.pathname === item.to ? 'page' : undefined}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center text-xs py-1 px-2 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bsl-teal ${
                  isActive ? 'text-bsl-teal bg-bsl-cream' : 'text-bsl-brown'
                }`
              }
            >
              <item.Icon className="w-5 h-5" aria-hidden="true" />
              <span className="mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
