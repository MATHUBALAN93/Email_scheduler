import { useQuery } from '@tanstack/react-query';
import { emailService } from '../services/emailService';
import { Email } from '../types';
import { Clock as ClockIcon, Star, Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useState } from 'react';

export default function ScheduledPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { data: emails, isLoading, error, refetch } = useQuery({
    queryKey: ['scheduled-emails'],
    queryFn: () => emailService.getScheduledEmails(1, 50),
    refetchInterval: autoRefresh ? 5000 : false, // Auto-refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load scheduled emails. Please try again.
        </div>
      </div>
    );
  }

  if (!emails || emails.data.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled emails</h3>
          <p className="text-gray-500 mb-4">You haven't scheduled any emails yet.</p>
          <Link to="/compose" className="btn-primary inline-flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Compose Email
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <ClockIcon className="w-4 h-4" />;
      case 'SENT':
        return <CheckCircle className="w-4 h-4" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-orange-100 text-orange-700';
      case 'SENT':
        return 'bg-green-100 text-green-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Pending';
      case 'SENT':
        return 'Completed';
      case 'FAILED':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scheduled Emails</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded-lg text-sm ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {emails.data.map((email) => (
          <Link
            key={email.id}
            to={`/emails/${email.id}`}
            className="card p-4 hover:shadow-md transition-shadow block"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">To: {email.recipient}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    <ClockIcon className="w-3 h-3" />
                    {format(new Date(email.scheduledAt), 'MMM d, h:mm a')}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(email.status)}`}>
                    {getStatusIcon(email.status)}
                    {getStatusText(email.status)}
                  </span>
                </div>
                <p className="font-medium text-gray-900 truncate">{email.subject}</p>
                <p className="text-sm text-gray-500 truncate line-clamp-2">{email.body}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Star className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}