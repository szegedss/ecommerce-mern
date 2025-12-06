import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductGrid from '../components/ProductGrid';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`
      );
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-4">🐾 Pet Paradise</h1>
              <p className="text-xl mb-2">Everything Your Furry Friend Needs</p>
              <p className="text-gray-100 mb-6">
                Premium pet food, toys, accessories, and healthcare products for dogs, cats, and more!
              </p>
              <button
                onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
                className="px-8 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition"
              >
                Shop Now
              </button>
            </div>
            <div className="text-center">
              <div className="text-8xl">🦮 🐱 🐇</div>
              <p className="mt-4 text-lg">Your pets deserve the best!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-bold text-lg mb-2">100% Authentic</h3>
              <p className="text-gray-600">All products are guaranteed authentic and high-quality</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🚚</div>
              <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Free shipping on orders over $50, delivered in 3-5 days</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💚</div>
              <h3 className="font-bold text-lg mb-2">Pet Experts</h3>
              <p className="text-gray-600">Expert advice and recommendations for your pet's health</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Shop by Pet Type
          </h2>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => window.scrollTo({ top: 500 })}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
                >
                  <div className="text-5xl mb-3">{category.icon}</div>
                  <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            What Pet Owners Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah Johnson',
                pet: 'Golden Retriever - Max',
                review: 'Amazing selection of toys! Max loves his new treats. Highly recommend!',
                rating: 5,
              },
              {
                name: 'Mike Chen',
                pet: 'Cat - Whiskers',
                review: 'Fast delivery and great prices. My cat is so happy with the toys!',
                rating: 5,
              },
              {
                name: 'Emma Williams',
                pet: 'Rabbit - Fluffy',
                review: 'Best pet shop online. Quality products and excellent customer service!',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.review}"</p>
                <div>
                  <p className="font-bold text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.pet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
            Popular Pet Products
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Handpicked products for your beloved pets
          </p>
          <ProductGrid />
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Pamper Your Pet?</h2>
          <p className="text-xl mb-6">Browse our collection and find the perfect products</p>
          <button
            onClick={() => navigate('/cart')}
            className="px-8 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}
