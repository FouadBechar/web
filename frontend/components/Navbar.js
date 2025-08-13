import Link from 'next/link';
export default function Navbar(){ return (
<nav className="flex items-center justify-between py-4"><Link href="/" className="font-bold text-xl">My Blog</Link><div className="space-x-3"><Link href="/posts">Posts</Link><Link href="/login">Login</Link><Link href="/register" className="px-3 py-1 rounded bg-black text-white">Sign up</Link></div></nav>
); }
