import '../styles/globals.css';
export default function MyApp({Component,pageProps}){ return (<div className="min-h-screen bg-gray-50 text-gray-900"><div className="max-w-4xl mx-auto p-4"><Component {...pageProps} /></div></div>); }
