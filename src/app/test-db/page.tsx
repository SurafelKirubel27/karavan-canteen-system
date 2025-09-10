'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestDB() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      const { data, error } = await supabase
        .from('menu_items')
        .select('*');

      console.log('Supabase response:', { data, error });

      if (error) {
        setError(error.message);
      } else {
        setMenuItems(data || []);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      <div className="mb-4">
        <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        <p><strong>API Key exists:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
      </div>

      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Menu Items ({menuItems.length})</h2>
        {menuItems.length > 0 ? (
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id} className="bg-gray-100 p-2 rounded">
                <strong>{item.name}</strong> - {item.price} ETB - {item.category}
              </li>
            ))}
          </ul>
        ) : (
          <p>No menu items found</p>
        )}
      </div>
    </div>
  );
}
