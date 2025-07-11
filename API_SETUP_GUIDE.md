# Property Management System API - Complete Setup Guide

## 🚀 Quick Start

This is a complete Property Management System API with Admin Authentication, Enhanced Property Management, and comprehensive file upload capabilities.

## 📁 Project Structure

```
backend06/
├── controllers/          # API Controllers
├── services/            # Business Logic Services  
├── models/              # Database Models (Sequelize)
├── routes/              # API Routes
├── middleware/          # Authentication & Upload Middleware
├── config/              # Database & Configuration
├── utils/               # Helper Functions & Validators
├── uploads/             # File Upload Directory
├── .env                 # Environment Variables
├── postman_collection.json # Complete Postman Collection
└── index.js             # Main Server File
```

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
The `.env` file has been created with default values. Update these values according to your setup:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=property_management
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=test@example.com
EMAIL_PASS=password

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### 3. Database Setup (PostgreSQL)

1. **Install PostgreSQL** if not already installed
2. **Create Database:**
```sql
CREATE DATABASE property_management;
```

3. **Run Database Migrations:**
```bash
# Run the setup script to create tables
npm run setup

# Seed initial data
npm run seed

# Seed property management specific data
npm run seed-property
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📋 API Features

### ✅ Fixed Issues:
1. **Missing EnhancedPropertyService.js** - ✅ Created complete service with all methods
2. **Import path issues** - ✅ Fixed all module imports for ES modules
3. **Missing helper functions** - ✅ Added generateSlug and other utilities
4. **Dependencies** - ✅ Installed all required packages
5. **Environment variables** - ✅ Created .env with default values

### 🎯 Complete API Endpoints:

#### **Authentication**
- `POST /api/auth/login` - User/Admin Login
- `POST /api/auth/register` - User Registration

#### **Enhanced Properties** (Complete CRUD + Advanced Features)
- `GET /api/properties` - Get all properties with filters
- `GET /api/properties/search` - Advanced property search
- `GET /api/properties/featured` - Get featured properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (with file uploads)
- `PUT /api/properties/:id` - Update property
- `PATCH /api/properties/:id/status` - Update property status
- `DELETE /api/properties/:id` - Delete property

#### **Property Verification**
- `POST /api/properties/:id/verify` - Verify property (Admin)
- `POST /api/properties/:id/reject` - Reject property (Admin)

#### **Property Images**
- `GET /api/properties/:id/images` - Get property images
- `POST /api/properties/:id/images` - Upload images (multipart/form-data)
- `DELETE /api/properties/images/:imageId` - Delete image

#### **Property Documents**
- `GET /api/properties/:id/documents` - Get property documents
- `POST /api/properties/:id/documents` - Upload documents (multipart/form-data)
- `DELETE /api/properties/documents/:docId` - Delete document

#### **Admin Management**
- `GET /api/admin` - Get all admins
- `POST /api/admin/create` - Create admin
- `PUT /api/admin/:id` - Update admin
- `DELETE /api/admin/:id` - Delete admin

#### **User Management**
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `PATCH /api/admin/users/:id/block` - Block user
- `PATCH /api/admin/users/:id/unblock` - Unblock user

#### **Dashboard & Analytics**
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/dashboard/activities` - Get recent activities
- `GET /api/admin/dashboard/analytics` - Get analytics data

#### **Owners**
- `GET /api/owners/:ownerId/properties` - Get owner properties

#### **System**
- `GET /health` - Health check endpoint

## 📮 Postman Collection

A complete Postman collection (`postman_collection.json`) has been created with:

### 🔑 Features:
1. **Global Variables** - `base_url` and `auth_token`
2. **Bearer Token Authentication** - Automatic token handling
3. **Form Data Support** - All file upload endpoints configured
4. **Complete Coverage** - All API endpoints included
5. **Sample Data** - Pre-filled with realistic test data

### 📥 Import Instructions:
1. Open Postman
2. Click "Import" 
3. Select `postman_collection.json`
4. Set the `base_url` variable to `http://localhost:3000`
5. Use the Login endpoint to get an auth token
6. Copy the token to the `auth_token` variable

### 🧪 Testing Workflow:
1. **Health Check** - Test server connectivity
2. **Login** - Get authentication token
3. **Create Property** - Test property creation with files
4. **Upload Images** - Test image upload functionality
5. **Upload Documents** - Test document upload
6. **Property Management** - Test CRUD operations
7. **Admin Functions** - Test admin operations

## 🔐 Authentication

The API uses JWT Bearer tokens. Include the token in requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Sample Login Request:
```json
POST /api/auth/login
{
  "email": "admin@example.com", 
  "password": "password123"
}
```

## 📁 File Upload Support

### **Property Images:**
- **Endpoint:** `POST /api/properties/:id/images`
- **Format:** `multipart/form-data`
- **Field:** `images` (multiple files)
- **Supported:** JPG, PNG, GIF, WebP

### **Property Documents:**
- **Endpoint:** `POST /api/properties/:id/documents`
- **Format:** `multipart/form-data`
- **Field:** `document` (single file)
- **Additional Fields:** `doc_type`, `document_name`
- **Supported:** PDF, DOC, DOCX, TXT

### **Property Creation with Files:**
- **Endpoint:** `POST /api/properties`
- **Format:** `multipart/form-data`
- **Fields:** All property data + `images[]` + location fields
- **Example:**
```
title: "Beautiful 2BHK Apartment"
property_type: "apartment"
listing_type: "rent"
price: "2500"
images: [file1.jpg, file2.jpg]
location[city]: "New York"
location[locality]: "Manhattan"
amenities: "[1, 2, 3]"
```

## 🎯 Property Data Structure

### **Core Fields:**
- `title`, `description`
- `property_type`: apartment, villa, house, plot, office, shop
- `listing_type`: rent, sale, lease
- `price`, `monthly_rent`, `security_deposit`
- `area`, `area_unit`, `bedroom`, `bathroom`, `balcony`
- `furnish_type`: furnished, unfurnished, semi-furnished
- `status`: draft, published, blocked, sold, rented

### **Location Fields:**
- `location[city]`, `location[locality]`
- `location[full_address]`, `location[pincode]`
- `latitude`, `longitude`

### **Advanced Features:**
- `is_featured`, `is_verified`
- `available_from`, `available_for`
- `amenities` (array of IDs)
- `features` (custom features array)

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error:**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Create database if it doesn't exist

2. **Module Import Errors:**
   - All imports fixed for ES modules
   - Check file extensions (.js)

3. **File Upload Issues:**
   - Ensure uploads directory exists
   - Check file permissions
   - Verify MAX_FILE_SIZE in .env

4. **Authentication Errors:**
   - Check JWT_SECRET in .env
   - Ensure token is included in requests
   - Token format: `Bearer YOUR_TOKEN`

## 🚀 Ready to Use!

The complete system is now ready with:
- ✅ All module imports fixed
- ✅ Complete EnhancedPropertyService implemented
- ✅ All dependencies installed
- ✅ Environment configured
- ✅ Comprehensive Postman collection
- ✅ File upload support for images and documents
- ✅ Complete authentication system
- ✅ Advanced property search and filtering
- ✅ Admin management system
- ✅ Dashboard analytics

**Start testing with the Postman collection and enjoy your fully functional Property Management API!** 🎉