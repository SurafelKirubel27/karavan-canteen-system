'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  type: 'food' | 'beverage' | 'snack';
  image: string;
  available: boolean;
  preparationTime: number; // in minutes
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Mock menu data - in a real app, this would come from an API
const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Grilled Chicken Sandwich",
    description: "Tender grilled chicken breast with fresh lettuce, tomatoes, and mayo on whole grain bread",
    price: 8.99,
    category: "Main Course",
    type: "food",
    image: "🥪",
    available: true,
    preparationTime: 10,
    ingredients: ["Chicken breast", "Whole grain bread", "Lettuce", "Tomatoes", "Mayo"],
    allergens: ["Gluten", "Eggs"],
    nutritionalInfo: { calories: 420, protein: 35, carbs: 28, fat: 18 }
  },
  {
    id: 2,
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with parmesan cheese, croutons, and caesar dressing",
    price: 6.99,
    category: "Salads",
    type: "food",
    image: "🥗",
    available: true,
    preparationTime: 5,
    ingredients: ["Romaine lettuce", "Parmesan cheese", "Croutons", "Caesar dressing"],
    allergens: ["Dairy", "Gluten"],
    nutritionalInfo: { calories: 280, protein: 12, carbs: 15, fat: 22 }
  },
  {
    id: 3,
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice, 100% natural with no added sugar",
    price: 3.99,
    category: "Beverages",
    type: "beverage",
    image: "🍊",
    available: true,
    preparationTime: 2,
    ingredients: ["Fresh oranges"],
    allergens: [],
    nutritionalInfo: { calories: 110, protein: 2, carbs: 26, fat: 0 }
  },
  {
    id: 4,
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella, tomato sauce, and basil",
    price: 12.99,
    category: "Main Course",
    type: "food",
    image: "🍕",
    available: true,
    preparationTime: 15,
    ingredients: ["Pizza dough", "Mozzarella", "Tomato sauce", "Fresh basil"],
    allergens: ["Gluten", "Dairy"],
    nutritionalInfo: { calories: 520, protein: 22, carbs: 58, fat: 24 }
  },
  {
    id: 5,
    name: "Chocolate Chip Cookies",
    description: "Warm, freshly baked chocolate chip cookies (pack of 3)",
    price: 4.99,
    category: "Desserts",
    type: "snack",
    image: "🍪",
    available: true,
    preparationTime: 3,
    ingredients: ["Flour", "Chocolate chips", "Butter", "Sugar", "Eggs"],
    allergens: ["Gluten", "Dairy", "Eggs"],
    nutritionalInfo: { calories: 380, protein: 5, carbs: 48, fat: 19 }
  },
  {
    id: 6,
    name: "Iced Coffee",
    description: "Cold brew coffee served over ice with optional milk and sugar",
    price: 2.99,
    category: "Beverages",
    type: "beverage",
    image: "☕",
    available: true,
    preparationTime: 3,
    ingredients: ["Coffee beans", "Ice", "Milk (optional)", "Sugar (optional)"],
    allergens: ["Dairy (if milk added)"],
    nutritionalInfo: { calories: 50, protein: 1, carbs: 8, fat: 2 }
  }
];

const categories = ["All", "Main Course", "Salads", "Beverages", "Desserts", "Snacks"];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState(menuItems);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [selectedCategory, searchTerm]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      type: item.type,
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
      description: item.description,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Our Menu</h1>
              <p className="text-gray-600">Discover our delicious selection of fresh food and beverages</p>
            </div>
            <Link href="/" className="text-[#ff6b35] hover:text-[#e55a2b] font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-card animate-fade-in-up">
                {/* Item Image */}
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <span className="text-6xl">{item.image}</span>
                </div>

                {/* Item Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <span className={`status-badge ${item.available ? 'status-ready' : 'status-cancelled'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-[#ff6b35]">${item.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">⏱️ {item.preparationTime} min</span>
                  </div>

                  {/* Nutritional Info */}
                  {item.nutritionalInfo && (
                    <div className="text-xs text-gray-500 mb-4">
                      {item.nutritionalInfo.calories} cal • {item.nutritionalInfo.protein}g protein
                    </div>
                  )}

                  {/* Allergens */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="text-xs text-red-600 mb-4">
                      ⚠️ Contains: {item.allergens.join(', ')}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.available}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      item.available
                        ? 'btn-primary hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {item.available ? 'Add to Cart' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Quick Order CTA */}
        {!isAuthenticated && (
          <div className="mt-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Want to Order?</h3>
            <p className="mb-6">Create an account to place orders and track your purchases</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white text-[#ff6b35] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Sign Up Now
              </Link>
              <Link href="/login" className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors">
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
