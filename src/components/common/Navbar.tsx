import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Package, Smartphone, Building, Home, Key, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/asset-profiles', label: 'Asset Profiles', icon: Building },
    { to: '/device-profiles', label: 'Device Profiles', icon: Settings },
    { to: '/assets', label: 'Assets', icon: Package },
    { to: '/devices', label: 'Devices', icon: Smartphone },
    { to: '/attributes', label: 'Attributes', icon: Key },
    { to: '/telemetry', label: 'Telemetry', icon: Activity },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AssetManager</span>
          </div>
          <div className="flex space-x-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};