import Layout from '../components/Layout';
import Link from 'next/link';
export default function Home(){ return (<Layout><div className="text-center py-20"><h1 className="text-4xl font-bold">Welcome to your Blog 🚀</h1><p className="mt-3 text-gray-600">Create an account, write your first post and share your ideas.</p><div className="mt-6 space-x-3"><Link href="/posts" className="px-4 py-2 bg-gray-900 text-white rounded">Explore Posts</Link><Link href="/register" className="px-4 py-2 border rounded">Create Account</Link></div></div></Layout>); }
