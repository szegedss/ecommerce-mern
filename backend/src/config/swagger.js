const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce MERN API',
      version: '1.0.0',
      description: 'API documentation for E-Commerce MERN Stack Application',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://pet-paradise-api.onrender.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            avatar: { type: 'string', example: 'https://cloudinary.com/avatar.jpg' },
            isVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            name: { type: 'string', example: 'John Doe' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
          },
        },

        // Product schemas
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name_th: { type: 'string', example: 'สินค้าทดสอบ' },
            name_en: { type: 'string', example: 'Test Product' },
            description_th: { type: 'string' },
            description_en: { type: 'string' },
            price: { type: 'number', example: 999.99 },
            finalPrice: { type: 'number', example: 899.99 },
            category: { type: 'string', example: 'Electronics' },
            stock: { type: 'integer', example: 100 },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  publicId: { type: 'string' },
                  isPrimary: { type: 'boolean' },
                },
              },
            },
            discount: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['percentage', 'fixed', 'none'] },
                value: { type: 'number' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
              },
            },
            rating: {
              type: 'object',
              properties: {
                average: { type: 'number', example: 4.5 },
                count: { type: 'integer', example: 25 },
              },
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ProductInput: {
          type: 'object',
          required: ['name_th', 'name_en', 'description_th', 'description_en', 'price', 'category', 'stock'],
          properties: {
            name_th: { type: 'string' },
            name_en: { type: 'string' },
            description_th: { type: 'string' },
            description_en: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            stock: { type: 'integer' },
          },
        },

        // Order schemas
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  quantity: { type: 'integer' },
                  image: { type: 'string' },
                },
              },
            },
            shippingAddress: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
                city: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' },
              },
            },
            subtotal: { type: 'number' },
            discount: { type: 'number' },
            tax: { type: 'number' },
            total: { type: 'number' },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // Category schemas
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name_th: { type: 'string' },
            name_en: { type: 'string' },
            slug: { type: 'string' },
            description_th: { type: 'string' },
            description_en: { type: 'string' },
            image: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },

        // Coupon schemas
        Coupon: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            uniqueCode: { type: 'string', example: 'SUMMER2024' },
            discountType: { type: 'string', enum: ['percentage', 'fixed'] },
            discountValue: { type: 'number' },
            minPurchaseAmount: { type: 'number' },
            maxDiscountAmount: { type: 'number' },
            startDate: { type: 'string', format: 'date-time' },
            expiryDate: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
          },
        },

        // Review schemas
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            product: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            title: { type: 'string' },
            comment: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            isVerifiedPurchase: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // Wishlist schemas
        WishlistItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            product: { $ref: '#/components/schemas/Product' },
            addedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 100 },
                pages: { type: 'integer', example: 5 },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'No token provided' },
            },
          },
        },
        ForbiddenError: {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Access denied. Admin privileges required.' },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Resource not found' },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Validation failed' },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product management' },
      { name: 'Categories', description: 'Category management' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Coupons', description: 'Coupon management' },
      { name: 'Reviews', description: 'Product reviews' },
      { name: 'Wishlist', description: 'User wishlist' },
      { name: 'Upload', description: 'File upload endpoints' },
      { name: 'Notifications', description: 'User notifications' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
