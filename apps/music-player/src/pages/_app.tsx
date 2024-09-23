import React from 'react';
import { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../styles/globals.css'; // Make sure this file exists for global styles

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;