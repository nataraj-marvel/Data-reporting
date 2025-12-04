import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
        {/* Meta Tags */}
        <meta name="description" content="MarvelQuant Professional Reporting System" />
        <meta name="theme-color" content="#0a1929" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}


