import type { Metadata } from 'next';
import './fonts.css';
import './globals.css';
import Providers from './providers';
export const metadata: Metadata = { title: 'Pairwise — A little practice. A lot of progress.', description: 'Two problems at a time. A focused interview practice space for MAANG + Atlassian.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
