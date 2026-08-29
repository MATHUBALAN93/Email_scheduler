import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { senderService } from '../services/senderService';
import { emailService } from '../services/emailService';
import { Sender } from '../types';
import { ArrowLeft, Upload, Clock, Send, X, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  content: string;
}

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
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const { data: senders, isLoading: loadingSenders } = useQuery({
    queryKey: ['senders'],
    queryFn: senderService.getSenders,
  });

  const scheduleMutation = useMutation({
    mutationFn: emailService.scheduleCampaign,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-emails'] });
      queryClient.invalidateQueries({ queryKey: ['sent-emails'] });
      alert('Email scheduled successfully!');
      // Redirect to scheduled page after successful scheduling
      navigate('/scheduled');
    },
    onError: (error) => {
      alert(`Failed to schedule email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const emails = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
    const uniqueEmails = [...new Set(emails.filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))];
    
    setRecipients([...new Set([...recipients, ...uniqueEmails])]);
  };

  const handleAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    const newAttachments: Attachment[] = [];
    
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }
      
      const base64 = await fileToBase64(file);
      newAttachments.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        content: base64,
      });
    }

    setAttachments([...attachments, ...newAttachments]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleSchedule = () => {
    if (!selectedSender || recipients.length === 0 || !subject || !body) {
      alert('Please fill in all required fields (sender, recipients, subject, and body)');
      return;
    }

    if (!scheduledTime) {
      alert('Please select a scheduled time');
      setShowSchedulePanel(true);
      return;
    }

    // Check total attachment size
    const totalAttachmentSize = attachments.reduce((sum, att) => sum + att.size, 0);
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB total limit
    
    if (totalAttachmentSize > MAX_TOTAL_SIZE) {
      alert(`Total attachment size exceeds 10MB limit. Current size: ${(totalAttachmentSize / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    console.log('Scheduling email with data:', {
      subject,
      body,
      startTime: scheduledTime,
      delayMs,
      hourlyLimit,
      senderId: selectedSender,
      recipients,
      attachments: attachments.map(att => ({
        name: att.name,
        size: att.size,
        type: att.type,
        content: att.content.substring(0, 50) + '...', // Log only first 50 chars of content
      })),
    });

    scheduleMutation.mutate({
      subject,
      body,
      startTime: scheduledTime,
      delayMs,
      hourlyLimit,
      senderId: selectedSender,
      recipients,
      attachments: attachments.map(att => ({
        name: att.name,
        size: att.size,
        type: att.type,
        content: att.content,
      })),
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
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
              className="btn-primary flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Schedule
            </button>
          </div>
        </div>

        {/* Schedule Panel */}
        {showSchedulePanel && (
          <div className="card p-6 mb-6 border-2 border-primary-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Email</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="input-field"
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quick Schedule
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setScheduledTime(getQuickScheduleTime(1, 0))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    In 1 hour
                  </button>
                  <button
                    onClick={() => setScheduledTime(getQuickScheduleTime(2, 0))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    In 2 hours
                  </button>
                  <button
                    onClick={() => setScheduledTime(getQuickScheduleTime(24, 9))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Tomorrow, 9:00 AM
                  </button>
                  <button
                    onClick={() => setScheduledTime(getQuickScheduleTime(24, 15))}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Tomorrow, 3:00 PM
                  </button>
                </div>
              </div>

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
                    step="100"
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

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSchedulePanel(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (scheduledTime) {
                      setShowSchedulePanel(false);
                    } else {
                      alert('Please select a date and time');
                    }
                  }}
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
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (recipientInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientInput)) {
                          setRecipients([...recipients, recipientInput]);
                          setRecipientInput('');
                        }
                      }
                    }}
                    placeholder="Enter email and press Enter"
                    className="input-field flex-1"
                  />
                  <label className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload CSV
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
                    {recipients.map((email, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {email}
                        <button
                          onClick={() => setRecipients(recipients.filter((_, i) => i !== index))}
                          className="hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
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

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              <div className="space-y-2">
                <label className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2 inline-block">
                  <Paperclip className="w-4 h-4" />
                  Add Attachment
                  <input
                    type="file"
                    multiple
                    onChange={handleAttachment}
                    className="hidden"
                  />
                </label>
                
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Paperclip className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                            <p className="text-xs text-gray-500">
                              {(attachment.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}