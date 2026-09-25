import './globals.css';

export const metadata = {
  title: 'Peely Gen',
  description: 'Account Generator Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
