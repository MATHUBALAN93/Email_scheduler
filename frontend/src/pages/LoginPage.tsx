import { useState } from 'react';
import { Mail } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Login</h1>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-5 h-5" />
            Sign in with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or sign up through email</span>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="input-field"
                placeholder="you@example.com"
                disabled
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="input-field"
                placeholder="••••••••"
                disabled
              />
            </div>

            <button
              type="button"
              disabled
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Note: Only Google OAuth is currently enabled
          </p>
        </div>
      </div>
    </div>
  );
}
