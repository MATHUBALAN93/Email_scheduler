import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { senderService } from '../services/senderService';
import { emailService } from '../services/emailService';
import { Sender } from '../types';
import { ArrowLeft, Upload, Clock, Send, X, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function ComposePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [selectedSender, setSelectedSender] = useState('');
  const [startTime, setStartTime] = useState('');
  const [delayMs, setDelayMs] = useState(2000);
  const [hourlyLimit, setHourlyLimit] = useState(100);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  const { data: senders, isLoading: loadingSenders } = useQuery({
    queryKey: ['senders'],
    queryFn: senderService.getSenders,
  });

  const scheduleMutation = useMutation({
    mutationFn: emailService.scheduleCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-emails'] });
      navigate('/scheduled');
    },
  });

  const handleAddRecipient = () => {
    if (recipientInput && !recipients.includes(recipientInput)) {
      setRecipients([...recipients, recipientInput]);
      setRecipientInput('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    const uniqueEmails = [...new Set(emails.filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))];
    
    setRecipients([...new Set([...recipients, ...uniqueEmails])]);
  };

  const handleSchedule = () => {
    if (!selectedSender || recipients.length === 0 || !subject || !body || !scheduledTime) {
      alert('Please fill in all required fields');
      return;
    }

    scheduleMutation.mutate({
      subject,
      body,
      startTime: scheduledTime,
      delayMs,
      hourlyLimit,
      senderId: selectedSender,
      recipients,
    });
  };

  const getQuickScheduleTime = (hours: number, minutes: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    date.setMinutes(minutes);
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  if (loadingSenders) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
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
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Compose New Email</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowSchedulePanel(!showSchedulePanel)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Clock className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleSchedule}
              disabled={scheduleMutation.isPending}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </div>

        {/* Schedule Panel */}
        {showSchedulePanel && (
          <div className="card p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Send Later</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setScheduledTime(getQuickScheduleTime(24, 10))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Tomorrow, 10:00 AM
                </button>
                <button
                  onClick={() => setScheduledTime(getQuickScheduleTime(24, 11))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Tomorrow, 11:00 AM
                </button>
                <button
                  onClick={() => setScheduledTime(getQuickScheduleTime(24, 15))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Tomorrow, 3:00 PM
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSchedulePanel(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSchedulePanel(false)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="card p-6">
          <div className="space-y-6">
            {/* From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <select
                value={selectedSender}
                onChange={(e) => setSelectedSender(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select sender</option>
                {senders?.map((sender) => (
                  <option key={sender.id} value={sender.id}>
                    {sender.email}
                  </option>
                ))}
              </select>
              {!senders || senders.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No senders configured. Please add a sender first.
                </p>
              )}
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRecipient())}
                  placeholder="Add recipient"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddRecipient}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
                <label className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipients.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="hover:bg-primary-100 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <span className="text-sm text-gray-500">
                    {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="input-field"
                required
              />
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delay between emails (ms)
                </label>
                <input
                  type="number"
                  value={delayMs}
                  onChange={(e) => setDelayMs(parseInt(e.target.value))}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly limit
                </label>
                <input
                  type="number"
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(parseInt(e.target.value))}
                  className="input-field"
                  min="1"
                />
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                {/* Simple toolbar */}
                <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-2">
                  <button className="p-1 hover:bg-gray-200 rounded font-bold">B</button>
                  <button className="p-1 hover:bg-gray-200 rounded italic">I</button>
                  <button className="p-1 hover:bg-gray-200 rounded underline">U</button>
                  <div className="w-px bg-gray-300 mx-2"></div>
                  <button className="p-1 hover:bg-gray-200 rounded">List</button>
                  <button className="p-1 hover:bg-gray-200 rounded">Quote</button>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your email content here..."
                  className="w-full p-4 min-h-[300px] focus:outline-none resize-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
