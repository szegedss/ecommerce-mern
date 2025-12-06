require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

const categories = [
  {
    name_th: 'สุนัข',
    name_en: 'Dogs',
    slug: 'dogs',
    description_th: 'สินค้าทั้งหมดสำหรับเพื่อนสี่ขาของคุณ',
    description_en: 'Everything for your canine companion',
    icon: '🦮',
    displayOrder: 1,
  },
  {
    name_th: 'แมว',
    name_en: 'Cats',
    slug: 'cats',
    description_th: 'สินค้าสำหรับแมวใจดี',
    description_en: 'Products for feline friends',
    icon: '🐱',
    displayOrder: 2,
  },
  {
    name_th: 'สัตว์ขนาดเล็ก',
    name_en: 'Small Animals',
    slug: 'small-animals',
    description_th: 'สำหรับกระต่าย แฮมสเตอร์ และอื่น ๆ',
    description_en: 'For rabbits, hamsters, and more',
    icon: '🐇',
    displayOrder: 3,
  },
  {
    name_th: 'นก',
    name_en: 'Birds',
    slug: 'birds',
    description_th: 'อุปกรณ์สำหรับเพื่อนนกของคุณ',
    description_en: 'Supplies for feathered friends',
    icon: '🦜',
    displayOrder: 4,
  },
  {
    name_th: 'อาหารสัตว์เลี้ยง',
    name_en: 'Pet Food',
    slug: 'pet-food',
    description_th: 'อาหารที่มีประโยชน์สำหรับสัตว์เลี้ยงทั้งหมด',
    description_en: 'Nutritious food for all pets',
    icon: '🍖',
    displayOrder: 5,
  },
  {
    name_th: 'ของเล่นและเกม',
    name_en: 'Toys & Games',
    slug: 'toys-games',
    description_th: 'ให้สัตว์เลี้ยงของคุณมีความสุขและสนุกสนาน',
    description_en: 'Keep your pet entertained',
    icon: '🎾',
    displayOrder: 6,
  },
];

