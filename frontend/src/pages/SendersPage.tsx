import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { senderService } from '../services/senderService';
import { Sender } from '../types';
import { Plus, Trash2, Mail, Server, Lock, User as UserIcon } from 'lucide-react';

export default function SendersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
  });

  const { data: senders, isLoading } = useQuery({
    queryKey: ['senders'],
    queryFn: senderService.getSenders,
  });

  const createMutation = useMutation({
    mutationFn: senderService.createSender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senders'] });
      setShowForm(false);
      setFormData({
        email: '',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: senderService.deleteSender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senders'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this sender?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Email Senders</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Sender
          </button>
        </div>

        {/* Add Sender Form */}
        {showForm && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Sender</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="sender@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Server className="w-4 h-4 inline mr-1" />
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                  className="input-field"
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
                  className="input-field"
                  min="1"
                  max="65535"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Common ports: 587 (TLS), 465 (SSL), 25</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={formData.smtpUser}
                  onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                  className="input-field"
                  placeholder="your-email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Lock className="w-4 h-4 inline mr-1" />
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={formData.smtpPassword}
                  onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                  className="input-field"
                  placeholder="Your SMTP password or app password"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add Sender'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Senders List */}
        <div className="card">
          {senders && senders.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {senders.map((sender) => (
                <div key={sender.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sender.email}</p>
                      <p className="text-sm text-gray-500">
                        {sender.smtpHost}:{sender.smtpPort}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(sender.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No senders configured</p>
              <p className="text-sm mb-4">Add an email sender to start scheduling emails</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add Your First Sender
              </button>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="card p-6 mt-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">Setting up SMTP</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Gmail:</strong> Use an App Password. Enable 2FA and generate an app password in Google Account settings.</p>
            <p><strong>Outlook:</strong> Use smtp.office365.com with port 587 and your Microsoft account password.</p>
            <p><strong>Other providers:</strong> Check your email provider's SMTP settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}