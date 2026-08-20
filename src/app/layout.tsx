import './globals.css';
export const metadata = {
    title: 'Aplikácia Financie',
    description: 'Správa financií',
  };
  
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="sk">
        <body>{children}</body>
      </html>
    );
  }