import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Home: React.FC = () => {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    router.push('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold">XM Bakeries</h1>
      <div className="mt-10 flex justify-center space-x-4">
        <Link href="/products">
          <p className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300">
            Manage Products
          </p>
        </Link>
        <Link href="/orders">
          <p className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300">
            Manage Orders
          </p>
        </Link>
        <Link href="/customers">
          <p className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300">
            Manage Customers
          </p>
        </Link>
        <Link href="/reports">
          <p className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300">
            View Reports
          </p>
        </Link>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Home;
