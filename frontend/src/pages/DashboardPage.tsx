import { Link } from 'react-router-dom';
import { Clock, Send, Calendar, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Send className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sent</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            to="/compose"
            className="btn-primary flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Compose New Email
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity</p>
          <Link to="/compose" className="text-primary-600 hover:underline mt-2 inline-block">
            Schedule your first email
          </Link>
        </div>
      </div>
    </div>
  );
}
