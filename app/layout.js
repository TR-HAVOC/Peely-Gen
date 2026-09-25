import '../styles/globals.css'; // Optional if you have a global css file, otherwise remove this line

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
