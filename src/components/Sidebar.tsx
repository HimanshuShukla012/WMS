// src/components/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <Home size={18} /> },
    { label: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="bg-[#0f172a] text-white h-screen w-64 p-5 flex flex-col fixed left-0 top-0">
      <h1 className="text-2xl font-bold mb-8 text-center">IWMS</h1>
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            to={item.path}
            key={item.path}
            className={`flex items-center gap-3 p-2 rounded-md hover:bg-blue-600 transition ${
              location.pathname === item.path ? 'bg-blue-700' : ''
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
