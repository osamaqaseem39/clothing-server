# 🚀 E-commerce NestJS API

A clean, scalable e-commerce API built with **NestJS** and **MongoDB**, following **SOLID principles** and implementing **Swagger documentation**.

## ✨ Features

- **Product Management** - Complete CRUD operations for products, categories, tags, and variations
- **Customer Management** - User registration, authentication, and profile management
- **Order Management** - Order creation, status tracking, and payment integration
- **Shopping Cart** - Guest and authenticated user cart management
- **Coupon System** - Flexible discount system with validation rules
- **Payment & Shipping** - Extensible payment and shipping method support
- **Swagger Documentation** - Interactive API documentation
- **MongoDB Integration** - Robust data persistence with Mongoose
- **Validation** - Request validation using class-validator
- **SOLID Principles** - Clean architecture with dependency injection

## 🏗️ Architecture

The project follows a **modular architecture** with clear separation of concerns:

```
src/
├── common/                 # Shared interfaces, DTOs, and base classes
│   ├── interfaces/        # Base interfaces for repositories and services
│   ├── repositories/      # Base repository implementation
│   ├── services/         # Base service implementation
│   └── dto/              # Common DTOs (pagination, etc.)
├── modules/               # Feature modules
│   ├── product/          # Product domain
│   ├── customer/         # Customer domain
│   ├── order/            # Order domain
│   ├── cart/             # Shopping cart domain
│   ├── coupon/           # Coupon and discount domain
│   ├── brand/            # Brand management domain
│   ├── payment/          # Payment processing
│   └── shipping/         # Shipping methods
└── main.ts               # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-nest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or start your local MongoDB instance
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access Swagger documentation**
   ```
   http://localhost:3000/api/docs
   ```

## 📚 API Endpoints

### Products
- `GET /products` - Get all published products
- `GET /products/search?q=query` - Search products
- `GET /products/category/:categoryId` - Get products by category
- `GET /products/brand/:brandId` - Get products by brand
- `GET /products/slug/:slug` - Get product by slug
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PATCH /products/:id` - Update product
- `PATCH /products/:id/stock` - Update product stock
- `DELETE /products/:id` - Delete product

### Customers
- `POST /customers` - Register new customer
- `POST /customers/login` - Customer login
- `GET /customers` - Get all customers
- `GET /customers/search` - Search customers by name
- `GET /customers/:id` - Get customer by ID
- `PATCH /customers/:id` - Update customer
- `PATCH /customers/:id/password` - Update password
- `DELETE /customers/:id` - Delete customer

