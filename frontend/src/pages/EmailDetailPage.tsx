import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { emailService } from '../services/emailService';
import { Email } from '../types';
import { ArrowLeft, Star, Archive, Trash2, Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: email, isLoading, error } = useQuery({
    queryKey: ['email', id],
    queryFn: () => emailService.getEmailById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load email. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/scheduled" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{email.subject}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Star className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Archive className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Email Content */}
        <div className="card p-6">
          {/* Sender Info */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{email.sender?.email || 'Unknown'}</span>
                <span className="text-sm text-gray-500">&lt;{email.sender?.email}&gt;</span>
              </div>
              <div className="text-sm text-gray-500">
                to me
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {format(new Date(email.scheduledAt), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                email.status === 'SENT' 
                  ? 'bg-green-100 text-green-700' 
                  : email.status === 'FAILED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {email.status}
              </span>
            </div>
          </div>

          {/* Email Body */}
          <div className="prose max-w-none">
            <div 
              className="text-gray-900"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>

          {/* Metadata */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Recipient:</span>
                <span className="ml-2 text-gray-900">{email.recipient}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 text-gray-900">{email.status}</span>
              </div>
              <div>
                <span className="text-gray-500">Scheduled:</span>
                <span className="ml-2 text-gray-900">{format(new Date(email.scheduledAt), 'MMM d, yyyy h:mm a')}</span>
              </div>
              {email.sentAt && (
                <div>
                  <span className="text-gray-500">Sent:</span>
                  <span className="ml-2 text-gray-900">{format(new Date(email.sentAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              )}
              {email.errorMessage && (
                <div className="col-span-2">
                  <span className="text-gray-500">Error:</span>
                  <span className="ml-2 text-red-600">{email.errorMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
