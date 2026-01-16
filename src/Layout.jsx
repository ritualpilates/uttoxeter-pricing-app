import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { FileText, Settings, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  const isAdmin = user?.role === 'admin';
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Quotes', path: createPageUrl('Quotes'), icon: FileText },
    ...(isAdmin ? [{ name: 'Admin Settings', path: createPageUrl('AdminSettings'), icon: Settings }] : [])
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <style>{`
        * { font-family: Calibri, sans-serif; }
      `}</style>
      
      {/* Header */}
      <header className="bg-white border-b-2 border-[#C41E3A] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <svg className="h-12" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Arc swooshes */}
                  <path d="M 50 60 Q 200 20, 350 60" stroke="#C41E3A" strokeWidth="8" fill="none" strokeLinecap="round"/>
                  <path d="M 70 70 Q 200 35, 330 70" stroke="#C41E3A" strokeWidth="6" fill="none" strokeLinecap="round"/>
                  
                  {/* LeeBroomfield text */}
                  <text x="40" y="140" fontFamily="Arial, sans-serif" fontSize="52" fontWeight="bold" fill="#C41E3A">LeeBroomfield</text>
                  <text x="280" y="165" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="normal" fill="#808080">.com</text>
                </svg>
              </div>
              <div className="hidden md:block h-12 w-px bg-gray-300 mx-2"></div>
              <span className="hidden md:block text-lg font-semibold text-[#C41E3A]">Pricing App</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath.includes(item.name.replace(' ', ''));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#C41E3A] text-white font-semibold' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
              {user && (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                  <span className="text-sm text-gray-600">{user.full_name || user.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-[#C41E3A] hover:bg-gray-100"
                    onClick={() => base44.auth.logout()}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath.includes(item.name.replace(' ', ''));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-[#C41E3A] text-white font-semibold' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              {user && (
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-600">{user.full_name || user.email}</div>
                  <button
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => base44.auth.logout()}
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}