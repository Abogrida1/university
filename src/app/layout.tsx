import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import SimpleHeader from '@/components/SimpleHeader';
import Footer from '@/components/Footer';
import { UserProvider } from '@/lib/UserContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { NotificationsProvider } from '@/lib/NotificationsContext';
import FirstVisitDisclaimer from '@/components/FirstVisitDisclaimer';
import dynamic from 'next/dynamic';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

const OnboardingTour = dynamic(() => import('@/components/OnboardingTour'), {
  ssr: false,
});
import { GlobalAudioProvider } from '@/lib/GlobalAudioProvider';

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
            <NotificationsProvider>
              <GlobalAudioProvider>
              <div className="min-h-screen flex flex-col relative">
                <SimpleHeader />
                <main className="flex-1 pb-16 lg:pb-0">
                  {children}
                </main>
                <Footer />
                <FirstVisitDisclaimer />
                <OnboardingTour />
                <ServiceWorkerRegistration />
              </div>
              </GlobalAudioProvider>
            </NotificationsProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}