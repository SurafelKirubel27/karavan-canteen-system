'use client';

import Link from 'next/link';
import { useState } from 'react';
import KaravanLogo from '@/components/KaravanLogo';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  preparationTime: number;
}

// Mock menu data
const mockMenuItems: MenuItem[] = [
  { id: 1, name: "Grilled Chicken", description: "Tender grilled chicken breast with herbs", price: 320, category: "Lunch", image: "🍗", available: true, preparationTime: 15 },
  { id: 2, name: "Caesar Salad", description: "Fresh romaine lettuce with parmesan cheese", price: 220, category: "Lunch", image: "🥗", available: true, preparationTime: 5 },
  { id: 3, name: "Pancakes", description: "Fluffy pancakes with maple syrup", price: 180, category: "Breakfast", image: "🥞", available: true, preparationTime: 8 },
  { id: 4, name: "Coffee", description: "Fresh brewed Ethiopian coffee", price: 80, category: "Drinks", image: "☕", available: true, preparationTime: 2 },
  { id: 5, name: "Pizza Margherita", description: "Classic pizza with tomato and mozzarella", price: 380, category: "Dinner", image: "🍕", available: false, preparationTime: 18 },
];

const categories = ["Breakfast", "Lunch", "Dinner", "Drinks", "Snacks"];

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Breakfast',
    image: '🍽️',
    preparationTime: '',
    available: true
  });

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: MenuItem = {
      id: editingItem ? editingItem.id : Date.now(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      available: formData.available,
      preparationTime: parseInt(formData.preparationTime)
    };

    if (editingItem) {
      setMenuItems(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      setMenuItems(prev => [...prev, newItem]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Breakfast',
      image: '🍽️',
      preparationTime: '',
      available: true
    });
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      preparationTime: item.preparationTime.toString(),
      available: item.available
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const toggleAvailability = (id: number) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const emojiOptions = ['🍽️', '🍗', '🥗', '🥞', '☕', '🍕', '🍝', '🥪', '🍊', '🧊', '🍪', '🥔', '🍓', '🍞', '🍚', '💧'];

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/canteen/dashboard">
              <KaravanLogo size="md" />
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link href="/canteen/dashboard" className="text-gray-700 hover:text-emerald-700">Dashboard</Link>
              <span className="text-emerald-700 font-medium">Menu Management</span>
              <button
                onClick={() => window.location.href = '/welcome'}
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
            <p className="text-gray-600">Add, edit, and manage your menu items</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Item</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
              {/* Item Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{item.image}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        item.available ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                        item.available ? 'translate-x-4' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-800 mb-2 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-emerald-600">{item.price} ETB</span>
                  <span className="text-gray-800">{item.preparationTime} min</span>
                </div>
              </div>

              {/* Item Actions */}
              <div className="p-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or add a new item</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Add First Item
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={resetForm}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                      placeholder="e.g., Grilled Chicken"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-gray-900"
                      placeholder="Describe the item..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                      <input
                        type="number"
                        name="preparationTime"
                        value={formData.preparationTime}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                        placeholder="15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Image (Emoji)</label>
                    <div className="grid grid-cols-8 gap-2 p-3 border border-gray-300 rounded-lg">
                      {emojiOptions.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: emoji }))}
                          className={`text-2xl p-2 rounded hover:bg-gray-100 ${
                            formData.image === emoji ? 'bg-emerald-100 ring-2 ring-emerald-500' : ''
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Available for ordering
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
