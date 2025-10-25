import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import SimpleHeader from '@/components/SimpleHeader';
import Footer from '@/components/Footer';
import { UserProvider } from '@/lib/UserContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import FirstVisitDisclaimer from '@/components/FirstVisitDisclaimer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'University Materials',
  description: 'Access your study materials at Zagazig University',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <UserProvider>
            <div className="min-h-screen flex flex-col relative">
              <SimpleHeader />
              <main className="flex-1 pb-16 lg:pb-0">
                {children}
              </main>
              <Footer />
              <FirstVisitDisclaimer />
            </div>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}