const products = [
  // Dog Products
  {
    name_th: 'อาหารสุนัขพรีเมี่ยม - ไก่',
    name_en: 'Premium Dog Food - Chicken',
    description_th: 'อาหารสุนัขคุณภาพสูงที่มีเนื้อไก่แท้ เหมาะสำหรับสุนัขทุกสายพันธุ์',
    description_en: 'High-quality dog food with real chicken, perfect for all breeds',
    price: 990,
    discount: {
      type: 'none',
      value: 0,
    },
    category: 'dogs',
    image: 'https://images.unsplash.com/photo-1585518419759-66ed3f93a1dc?w=500&h=500&fit=crop',
    stock: 50,
    rating: 4.8,
    reviews: 45,
  },
  {
    name_th: 'ชุดของเล่นแคบนสุนัข',
    name_en: 'Dog Chew Toys Variety Pack',
    description_th: 'ชุด 5 ของเล่นสุนัขทนทาน สำหรับการเคี้ยวและเล่น',
    description_en: 'Set of 5 durable dog toys for chewing and playing',
    price: 660,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1568152950566-c1bf43f94db0?w=500&h=500&fit=crop',
    stock: 75,
    rating: 4.7,
    reviews: 62,
  },
  {
    name_th: 'เตียงสุนัข - ออร์โธปีดิก',
    name_en: 'Dog Bed - Orthopedic',
    description_th: 'เตียงสุนัขออร์โธปีดิกสำหรับสุนัขพันธุ์ใหญ่',
    description_en: 'Comfortable orthopedic dog bed for larger breeds',
    price: 2970,
    category: 'dogs',
    image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=500&h=500&fit=crop',
    stock: 20,
    rating: 4.9,
    reviews: 38,
  },
  {
    name_th: 'ปลอกคอและสายจูง',
    name_en: 'Dog Collar & Leash Set',
    description_th: 'ปลอกคอและสายจูงไนลอนทนทาน พร้อมแถบสะท้อนแสง',
    description_en: 'Durable nylon collar and leash with reflective strips',
    price: 825,
    category: 'dogs',
    image: 'https://images.unsplash.com/photo-1617885868960-b944b2dc17b0?w=500&h=500&fit=crop',
    stock: 40,
    rating: 4.6,
    reviews: 28,
  },
  {
    name_th: 'ชุดสำหรับบำรุงรักษาสุนัข',
    name_en: 'Dog Grooming Kit',
    description_th: 'ชุดบำรุงรักษาสมบูรณ์พร้อมแปรง กรรไกรตัดเล็บ และแชมพู',
    description_en: 'Complete grooming kit with brush, nail clipper, and shampoo',
    price: 1485,
    category: 'dogs',
    image: 'https://images.unsplash.com/photo-1537151608828-8661a20bfd11?w=500&h=500&fit=crop',
    stock: 30,
    rating: 4.8,
    reviews: 51,
  },

  // Cat Products
  {
    name_th: 'อาหารแมวพรีเมี่ยม - ปลาแซลมอน',
    name_en: 'Premium Cat Food - Salmon',
    description_th: 'อาหารแมวที่มีประโยชน์พร้อมปลาแซลมอนแท้และน้ำมันปลา',
    description_en: 'Nutritious cat food with real salmon and fish oil',
    price: 825,
    category: 'pet-food',
    image: 'https://images.unsplash.com/photo-1563037404-61f69b0ae0f0?w=500&h=500&fit=crop',
    stock: 60,
    rating: 4.7,
    reviews: 44,
  },
  {
    name_th: 'เสาขูดแมว',
    name_en: 'Cat Scratching Post',
    description_th: 'เสาขูดสูงพร้อมหลายระดับและที่ซ่อนตัว',
    description_en: 'Tall scratching post with multiple levels and hiding spots',
    price: 1980,
    category: 'cats',
    image: 'https://images.unsplash.com/photo-1546527868-ccfd7ee93dca?w=500&h=500&fit=crop',
    stock: 15,
    rating: 4.8,
    reviews: 33,
  },
  {
    name_th: 'ชุดของเล่นแมวแบบโต้ตอบ',
    name_en: 'Interactive Cat Toys Bundle',
    description_th: 'ชุด 8 ของเล่นแบบโต้ตอบ รวมถึงขน ลูก และหนูของเล่น',
    description_en: 'Set of 8 interactive toys including feathers, balls, and mice',
    price: 561,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03bf1a7dba?w=500&h=500&fit=crop',
    stock: 85,
    rating: 4.6,
    reviews: 56,
  },
  {
    name_th: 'เตียงแมว - นุ่ม',
    name_en: 'Cat Bed - Plush',
    description_th: 'เตียงแมวนุ่มหนากำมะหลากเหมาะสำหรับการนอนหลับและพักผ่อน',
    description_en: 'Soft plush cat bed perfect for napping and relaxing',
    price: 1155,
    category: 'cats',
    image: 'https://images.unsplash.com/photo-1617880511169-35a8a5b1b0e3?w=500&h=500&fit=crop',
    stock: 45,
    rating: 4.7,
    reviews: 39,
  },
  {
    name_th: 'กล่องทรายแมว - ปิด',
    name_en: 'Cat Litter Box - Enclosed',
    description_th: 'กล่องทรายแบบปิดสำหรับความเป็นส่วนตัว พร้อมตัวกรองคาร์บอน',
    description_en: 'Privacy-focused enclosed litter box with carbon filter',
    price: 1815,
    category: 'cats',
    image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&h=500&fit=crop',
    stock: 25,
    rating: 4.5,
    reviews: 27,
  },

  // Small Animals
  {
    name_th: 'หญ้าต่อไป - Timothy',
    name_en: 'Rabbit Hay - Timothy Grass',
    description_th: 'หญ้า Timothy ธรรมชาติ เป็นสิ่งจำเป็นในอาหารกระต่าย',
    description_en: 'Natural Timothy grass hay, essential for rabbit diet',
    price: 495,
    category: 'pet-food',
    image: 'https://images.unsplash.com/photo-1585518419759-66ed3f93a1dc?w=500&h=500&fit=crop',
    stock: 100,
    rating: 4.9,
    reviews: 72,
  },
  {
    name_th: 'ล้อแฮมสเตอร์ - เงียบ',
    name_en: 'Hamster Wheel - Silent',
    description_th: 'ล้อแฮมสเตอร์ขนาดใหญ่ที่ทำงานอย่างเงียบ',
    description_en: 'Large silent hamster wheel with smooth operation',
    price: 759,
    category: 'small-animals',
    image: 'https://images.unsplash.com/photo-1544899716781-dd0b26f9c183?w=500&h=500&fit=crop',
    stock: 35,
    rating: 4.7,
    reviews: 48,
  },
  {
    name_th: 'ชุดกรงกระต่าย',
    name_en: 'Rabbit Cage Setup',
    description_th: 'ชุดกรงกระต่ายสมบูรณ์พร้อมอุปกรณ์เสริมและที่ซ่อนตัว',
    description_en: 'Complete rabbit cage with accessories and hideaway',
    price: 2640,
    category: 'small-animals',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500&h=500&fit=crop',
    stock: 12,
    rating: 4.8,
    reviews: 34,
  },
  {
    name_th: 'ชุดขนมสัตว์เล็ก',
    name_en: 'Small Pet Treats Mix',
    description_th: 'ชุดขนมสำหรับกระต่าย แฮมสเตอร์ และหนู',
    description_en: 'Variety pack of treats for rabbits, hamsters, and guinea pigs',
    price: 396,
    category: 'pet-food',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=500&h=500&fit=crop',
    stock: 70,
    rating: 4.6,
    reviews: 41,
  },

  // Bird Products
  {
    name_th: 'ส่วนผสมอาหารนกพรีเมี่ยม',
    name_en: 'Premium Bird Food Mix',
    description_th: 'ส่วนผสมเมล็ดที่มีประโยชน์สำหรับนกแก้ว นกกรงขัง และนกหว่าน',
    description_en: 'Nutritious seed mix for parrots, canaries, and finches',
    price: 627,
    category: 'pet-food',
    image: 'https://images.unsplash.com/photo-1585518419759-66ed3f93a1dc?w=500&h=500&fit=crop',
    stock: 55,
    rating: 4.7,
    reviews: 36,
  },
  {
    name_th: 'กรงนก - ขนาดใหญ่',
    name_en: 'Bird Cage - Large',
    description_th: 'กรงนกที่กว้างขวางเหมาะสำหรับนกขนาดกลางถึงใหญ่',
    description_en: 'Spacious bird cage suitable for medium to large birds',
    price: 4290,
    category: 'birds',
    image: 'https://images.unsplash.com/photo-1444464666175-1642a527f621?w=500&h=500&fit=crop',
    stock: 8,
    rating: 4.9,
    reviews: 25,
  },
  {
    name_th: 'ชุดเสา止และของเล่นนก',
    name_en: 'Bird Perches & Toys Set',
    description_th: 'ชุดของเล่นไม้สีสดใสและเสาปักสำหรับการอุดหนุนของนก',
    description_en: 'Set of colorful wooden perches and toys for bird enrichment',
    price: 890,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1558036117-15693327271d?w=500&h=500&fit=crop',
    stock: 40,
    rating: 4.6,
    reviews: 29,
  },

  // General Toys
  {
    name_th: 'ชุดลูกเทนนิส - 3 ชิ้น',
    name_en: 'Tennis Ball Pack - 3pc',
    description_th: 'ลูกเทนนิสทนทาน เหมาะสำหรับเกมว่าง',
    description_en: 'Durable tennis balls perfect for fetch games',
    price: 297,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1617887754475-37f8e21b5555?w=500&h=500&fit=crop',
    stock: 120,
    rating: 4.8,
    reviews: 95,
  },
  {
    name_th: 'ของเล่นเชือก - หลากสี',
    name_en: 'Rope Tug Toy - Multicolor',
    description_th: 'ของเล่นเชือกทอมีสีหลากหลาย เหมาะสำหรับเกมเชือกที่ดึง',
    description_en: 'Braided rope toy perfect for tug-of-war games',
    price: 330,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1616991337384-d5d2f7bc91c6?w=500&h=500&fit=crop',
    stock: 65,
    rating: 4.7,
    reviews: 43,
  },
  {
    name_th: 'ชุดของเล่นกรีดร้อง',
    name_en: 'Squeaky Toy Collection',
    description_th: 'ชุด 6 ของเล่นกรีดร้องต่างๆ สำหรับสุนัขและแมว',
    description_en: 'Set of 6 various squeaky toys for dogs and cats',
    price: 429,
    category: 'toys-games',
    image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=500&h=500&fit=crop',
    stock: 50,
    rating: 4.5,
    reviews: 32,
  },
];