### Brands
- `POST /brands` - Create new brand
- `GET /brands` - Get all brands with pagination
- `GET /brands/active` - Get all active brands
- `GET /brands/stats` - Get brand statistics
- `GET /brands/search?q=query` - Search brands
- `GET /brands/country/:country` - Get brands by country
- `GET /brands/slug/:slug` - Get brand by slug
- `GET /brands/:id` - Get brand by ID
- `PATCH /brands/:id` - Update brand
- `PATCH /brands/:id/toggle-status` - Toggle brand active status
- `PATCH /brands/:id/order` - Update brand sort order
- `DELETE /brands/:id` - Delete brand

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get all orders
- `GET /orders/stats` - Get order statistics
- `GET /orders/customer/:customerId` - Get customer orders
- `GET /orders/status/:status` - Get orders by status
- `GET /orders/payment/:paymentStatus` - Get orders by payment status
- `GET /orders/:id` - Get order by ID
- `PATCH /orders/:id` - Update order
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:id/payment-status` - Update payment status
- `DELETE /orders/:id` - Delete order

### Cart
- `POST /cart` - Create new cart
- `GET /cart/session/:sessionId` - Get cart by session ID
- `GET /cart/customer/:customerId` - Get cart by customer ID
- `POST /cart/:cartId/items` - Add item to cart
- `PATCH /cart/:cartId/items/:productId` - Update cart item quantity
- `DELETE /cart/:cartId/items/:productId` - Remove item from cart
- `DELETE /cart/:cartId/items` - Clear cart
- `POST /cart/:cartId/assign-customer` - Assign cart to customer
- `POST /cart/merge/:sessionId/:customerId` - Merge guest cart with customer cart
- `POST /cart/:cartId/calculate-total` - Calculate cart total
- `DELETE /cart/:cartId` - Delete cart

### Coupons
- `POST /coupons` - Create new coupon
- `GET /coupons` - Get all coupons
- `GET /coupons/valid` - Get valid coupons
- `GET /coupons/product/:productId` - Get coupons by product
- `GET /coupons/code/:code` - Get coupon by code
- `GET /coupons/:id` - Get coupon by ID
- `PATCH /coupons/:id` - Update coupon
- `POST /coupons/validate` - Validate coupon
- `POST /coupons/apply/:code` - Apply coupon
- `DELETE /coupons/:id` - Delete coupon

## 🔧 Development

### Code Structure

The project follows **SOLID principles**:

- **Single Responsibility Principle**: Each class has one responsibility
- **Open/Closed Principle**: Open for extension, closed for modification
- **Liskov Substitution Principle**: Derived classes can substitute base classes
- **Interface Segregation Principle**: Clients depend only on interfaces they use
- **Dependency Inversion Principle**: High-level modules don't depend on low-level modules

### Adding New Features

1. **Create Schema** - Define MongoDB schema with validation
2. **Create DTOs** - Define request/response data transfer objects
3. **Create Repository** - Extend BaseRepository for data access
4. **Create Service** - Extend BaseService for business logic
5. **Create Controller** - Define API endpoints with Swagger decorators
6. **Create Module** - Wire everything together

### Example Module Structure

```typescript
// Example: Adding a new Review module
src/modules/review/
├── schemas/
│   └── review.schema.ts
├── dto/
│   ├── create-review.dto.ts
│   └── update-review.dto.ts
├── repositories/
│   └── review.repository.ts
├── services/
│   └── review.service.ts
├── controllers/
│   └── review.controller.ts
└── review.module.ts
```

## 🧪 Testing

Testing setup can be added as needed. Jest is configured and ready to use.

## 📦 Build & Deploy

### Local Development
```bash
# Build the application
npm run build

# Start production server
npm run start:prod

# Development mode
npm run start:dev
```

### Vercel Deployment
The project is configured for Vercel serverless deployment:

1. **Automatic Deployment**: Push to main branch triggers deployment
2. **Manual Deployment**: Use Vercel CLI
   ```bash
   vercel --prod
   ```
3. **Environment Variables**: Set in Vercel dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Docker Deployment
```bash
# Build Docker image
docker build -t ecommerce-nest .

# Run container
docker run -p 3001:3001 ecommerce-nest
```

## 🔒 Security Features

- **Input Validation** - All inputs validated using class-validator
- **Password Hashing** - Bcrypt for secure password storage
- **CORS Protection** - Configurable cross-origin resource sharing
- **Rate Limiting** - Built-in rate limiting (can be extended)
- **Environment Variables** - Secure configuration management

## 🌟 Best Practices

- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Consistent error responses
- **Logging** - Structured logging (can be extended with Winston)
- **Documentation** - Comprehensive Swagger API documentation
- **Validation** - Request/response validation at multiple levels
- **Testing** - Unit and integration test coverage
- **Code Quality** - ESLint and Prettier configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the Swagger documentation at `/api/docs`
- Review the code examples in the controllers

## 📝 Notes

- This project is designed to run as a standalone NestJS application
- The application uses MongoDB for data persistence
- CORS is configured to allow requests from specified origins
- Swagger documentation is available at `/api/docs`
- Environment variables should be configured in `.env` file
- **Vercel Deployment**: Successfully configured for Vercel serverless deployment
- **Dual Mode**: Can run locally (`npm run start:dev`) or deploy to Vercel

---

**Built with ❤️ using NestJS and MongoDB** 