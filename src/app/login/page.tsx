'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginCredentials } from '@/lib/types';

export default function LoginPage() {
  const { user, login, loading } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // إعادة توجيه المستخدمين المسجلين
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    const success = await login(formData);
    if (success) {
      router.push('/');
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden p-4">
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500&display=swap");
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Tajawal", sans-serif;
        }
        
        .ring {
          position: relative;
          width: 100%;
          max-width: 500px;
          height: 500px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .ring i {
          position: absolute;
          inset: 0;
          border: 2px solid transparent;
          transition: 0.5s;
        }
        
        .ring i:nth-child(1) {
          border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%;
          animation: animate 6s linear infinite;
          border-color: rgba(0, 255, 10, 0.3);
        }
        
        .ring i:nth-child(2) {
          border-radius: 41% 44% 56% 59%/38% 62% 63% 37%;
          animation: animate 4s linear infinite;
          border-color: rgba(255, 0, 87, 0.3);
        }
        
        .ring i:nth-child(3) {
          border-radius: 41% 44% 56% 59%/38% 62% 63% 37%;
          animation: animate2 10s linear infinite;
          border-color: rgba(255, 244, 68, 0.3);
        }
        
        .ring:hover i {
          border-color: var(--clr);
          filter: drop-shadow(0 0 15px var(--clr));
        }
        
        @keyframes animate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes animate2 {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        
        .login {
          position: absolute;
          width: 100%;
          max-width: 300px;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          gap: 25px;
          padding: 20px;
        }
        
        .login h2 {
          font-size: 2em;
          color: #fff;
          text-align: center;
          margin-bottom: 10px;
        }
        
        .login .inputBx {
          position: relative;
          width: 100%;
          margin-bottom: 15px;
        }
        
        .login .inputBx input {
          position: relative;
          width: 100%;
          padding: 15px 20px;
          background: transparent;
          border: 2px solid #fff;
          border-radius: 40px;
          font-size: 1.1em;
          color: #fff;
          box-shadow: none;
          outline: none;
          transition: all 0.3s ease;
        }
        
        .login .inputBx input:focus {
          border-color: #ff357a;
          box-shadow: 0 0 10px rgba(255, 53, 122, 0.3);
        }
        
        .login .inputBx input[type="submit"] {
          width: 100%;
          background: transparent;
          border: 2px solid #fff;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          color: #fff;
        }
        
        .login .inputBx input[type="submit"]:hover {
          background: linear-gradient(45deg, #ff357a, #fff172);
          border-color: #ff357a;
          transform: scale(1.05);
        }
        
        .login .inputBx input[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .login .inputBx input::placeholder {
          color: rgba(255, 255, 255, 0.75);
        }
        
        .login .links {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
          margin-top: 10px;
        }
        
        .login .links a {
          color: #fff;
          text-decoration: none;
          font-size: 0.9em;
          transition: all 0.3s ease;
          padding: 10px 20px;
          border-radius: 25px;
          border: 2px solid #fff;
          background: transparent;
          text-align: center;
          min-width: 120px;
        }
        
        .login .links a:hover {
          background: linear-gradient(45deg, #ff357a, #fff172);
          border-color: #ff357a;
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(255, 53, 122, 0.3);
        }
        
        .error-message {
          background: rgba(255, 0, 87, 0.2);
          border: 1px solid #ff0057;
          color: #fff;
          padding: 12px 20px;
          border-radius: 20px;
          font-size: 0.9em;
          text-align: center;
          margin-bottom: 15px;
          animation: shake 0.5s ease-in-out;
          width: 100%;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .password-toggle {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.75);
          cursor: pointer;
          font-size: 1.2em;
          padding: 5px;
        }
        
        .password-toggle:hover {
          color: #fff;
        }
        
        @media (max-width: 768px) {
          .ring {
            height: 400px;
            max-width: 350px;
          }
          
          .login {
            max-width: 280px;
            gap: 20px;
            padding: 15px;
          }
          
          .login h2 {
            font-size: 1.8em;
          }
          
          .login .inputBx input {
            padding: 12px 18px;
            font-size: 1em;
          }
        }
        
        @media (max-width: 480px) {
          .ring {
            height: 350px;
            max-width: 300px;
          }
          
          .login {
            max-width: 250px;
            gap: 15px;
            padding: 10px;
          }
          
          .login h2 {
            font-size: 1.6em;
          }
          
          .login .inputBx input {
            padding: 10px 15px;
            font-size: 0.9em;
          }
          
          .login .links {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
      
      <div className="ring">
        <i style={{'--clr': '#00ff0a'}}></i>
        <i style={{'--clr': '#ff0057'}}></i>
        <i style={{'--clr': '#fff444'}}></i>
        <div className="login">
          <h2>تسجيل الدخول</h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
              <div className="inputBx">
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="البريد الإلكتروني"
                  required
                />
              </div>
            <div className="inputBx">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="كلمة المرور"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="inputBx">
              <input 
                type="submit" 
                value={loading ? 'جاري تسجيل الدخول...' : 'دخول'}
                disabled={loading}
              />
            </div>
          </form>
          
          <div className="links">
            <Link href="/auth/register">تسجيل جديد</Link>
            <Link href="/">العودة للرئيسية</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
