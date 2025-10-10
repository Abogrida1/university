'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<'contact' | 'join'>('contact');
  const [contactData, setContactData] = useState({
    firstName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [joinData, setJoinData] = useState({
    firstName: '',
    email: '',
    department: '',
    year: '',
    term: '',
    whatsapp: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactData({
      ...contactData,
      [e.target.name]: e.target.value
    });
  };

  const handleJoinChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setJoinData({
      ...joinData,
      [e.target.name]: e.target.value
    });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // إرسال البيانات إلى صفحة الإدارة
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'contact',
          data: contactData
        }),
      });
      
      if (response.ok) {
        alert('تم إرسال رسالتك بنجاح!');
        setContactData({ firstName: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ في إرسال الرسالة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // إرسال البيانات إلى صفحة الإدارة
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'join',
          data: joinData
        }),
      });
      
      if (response.ok) {
        alert('تم إرسال طلب الانضمام بنجاح!');
        setJoinData({ firstName: '', email: '', department: '', year: '', term: '', whatsapp: '' });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ في إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 lg:mb-8 shadow-2xl shadow-cyan-500/25">
            <span className="text-2xl sm:text-3xl lg:text-4xl">📞</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            تواصل معنا
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            اختر الطريقة التي تفضلها للتواصل معنا
          </p>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <div className="flex bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 sm:p-2 border border-gray-700/50">
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
                activeTab === 'contact'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
              style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
            >
              📧 تواصل معنا
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
                activeTab === 'join'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
              style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
            >
              👥 انضم إلينا
            </button>
          </div>
        </div>

        {/* Contact Form */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-700/50">
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                أرسل لنا رسالة
              </h2>
              
              <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                      الاسم الأول *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={contactData.firstName}
                      onChange={handleContactChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-400 text-base sm:text-lg"
                      placeholder="أدخل اسمك الأول"
                      required
                      style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactData.email}
                      onChange={handleContactChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-400 text-base sm:text-lg"
                      placeholder="example@gmail.com"
                      required
                      style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    موضوع الرسالة *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={contactData.subject}
                    onChange={handleContactChange}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-400 text-base sm:text-lg"
                    placeholder="ما هو موضوع رسالتك؟"
                    required
                    style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    الرسالة *
                  </label>
                  <textarea
                    name="message"
                    value={contactData.message}
                    onChange={handleContactChange}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-400 text-base sm:text-lg resize-none"
                    placeholder="اكتب رسالتك هنا..."
                    required
                    style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 overflow-hidden w-full sm:w-auto"
                    style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                  >
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    
                    {/* Button Content */}
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm sm:text-base">جاري الإرسال...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base sm:text-lg">📧</span>
                          <span className="text-sm sm:text-base">إرسال الرسالة</span>
                        </>
                      )}
                    </div>
                    
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 ease-out"></div>
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Form */}
        {activeTab === 'join' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800/60 via-gray-700/40 to-gray-800/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-10 shadow-2xl border border-cyan-500/30">
              <div className="text-center mb-6 sm:mb-8 lg:mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-2xl shadow-emerald-500/25">
                  <span className="text-2xl sm:text-3xl">👥</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-3 sm:mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  انضم إلى فريق الإدارة
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-4 sm:mb-6 max-w-3xl mx-auto leading-relaxed px-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  كن جزءاً من فريق الإدارة وساعد في تطوير المنصة وتقديم أفضل تجربة للطلاب
                </p>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    <span style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>إدارة المحتوى</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                    <span style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>دعم الطلاب</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                    <span style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>تطوير المنصة</span>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleJoinSubmit} className="space-y-6 sm:space-y-8">
                {/* Personal Info Section */}
                <div className="bg-gray-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-600/30">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-xs sm:text-sm">👤</span>
                    المعلومات الشخصية
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                        الاسم الأول *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={joinData.firstName}
                        onChange={handleJoinChange}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-emerald-500 transition-all duration-300 text-white placeholder-gray-400 text-base sm:text-lg"
                        placeholder="أدخل اسمك الأول"
                        required
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                        البريد الإلكتروني *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={joinData.email}
                        onChange={handleJoinChange}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-emerald-500 transition-all duration-300 text-white placeholder-gray-400 text-base sm:text-lg"
                        placeholder="example@gmail.com"
                        required
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Info Section */}
                <div className="bg-gray-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-600/30">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-xs sm:text-sm">🎓</span>
                    المعلومات الأكاديمية
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                        القسم *
                      </label>
                      <select
                        name="department"
                        value={joinData.department}
                        onChange={handleJoinChange}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-emerald-500 transition-all duration-300 text-white text-base sm:text-lg"
                        required
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      >
                        <option value="">اختر القسم</option>
                        <option value="Cyber Security">🛡️ الأمن السيبراني</option>
                        <option value="Artificial Intelligence">🤖 الذكاء الاصطناعي</option>
                        <option value="General Program">🎓 البرنامج العام</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                        السنة *
                      </label>
                      <select
                        name="year"
                        value={joinData.year}
                        onChange={handleJoinChange}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-emerald-500 transition-all duration-300 text-white text-base sm:text-lg"
                        required
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      >
                        <option value="">اختر السنة</option>
                        <option value="1">1️⃣ السنة الأولى</option>
                        <option value="2">2️⃣ السنة الثانية</option>
                        <option value="3">3️⃣ السنة الثالثة</option>
                        <option value="4">4️⃣ السنة الرابعة</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-gray-300 text-sm font-bold mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                        الترم *
                      </label>
                      <select
                        name="term"
                        value={joinData.term}
                        onChange={handleJoinChange}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-emerald-500 transition-all duration-300 text-white text-base sm:text-lg"
                        required
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      >
                        <option value="">اختر الترم</option>
                        <option value="FIRST">1️⃣ الترم الأول</option>
                        <option value="SECOND">2️⃣ الترم الثاني</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Info Section */}
                <div className="bg-gray-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-600/30">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center text-xs sm:text-sm">📱</span>
                    معلومات التواصل
                  </h3>
                  <div>
                    <label className="block text-gray-300 text-sm font-bold mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                      رقم الواتساب *
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={joinData.whatsapp}
                      onChange={handleJoinChange}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl sm:rounded-2xl focus:outline-none focus:border-emerald-500 transition-all duration-300 text-white placeholder-gray-400 text-base sm:text-lg"
                      placeholder="+20 10 1234 5678"
                      required
                      style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                    />
                    <p className="text-xs sm:text-sm text-gray-400 mt-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                      سنتواصل معك عبر الواتساب لتأكيد انضمامك للفريق
                    </p>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="text-center bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-500/30">
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                      جاهز للانضمام؟
                    </h3>
                    <p className="text-gray-300 text-base sm:text-lg" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                      بعد إرسال طلبك، سنراجع معلوماتك ونتواصل معك قريباً
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg lg:text-xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 overflow-hidden w-full sm:w-auto"
                    style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                  >
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    
                    {/* Button Content */}
                    <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 sm:border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm sm:text-base">جاري الإرسال...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base sm:text-lg lg:text-xl">🚀</span>
                          <span className="text-sm sm:text-base">إرسال طلب الانضمام</span>
                          <span className="text-base sm:text-lg lg:text-xl">✨</span>
                        </>
                      )}
                    </div>
                    
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 ease-out"></div>
                    </div>
                  </button>
                  
                  <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    ⏱️ متوسط وقت الرد: 24-48 ساعة
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}