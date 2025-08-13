import Navbar from './Navbar';
export default function Layout({children}){ return (<><Navbar /><main className="mt-6">{children}</main></>); }
