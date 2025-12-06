require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

const categories = [
  {
    name: 'Dogs',
    description: 'Everything for your canine companion',
    icon: '🦮',
    displayOrder: 1,
  },
  {
    name: 'Cats',
    description: 'Products for feline friends',
    icon: '🐱',
    displayOrder: 2,
  },
  {
    name: 'Small Animals',
    description: 'For rabbits, hamsters, and more',
    icon: '🐇',
    displayOrder: 3,
  },
  {
    name: 'Birds',
    description: 'Supplies for feathered friends',
    icon: '🦜',
    displayOrder: 4,
  },
  {
    name: 'Pet Food',
    description: 'Nutritious food for all pets',
    icon: '🍖',
    displayOrder: 5,
  },
  {
    name: 'Toys & Games',
    description: 'Keep your pet entertained',
    icon: '🎾',
    displayOrder: 6,
  },
];

const products = [
  // Dog Products
  {
    name: 'Premium Dog Food - Chicken',
    description: 'High-quality dog food with real chicken, perfect for all breeds',
    price: 29.99,
    category: 'pet-food',
    image: 'https://images.unsplash.com/photo-1585518419759-66ed3f93a1dc?w=500&h=500&fit=crop',
    stock: 50,
    rating: 4.8,
    reviews: 45,
  },
  {
    name: 'Dog Chew Toys Variety Pack',
    description: 'Set of 5 durable dog toys for chewing and playing',
    price: 19.99,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1568152950566-c1bf43f94db0?w=500&h=500&fit=crop',
    stock: 75,
    rating: 4.7,
    reviews: 62,
  },
  {
    name: 'Dog Bed - Orthopedic',
    description: 'Comfortable orthopedic dog bed for larger breeds',
    price: 89.99,
    category: 'dogs',
    image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500&h=500&fit=crop',
    stock: 20,
    rating: 4.9,
    reviews: 38,
  },
  {
    name: 'Dog Collar & Leash Set',
    description: 'Durable nylon collar and leash with reflective strips',
    price: 24.99,
    category: 'dogs',
    image: 'https://images.unsplash.com/photo-1617885868960-b944b2dc17b0?w=500&h=500&fit=crop',
    stock: 40,
    rating: 4.6,
    reviews: 28,
  },
  {
    name: 'Dog Grooming Kit',
    description: 'Complete grooming kit with brush, nail clipper, and shampoo',
    price: 44.99,
    category: 'dogs',
    image: 'https://images.unsplash.com/photo-1537151608828-8661a20bfd11?w=500&h=500&fit=crop',
    stock: 30,
    rating: 4.8,
    reviews: 51,
  },

  // Cat Products
  {
    name: 'Premium Cat Food - Salmon',
    description: 'Nutritious cat food with real salmon and fish oil',
    price: 24.99,
    category: 'pet-food',
    image: 'https://images.unsplash.com/photo-1563037404-61f69b0ae0f0?w=500&h=500&fit=crop',
    stock: 60,
    rating: 4.7,
    reviews: 44,
  },
  {
    name: 'Cat Scratching Post',
    description: 'Tall scratching post with multiple levels and hiding spots',
    price: 59.99,
    category: 'cats',
    image: 'https://images.unsplash.com/photo-1546527868-ccfd7ee93dca?w=500&h=500&fit=crop',
    stock: 15,
    rating: 4.8,
    reviews: 33,
  },
  {
    name: 'Interactive Cat Toys Bundle',
    description: 'Set of 8 interactive toys including feathers, balls, and mice',
    price: 16.99,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03bf1a7dba?w=500&h=500&fit=crop',
    stock: 85,
    rating: 4.6,
    reviews: 56,
  },
  {
    name: 'Cat Bed - Plush',
    description: 'Soft plush cat bed perfect for napping and relaxing',
    price: 34.99,
    category: 'cats',
    image: 'https://images.unsplash.com/photo-1617880511169-35a8a5b1b0e3?w=500&h=500&fit=crop',
    stock: 45,
    rating: 4.7,
    reviews: 39,
  },
  {
    name: 'Cat Litter Box - Enclosed',
    description: 'Privacy-focused enclosed litter box with carbon filter',
    price: 54.99,
    category: 'cats',
    image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&h=500&fit=crop',
    stock: 25,
    rating: 4.5,
    reviews: 27,
  },

  // Small Animals
  {
    name: 'Rabbit Hay - Timothy Grass',
    description: 'Natural Timothy grass hay, essential for rabbit diet',
    price: 14.99,
    category: 'pet-food',
    image: 'https://images.unsplash.com/photo-1585518419759-66ed3f93a1dc?w=500&h=500&fit=crop',
    stock: 100,
    rating: 4.9,
    reviews: 72,
  },
  {
    name: 'Hamster Wheel - Silent',
    description: 'Large silent hamster wheel with smooth operation',
    price: 22.99,
    category: 'small-animals',
    image: 'https://images.unsplash.com/photo-1544899716781-dd0b26f9c183?w=500&h=500&fit=crop',
    stock: 35,
    rating: 4.7,
    reviews: 48,
  },
  {
    name: 'Rabbit Cage Setup',
    description: 'Complete rabbit cage with accessories and hideaway',
    price: 79.99,
    category: 'small-animals',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500&h=500&fit=crop',
    stock: 12,
    rating: 4.8,
    reviews: 34,
  },
  {
    name: 'Small Pet Treats Mix',
    description: 'Variety pack of treats for rabbits, hamsters, and guinea pigs',
    price: 11.99,
    category: 'pet-food',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=500&h=500&fit=crop',
    stock: 70,
    rating: 4.6,
    reviews: 41,
  },

  // Bird Products
  {
    name: 'Premium Bird Food Mix',
    description: 'Nutritious seed mix for parrots, canaries, and finches',
    price: 18.99,
    category: 'pet-food',
    image: 'https://images.unsplash.com/photo-1585518419759-66ed3f93a1dc?w=500&h=500&fit=crop',
    stock: 55,
    rating: 4.7,
    reviews: 36,
  },
  {
    name: 'Bird Cage - Large',
    description: 'Spacious bird cage suitable for medium to large birds',
    price: 129.99,
    category: 'birds',
    image: 'https://images.unsplash.com/photo-1444464666175-1642a527f621?w=500&h=500&fit=crop',
    stock: 8,
    rating: 4.9,
    reviews: 25,
  },
  {
    name: 'Bird Perches & Toys Set',
    description: 'Set of colorful wooden perches and toys for bird enrichment',
    price: 26.99,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1558036117-15693327271d?w=500&h=500&fit=crop',
    stock: 40,
    rating: 4.6,
    reviews: 29,
  },

  // General Toys
  {
    name: 'Tennis Ball Pack - 3pc',
    description: 'Durable tennis balls perfect for fetch games',
    price: 8.99,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1617887754475-37f8e21b5555?w=500&h=500&fit=crop',
    stock: 120,
    rating: 4.8,
    reviews: 95,
  },
  {
    name: 'Rope Tug Toy - Multicolor',
    description: 'Braided rope toy perfect for tug-of-war games',
    price: 9.99,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1616991337384-d5d2f7bc91c6?w=500&h=500&fit=crop',
    stock: 65,
    rating: 4.7,
    reviews: 43,
  },
  {
    name: 'Squeaky Toy Collection',
    description: 'Set of 6 various squeaky toys for dogs and cats',
    price: 12.99,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=500&h=500&fit=crop',
    stock: 50,
    rating: 4.5,
    reviews: 32,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create products with category references
    const productsWithCategoryIds = products.map((product) => {
      const categorySlug = product.category;
      const category = createdCategories.find((cat) => 
        cat.slug === categorySlug || cat.name.toLowerCase().replace(/\s/g, '-') === categorySlug
      );
      return {
        ...product,
        category: category?.slug || 'pet-food',
      };
    });

    const createdProducts = await Product.insertMany(productsWithCategoryIds);
    console.log(`Created ${createdProducts.length} products`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`\nCategories created:`);
    createdCategories.forEach((cat) => {
      console.log(`  - ${cat.icon} ${cat.name} (${cat.slug})`);
    });

    console.log(`\nProducts created: ${createdProducts.length} items`);
    console.log(`Total stock: ${createdProducts.reduce((sum, p) => sum + p.stock, 0)} items`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