const coupons = [
  {
    code_th: 'ลดราคา 10% ทั่วไป',
    code_en: 'General 10% Off',
    uniqueCode: 'SAVE10',
    description_th: 'ลดราคา 10% สำหรับสินค้าทั้งหมด',
    description_en: '10% off on all products',
    discountType: 'percentage',
    discountValue: 10,
    minPurchaseAmount: 0,
    maxDiscountAmount: null,
    startDate: new Date('2025-12-01'),
    expiryDate: new Date('2025-12-31'),
    maxUsagePerUser: 5,
    totalUsageLimit: 100,
    isActive: true,
  },
  {
    code_th: 'ลดราคา 20% สินค้าหมวดอาหาร',
    code_en: 'Pet Food 20% Off',
    uniqueCode: 'FOOD20',
    description_th: 'ลดราคา 20% สำหรับอาหารสัตว์เลี้ยง',
    description_en: '20% off on pet food products',
    discountType: 'percentage',
    discountValue: 20,
    minPurchaseAmount: 990,
    maxDiscountAmount: 1650,
    startDate: new Date('2025-12-01'),
    expiryDate: new Date('2025-12-31'),
    maxUsagePerUser: 3,
    totalUsageLimit: 50,
    isActive: true,
  },
  {
    code_th: 'ลด 165 บาท สำหรับซื้อ 1650 ขึ้นไป',
    code_en: 'Spend 1650฿ Get 165฿ Off',
    uniqueCode: 'SAVE5OVER50',
    description_th: 'ลด 165 บาท เมื่อซื้อ 1650 บาทขึ้นไป',
    description_en: '165฿ off when you spend 1650฿ or more',
    discountType: 'fixed',
    discountValue: 165,
    minPurchaseAmount: 1650,
    maxDiscountAmount: null,
    startDate: new Date('2025-12-01'),
    expiryDate: new Date('2026-01-31'),
    maxUsagePerUser: 10,
    totalUsageLimit: 200,
    isActive: true,
  },
  {
    code_th: 'ลดราคา 15% ของเล่นและเกม',
    code_en: 'Toys & Games 15% Off',
    uniqueCode: 'TOYS15',
    description_th: 'ลดราคา 15% สำหรับของเล่นและเกม',
    description_en: '15% off on toys and games',
    discountType: 'percentage',
    discountValue: 15,
    minPurchaseAmount: 0,
    maxDiscountAmount: 990,
    startDate: new Date('2025-12-01'),
    expiryDate: new Date('2025-12-15'),
    maxUsagePerUser: 2,
    totalUsageLimit: 75,
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    const Coupon = require('./src/models/Coupon');
    const User = require('./src/models/User');
    await Coupon.deleteMany({});
    console.log('Cleared existing data');

    // Get admin user for creating coupons
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('Admin user not found. Please create admin user first with: node create-admin.js');
    }

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create products with category references
    const productsWithCategoryIds = products.map((product) => {
      const categorySlug = product.category;
      const category = createdCategories.find((cat) => 
        cat.slug === categorySlug
      );
      return {
        ...product,
        category: category?.slug || 'pet-food',
      };
    });

    const createdProducts = await Product.insertMany(productsWithCategoryIds);
    console.log(`Created ${createdProducts.length} products`);

    // Create coupons
    if (adminUser) {
      const couponsWithAdmin = coupons.map((coupon) => ({
        ...coupon,
        createdBy: adminUser._id,
      }));
      const createdCoupons = await Coupon.insertMany(couponsWithAdmin);
      console.log(`Created ${createdCoupons.length} coupons`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`\nCategories created:`);
    createdCategories.forEach((cat) => {
      console.log(`  - ${cat.icon} ${cat.name_th} (${cat.name_en}) - ${cat.slug}`);
    });

    console.log(`\nProducts created: ${createdProducts.length} items`);
    console.log(`Total stock: ${createdProducts.reduce((sum, p) => sum + p.stock, 0)} items`);

    if (adminUser) {
      console.log('\nAvailable coupon codes:');
      coupons.forEach((coupon) => {
        console.log(`  - ${coupon.uniqueCode}: ${coupon.code_en} (${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '฿'})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
