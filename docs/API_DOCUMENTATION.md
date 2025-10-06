# 🚀 E-commerce API Documentation

This document provides a comprehensive overview of all available API endpoints in the E-commerce application.

## 📚 Table of Contents

- [Authentication](#authentication)
- [Products](#products)
- [Customers](#customers)
- [Brands](#brands)
- [Orders](#orders)
- [Cart](#cart)
- [Coupons](#coupons)
- [Payments](#payments)
- [Shipping](#shipping)
- [Common Features](#common-features)

## 🔐 Authentication

All API endpoints (except public ones) require Bearer token authentication.

```http
Authorization: Bearer <your-jwt-token>
```

## 🛍️ Products

### Base URL: `/products`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create a new product | ✅ |
| `GET` | `/` | Get all products with pagination | ❌ |
| `GET` | `/published` | Get published products | ❌ |
| `GET` | `/search` | Search products by query | ❌ |
| `GET` | `/category/:categoryId` | Get products by category | ❌ |
| `GET` | `/brand/:brandId` | Get products by brand | ❌ |
| `GET` | `/tag/:tagId` | Get products by tag | ❌ |
| `GET` | `/featured` | Get featured products | ❌ |
| `GET` | `/trending` | Get trending products | ❌ |
| `GET` | `/:id` | Get product by ID | ❌ |
| `PATCH` | `/:id` | Update product | ✅ |
| `DELETE` | `/:id` | Delete product | ✅ |

### Product Features
- **CRUD Operations**: Full create, read, update, delete functionality
- **Search & Filtering**: Advanced search with pagination
- **Category Management**: Organize products by categories
- **Brand Association**: Link products to brands
- **Tag System**: Flexible tagging system
- **Image Management**: Multiple product images with positioning
- **Variations**: Product variants (size, color, etc.)
- **Pricing**: Flexible pricing structure
- **Inventory**: Stock management
- **SEO**: Slug-based URLs and meta data

## 👥 Customers

### Base URL: `/customers`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create a new customer | ❌ |
| `POST` | `/login` | Customer login | ❌ |
| `GET` | `/` | Get all customers with pagination | ✅ |
| `GET` | `/search` | Search customers by query | ✅ |
| `GET` | `/:id` | Get customer by ID | ✅ |
| `PATCH` | `/:id` | Update customer | ✅ |
| `DELETE` | `/:id` | Delete customer | ✅ |
| `GET` | `/:id/orders` | Get customer orders | ✅ |
| `GET` | `/:id/addresses` | Get customer addresses | ✅ |

### Customer Features
- **Registration & Login**: Secure authentication system
- **Profile Management**: Personal information and preferences
- **Address Management**: Multiple shipping/billing addresses
- **Order History**: Complete order tracking
- **Security**: Password hashing and JWT tokens
- **Validation**: Input validation and sanitization

## 🏷️ Brands

### Base URL: `/brands`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create a new brand | ✅ |
| `GET` | `/` | Get all brands with pagination | ❌ |
| `GET` | `/active` | Get active brands | ❌ |
| `GET` | `/stats` | Get brand statistics | ❌ |
| `GET` | `/search` | Search brands by query | ❌ |
| `GET` | `/:id` | Get brand by ID | ❌ |
| `PATCH` | `/:id` | Update brand | ✅ |
| `DELETE` | `/:id` | Delete brand | ✅ |
| `GET` | `/:id/products` | Get products by brand | ❌ |

### Brand Features
- **Brand Management**: Create and manage product brands
- **SEO Optimization**: Slug-based URLs
- **Statistics**: Brand performance metrics
- **Product Association**: Link products to brands
- **Status Management**: Enable/disable brands

## 📦 Orders

### Base URL: `/orders`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create a new order | ✅ |
| `GET` | `/` | Get all orders with pagination | ✅ |
| `GET` | `/stats` | Get order statistics | ✅ |
| `GET` | `/customer/:customerId` | Get orders by customer | ✅ |
| `GET` | `/status/:status` | Get orders by status | ✅ |
| `GET` | `/:id` | Get order by ID | ✅ |
| `PATCH` | `/:id` | Update order | ✅ |
| `DELETE` | `/:id` | Delete order | ✅ |
| `PATCH` | `/:id/status` | Update order status | ✅ |
| `PATCH` | `/:id/cancel` | Cancel order | ✅ |

### Order Features
- **Order Processing**: Complete order lifecycle management
- **Status Tracking**: Multiple order statuses (pending, processing, shipped, delivered)
- **Customer Association**: Link orders to customers
- **Payment Integration**: Payment status tracking
- **Shipping Management**: Shipping address and method
- **Order History**: Complete order audit trail
- **Statistics**: Sales and order analytics

## 🛒 Cart

### Base URL: `/cart`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create a new cart | ❌ |
| `GET` | `/session/:sessionId` | Get cart by session ID | ❌ |
| `GET` | `/customer/:customerId` | Get cart by customer ID | ✅ |
| `POST` | `/:cartId/items` | Add item to cart | ❌ |
| `PATCH` | `/:cartId/items/:itemId` | Update cart item | ❌ |
| `DELETE` | `/:cartId/items/:itemId` | Remove item from cart | ❌ |
| `DELETE` | `/:cartId/items` | Clear cart | ❌ |
| `PATCH` | `/:cartId/merge` | Merge guest cart with customer cart | ✅ |
| `GET` | `/:cartId/summary` | Get cart summary | ❌ |

### Cart Features
- **Session Management**: Guest and customer cart support
- **Item Management**: Add, update, remove items
- **Cart Merging**: Merge guest cart with customer account
- **Pricing Calculation**: Real-time price updates
- **Inventory Validation**: Stock availability checking
- **Cart Persistence**: Save cart for later

## 🎫 Coupons

### Base URL: `/coupons`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create a new coupon | ✅ |
| `GET` | `/` | Get all coupons | ✅ |
| `GET` | `/valid` | Get valid coupons | ❌ |
| `GET` | `/product/:productId` | Get coupons by product | ❌ |
| `GET` | `/code/:code` | Get coupon by code | ❌ |
| `GET` | `/:id` | Get coupon by ID | ✅ |
| `PATCH` | `/:id` | Update coupon | ✅ |
| `DELETE` | `/:id` | Delete coupon | ✅ |
| `POST` | `/:id/validate` | Validate coupon | ❌ |

### Coupon Features
- **Discount Management**: Percentage and fixed amount discounts
- **Usage Limits**: Per-coupon and per-customer limits
- **Product Targeting**: Apply to specific products or categories
- **Time Restrictions**: Start and expiry dates
- **Validation**: Real-time coupon validation
- **Usage Tracking**: Track coupon usage statistics

## 💳 Payments

### Base URL: `/payments`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create a new payment | ✅ |
| `GET` | `/` | Get all payments with pagination | ✅ |
| `GET` | `/order/:orderId` | Get payment by order ID | ✅ |
| `GET` | `/customer/:customerId` | Get payments by customer | ✅ |
| `GET` | `/status/:status` | Get payments by status | ✅ |
| `GET` | `/method/:method` | Get payments by method | ✅ |
| `GET` | `/stats` | Get payment statistics | ✅ |
| `GET` | `/:id` | Get payment by ID | ✅ |
| `PATCH` | `/:id` | Update payment | ✅ |
| `PATCH` | `/:id/refund` | Process payment refund | ✅ |
| `PATCH` | `/:id/capture` | Capture payment | ✅ |
| `DELETE` | `/:id` | Delete payment | ✅ |

### Payment Features
- **Multiple Methods**: Credit card, PayPal, bank transfer support
- **Status Tracking**: Pending, completed, failed, refunded
- **Refund Processing**: Full and partial refunds
- **Payment Capture**: Pre-authorization support
- **Transaction History**: Complete payment audit trail
- **Statistics**: Payment analytics and reporting
- **Security**: Secure payment processing

## 🚚 Shipping

### Base URL: `/shipping`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/methods` | Create shipping method | ✅ |
| `GET` | `/methods` | Get all shipping methods | ❌ |
| `GET` | `/methods/active` | Get active shipping methods | ❌ |
| `GET` | `/methods/:id` | Get shipping method by ID | ❌ |
| `PATCH` | `/methods/:id` | Update shipping method | ✅ |
| `PATCH` | `/methods/:id/status` | Toggle shipping method status | ✅ |
| `DELETE` | `/methods/:id` | Delete shipping method | ✅ |
| `POST` | `/calculate` | Calculate shipping cost | ❌ |
| `GET` | `/zones` | Get shipping zones | ❌ |
| `GET` | `/tracking/:trackingNumber` | Track shipment | ❌ |

### Shipping Features
- **Method Management**: Create and configure shipping methods
- **Cost Calculation**: Dynamic shipping cost calculation
- **Zone Management**: Geographic shipping zones
- **Weight-based Pricing**: Per-kg additional costs
- **Delivery Estimates**: Estimated delivery times
- **Tracking**: Shipment tracking information
- **Status Management**: Enable/disable shipping methods

## 🔧 Common Features

### Pagination
All list endpoints support pagination with the following query parameters:

```http
GET /endpoint?page=1&limit=10&sort=createdAt&order=desc
```

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Field to sort by (default: createdAt)
- `order`: Sort order - `asc` or `desc` (default: desc)

### Response Format
All endpoints return consistent response formats:

**Success Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Validation error",
  "error": "Bad Request"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

### Data Validation
All endpoints use class-validator for input validation with detailed error messages.

### Rate Limiting
API endpoints are protected with rate limiting to prevent abuse.

### CORS
Cross-Origin Resource Sharing is enabled for web applications.

## 📖 Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api/docs
```

The Swagger UI provides:
- Interactive endpoint testing
- Request/response schemas
- Authentication setup
- Example requests
- Response examples

## 🚀 Getting Started

1. **Start the application:**
   ```bash
   npm run start:dev
   ```

2. **Access Swagger docs:**
   ```
   http://localhost:3000/api/docs
   ```

3. **Test endpoints:**
   - Use Swagger UI for interactive testing
   - Use Postman or similar tools for API testing
   - Include Bearer token for authenticated endpoints

## 🔒 Security Considerations

- All sensitive endpoints require authentication
- Input validation on all endpoints
- Rate limiting to prevent abuse
- CORS configuration for web security
- JWT token expiration
- Password hashing for user accounts

## 📝 Notes

- All timestamps are in ISO 8601 format
- IDs are MongoDB ObjectId strings
- Currency is USD by default (configurable)
- Pagination is 1-based (page 1, not 0)
- All endpoints return JSON responses
- Error messages are user-friendly and descriptive 