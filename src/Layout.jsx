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
      <header className="bg-[#00508C] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" fill="white"/>
                  <circle cx="50" cy="50" r="35" fill="#00508C"/>
                  <circle cx="50" cy="50" r="28" fill="white"/>
                  <path d="M35 50 L45 60 L65 40" stroke="#00508C" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="30" cy="30" r="3" fill="#C4D600"/>
                  <circle cx="70" cy="30" r="3" fill="#C4D600"/>
                  <circle cx="30" cy="70" r="3" fill="#C4D600"/>
                  <circle cx="70" cy="70" r="3" fill="#C4D600"/>
                  <circle cx="50" cy="20" r="3" fill="#C4D600"/>
                  <circle cx="20" cy="50" r="3" fill="#C4D600"/>
                  <circle cx="80" cy="50" r="3" fill="#C4D600"/>
                  <circle cx="50" cy="80" r="3" fill="#C4D600"/>
                </svg>
                <div>
                  <div className="text-xl font-bold tracking-wide">JOHNSONS</div>
                  <div className="text-xs tracking-wider -mt-1">Workwear</div>
                </div>
              </div>
              <div className="hidden md:block h-12 w-px bg-white/20 mx-2"></div>
              <span className="hidden md:block text-lg font-semibold">Uttoxeter Pricing</span>
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
                        ? 'bg-[#C4D600] text-[#00508C] font-semibold' 
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
              {user && (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/20">
                  <span className="text-sm text-white/80">{user.full_name || user.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    onClick={() => base44.auth.logout()}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
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
                        ? 'bg-[#C4D600] text-[#00508C] font-semibold' 
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              {user && (
                <div className="pt-3 mt-3 border-t border-white/10">
                  <div className="px-4 py-2 text-sm text-white/70">{user.full_name || user.email}</div>
                  <button
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/90 hover:bg-white/10 rounded-lg"
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