import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../hooks/useApi';
import { Calendar, Clock, User as UserIcon, Phone, CheckCircle, AlertCircle } from 'lucide-react';

interface Counsellor {
  clerkId: string;
  name: string;
  email: string;
  counsellorProfile?: {
    specializations?: string[];
    languages?: string[];
    averageRating?: number;
    totalSessions?: number;
    bio?: string;
  };
}

const Booking: React.FC = () => {
  const { currentTheme } = useTheme();
  const api = useApi();

  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    counselorType: '',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      const userRes = await api.getCurrentUser();
      if (userRes?.user) {
        setFormData(prev => ({
          ...prev,
          name: (userRes.user as { name?: string }).name || prev.name,
          email: (userRes.user as { email?: string }).email || prev.email
        }));
      }
    } catch {
      // Non-blocking
    }
  }, [api]);

  const loadCounsellors = useCallback(async () => {
    try {
      const res = await api.getAvailableCounsellors();
      if (res?.counsellors) {
        setCounsellors(res.counsellors);
        if (res.counsellors.length > 0) {
          setSelectedCounsellorId(res.counsellors[0].clerkId);
        }
      }
    } catch (err) {
      console.error('Failed to load counsellors:', err);
    }
  }, [api]);

  useEffect(() => {
    loadCounsellors();
    loadUserData();
  }, [loadCounsellors, loadUserData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      alert('Please select a date and time slot');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 45 * 60000);

      const bookingPayload = {
        counsellorId: selectedCounsellorId || counsellors[0]?.clerkId || 'default_counselor',
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        consentGiven: true,
        studentEmail: formData.email,
        studentName: formData.name,
        reason: formData.reason ? `${formData.counselorType ? `[${formData.counselorType}] ` : ''}${formData.reason}` : undefined
      };

      const res = await api.createBooking(bookingPayload);
      if (res?.booking_id || res?.status) {
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Booking error:', error);
      setErrorMessage(error.message || 'Failed to submit appointment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md border border-gray-100">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Booked!</h2>
          <p className="text-gray-600 mb-4">
            Your appointment request has been submitted successfully to our system. You will receive a confirmation email at <span className="font-semibold text-gray-800">{formData.email}</span>.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-3 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
            style={{ backgroundColor: currentTheme.primary }}
          >
            Book Another Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold themed-text mb-4">Book Counseling Appointment</h1>
          <p className="text-xl themed-muted">
            Schedule a confidential session with our mental health professionals
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" style={{ color: currentTheme.primary }} />
                    Personal Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                        placeholder="your.email@college.edu"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" style={{ color: currentTheme.primary }} />
                    Appointment Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Counselor</label>
                    <select
                      value={selectedCounsellorId}
                      onChange={(e) => setSelectedCounsellorId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                    >
                      {counsellors.map(c => (
                        <option key={c.clerkId} value={c.clerkId}>
                          {c.name} ({c.counsellorProfile?.specializations?.join(', ') || 'Specialist'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                      <input
                        type="date"
                        name="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                        required
                      >
                        <option value="">Select time slot</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Counseling Focus</label>
                    <select
                      name="counselorType"
                      value={formData.counselorType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                    >
                      <option value="">Select counseling focus</option>
                      <option value="general">General Wellness & Anxiety</option>
                      <option value="academic">Academic & Exam Stress</option>
                      <option value="career">Career & Future Planning</option>
                      <option value="psychiatrist">Clinical Consultation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit (Optional)</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                      placeholder="Briefly describe what you'd like to discuss (this helps us prepare for your session)"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white py-4 rounded-xl transition-all duration-200 font-medium text-lg shadow-md hover:shadow-lg disabled:opacity-50"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  {isSubmitting ? 'Submitting Request...' : 'Book Appointment'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Hours</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span>Monday - Friday: 9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span>Saturday: 10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span>Sunday: Closed</span>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 rounded-2xl p-6 border border-teal-200">
              <h3 className="text-lg font-semibold text-teal-800 mb-3">Confidentiality Notice</h3>
              <p className="text-sm text-teal-700 leading-relaxed">
                All appointments are completely confidential. Your personal information and session details 
                are protected under student privacy policies and will never be shared without your explicit consent.
              </p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Emergency Support</h3>
              <p className="text-sm text-blue-700 mb-3">
                If you're experiencing a mental health emergency, please contact:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-blue-800 font-medium">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Campus Emergency: 100</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-800 font-medium">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Helpline: 9152987821</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;