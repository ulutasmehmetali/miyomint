import { useState } from 'react';
import { MessageCircle, Send, Phone, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SupportPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      console.log('Support message:', {
        from: user?.email || 'misafir@miyomint.com',
        customerName: user?.full_name || 'Misafir Kullanıcı',
        subject,
        message,
      });

      setSuccess(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Mesaj gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Bize Ulaşın</h1>
          <p className="text-lg text-gray-600">Size nasıl yardımcı olabiliriz?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Telefon</h3>
            <p className="text-gray-600 mb-2">0850 123 45 67</p>
            <p className="text-sm text-gray-500">Hafta içi 09:00 - 18:00</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">E-posta</h3>
            <p className="text-gray-600 mb-2">destek@miyomint.com</p>
            <p className="text-sm text-gray-500">24 saat içinde cevap</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Çalışma Saatleri</h3>
            <p className="text-gray-600 mb-2">Pazartesi - Cuma</p>
            <p className="text-sm text-gray-500">09:00 - 18:00</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Mesaj Gönderin</h2>
                <p className="text-teal-50 mt-1">En kısa sürede size geri dönüş yapacağız</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Mesajınız başarıyla gönderildi!</p>
                    <p className="text-sm text-green-700 mt-1">En kısa sürede size geri dönüş yapacağız.</p>
                  </div>
                </div>
              )}

              {user && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <p className="text-sm text-teal-800">
                    <span className="font-semibold">{profile?.full_name || 'Kullanıcı'}</span> olarak mesaj gönderiyorsunuz
                  </p>
                  <p className="text-sm text-teal-700 mt-1">{user.email}</p>
                </div>
              )}

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Konu
                </label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  <option value="">Konu seçiniz</option>
                  <option value="order">Sipariş Sorunu</option>
                  <option value="product">Ürün Hakkında</option>
                  <option value="payment">Ödeme Sorunu</option>
                  <option value="shipping">Kargo Takibi</option>
                  <option value="return">İade/Değişim</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Gönderiliyor...' : 'Mesajı Gönder'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Sıkça sorulan soruları görmek için{' '}
            <a href="#" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
              SSS sayfamızı
            </a>{' '}
            ziyaret edebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
