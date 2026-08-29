import { useQuery } from '@tanstack/react-query';
import { emailService } from '../services/emailService';
import { Email } from '../types';
import { Star, Mail, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function SentPage() {
  const { data: emails, isLoading, error } = useQuery({
    queryKey: ['sent-emails'],
    queryFn: () => emailService.getSentEmails(1, 50),
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
          Failed to load sent emails. Please try again.
        </div>
      </div>
    );
  }

  if (!emails || emails.data.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sent emails</h3>
          <p className="text-gray-500 mb-4">You haven't sent any emails yet.</p>
          <Link to="/compose" className="btn-primary inline-flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Compose Email
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sent Emails</h1>

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
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    Sent
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
