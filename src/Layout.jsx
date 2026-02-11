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
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="bg-white border-b border-[#E0E0E0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696a9314c17d9cb3d4e952c0/d8e17d07a_LeeBroomfieldcomLogo.png" 
                alt="Lee Broomfield" 
                className="h-8"
              />
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
                        ? 'bg-[#203050] text-white' 
                        : 'text-[#5B6472] hover:bg-[#F7F8FA]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
              {user && (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#E0E0E0]">
                  <span className="text-sm text-[#5B6472]">{user.full_name || user.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#5B6472] hover:text-[#203050] hover:bg-[#F7F8FA]"
                    onClick={() => base44.auth.logout()}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-[#F7F8FA] text-[#1A1F2A]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E0E0E0] bg-white">
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
                        ? 'bg-[#203050] text-white' 
                        : 'text-[#5B6472] hover:bg-[#F7F8FA]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              {user && (
                <div className="pt-3 mt-3 border-t border-[#E0E0E0]">
                  <div className="px-4 py-2 text-sm text-[#5B6472]">{user.full_name || user.email}</div>
                  <button
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-[#5B6472] hover:bg-[#F7F8FA] rounded-lg"
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