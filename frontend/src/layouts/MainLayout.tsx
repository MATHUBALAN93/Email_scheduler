import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Clock, Send, Plus, Search, Filter, RefreshCw, ChevronDown, LogOut, User, MessageSquare } from 'lucide-react';
import { User as UserType } from '../types';
import { useQuery } from '@tanstack/react-query';
import { slackService } from '../services/slackService';
import { useDebounce } from '../hooks/useDebounce';

interface MainLayoutProps {
  user: UserType;
  onLogout: () => void;
}

export default function MainLayout({ user, onLogout }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data: slackStatus } = useQuery({
    queryKey: ['slack-status'],
    queryFn: slackService.getStatus,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debouncedSearchQuery.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(debouncedSearchQuery)}`);
    }
  };

  const navItems = [
    { path: '/scheduled', icon: Clock, label: 'Scheduled', count: 0 },
    { path: '/sent', icon: Send, label: 'Sent', count: 0 },
  ];

  const handleSlackConnect = async () => {
    try {
      const { authUrl } = await slackService.connect();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to connect Slack:', error);
    }
  };

  const handleSlackDisconnect = async () => {
    try {
      await slackService.disconnect();
      window.location.reload();
    } catch (error) {
      console.error('Failed to disconnect Slack:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-[300px] border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Email Scheduler</h1>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
              ) : (
                <User className="w-6 h-6 text-primary-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {showUserMenu && (
            <div className="mt-2 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Compose Button */}
        <div className="p-4">
          <Link
            to="/compose"
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Compose
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Core</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.count > 0 && (
                  <span className="text-sm bg-gray-200 px-2 py-0.5 rounded-full">{item.count}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Slack Integration */}
          <div className="mt-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Integrations</p>
            <div className="card p-3">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Slack</span>
              </div>
              {slackStatus?.connected ? (
                <button
                  onClick={handleSlackDisconnect}
                  className="w-full text-sm text-red-600 hover:text-red-700 py-1"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleSlackConnect}
                  className="w-full btn-secondary text-sm py-1"
                >
                  Connect Slack
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </form>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => window.location.reload()}>
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
