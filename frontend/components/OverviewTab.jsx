import Loading from '@/app/loading';
import { getCustomers, getTotalProducts, getTotalSales } from '@/services/auth.service';
import { Package, Settings } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect } from 'react'

// Small animated counter component
const CountUp = ({ value = 0, duration = 800, decimals = 0, formatter }) => {
    const [display, setDisplay] = React.useState(0);
    const rafRef = React.useRef(null);
    const fromRef = React.useRef(0);

    React.useEffect(() => {
        const from = Number(fromRef.current) || 0;
        const to = Number(value) || 0;
        const start = performance.now();

        const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const current = from + (to - from) * progress;
            const shown = decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current);
            setDisplay(shown);
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                fromRef.current = to;
            }
        };

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(step);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [value, duration, decimals]);

    const text = formatter
        ? formatter(display)
        : (decimals > 0 ? display.toFixed(decimals) : display.toLocaleString());

    return <span>{text}</span>;
};

const OverviewTab = () => {
    const [totalProducts, setTotalProducts] = React.useState(0);
    const [totalSales, setTotalSales] = React.useState(0);
    const [customers, setCustomers] = React.useState(0);

    useEffect(() => {
        // Fetch overview data from API and update state (not implemented in this example)
        const fetchOverviewData = async () => {
            // Example API calls (replace with actual API endpoints)
            const res = await getTotalProducts();
            setTotalProducts(res.total_products || 0);
            const res2 = await getTotalSales();
            setTotalSales(res2.total_sales || 0);
            const res3 = await getCustomers();
            setCustomers(res3.customers || 0);
        }
        fetchOverviewData();
    }, [])

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className='text-gray-600'>Total Products</h3>
                <Package className='h-8 w-8 text-indigo-600' />
            </div>
            <p className="text-3xl font-bold text-gray-900"><CountUp value={totalProducts} duration={900} /></p>
            <p className="text-sm text-gray-500 mt-2">Active listings</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className='text-gray-600'>Total Sales</h3>
                <Settings className='h-8 w-8 text-green-600' />
            </div>
            <p className="text-3xl font-bold text-gray-900"><CountUp value={Math.round(totalSales)} duration={1000} formatter={(n) => `Rs. ${n.toLocaleString()}`} /></p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className='text-gray-600'>Total Orders</h3>
                <Package className='h-8 w-8 text-purple-600' />
            </div>
            <p className="text-3xl font-bold text-gray-900"><CountUp value={customers} duration={900} /></p>
        </div>

        <div className="md:col-span-3 bg-white rounded-lg shadow-sm p-6">
            <h3 className='font-semibold text-gray-900 mb-4'>Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/products" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <Package className='h-6 w-6 text-indigo-600' />
                    <div>
                        <p className='font-medium text-gray-900'>View Store</p>
                        <p className='text-sm text-gray-500'>See your Live Store</p>
                    </div>
                </Link>

                <button className='flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition'>
                    <Settings className='h-6 w-6 text-indigo-600' />
                    <div>
                        <p className='font-medium text-gray-900'>Settings</p>
                        <p className='text-sm text-gray-500'>Configure your Store</p>
                    </div>
                </button>
            </div>
        </div>
    </div>
  )
}

export default OverviewTab