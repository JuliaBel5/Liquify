import type { Metadata } from 'next';
import ru from '../../../messages/ru.json';
import { Header } from '@/components/layout/Header';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: ru.metadata.title,
  description: ru.metadata.description,
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
