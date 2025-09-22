# Operator Management System - API Documentation

## Overview

The Operator Management System provides comprehensive CRUD operations for managing bus operators in the RedBus admin panel. This system includes both admin management capabilities and operator self-service features.

## Table of Contents

1. [Operator Model](#operator-model)
2. [Admin CRUD Operations](#admin-crud-operations)
3. [Operator Authentication](#operator-authentication)
4. [Operator Self-Service](#operator-self-service)
5. [API Endpoints](#api-endpoints)
6. [Frontend Integration](#frontend-integration)
7. [Error Handling](#error-handling)

## Operator Model

### Schema Fields

```javascript
{
  // Company Information
  companyName: String (required, indexed)
  companyCode: String (required, unique, uppercase, indexed)
  businessType: String (enum: ['Private', 'Government', 'Semi-Government', 'Cooperative'])
  
  // Contact Information
  email: String (required, unique, lowercase, indexed)
  phone: String (required, indexed)
  countryCode: String (default: "91")
  alternatePhone: String
  
  // Address Information
  address: {
    street: String
    city: String
    state: String
    pincode: String
    country: String (default: "India")
    coordinates: {
      type: String (default: "Point")
      coordinates: [Number] // [longitude, latitude]
    }
  }
  
  // Business Details
  registrationNumber: String (required, unique, indexed)
  gstNumber: String (indexed)
  panNumber: String (indexed)
  licenseNumber: String (required, indexed)
  licenseExpiryDate: Date (required)
  
  // Contact Person Details
  contactPerson: {
    name: String (required)
    designation: String
    phone: String (required)
    email: String (required)
  }
  
  // Documents
  documents: {
    registrationCertificate: String
    gstCertificate: String
    panCard: String
    licenseDocument: String
    insuranceDocument: String
    permitDocument: String
    logo: String (default: "default.jpg")
  }
  
  // Account Information
  password: String (min: 6, max: 128)
  
  // Status and Settings
  status: String (enum: ['Active', 'Inactive', 'Suspended', 'Pending'], default: 'Pending')
  isVerified: Boolean (default: false)
  isDeleted: Boolean (default: false)
  
  // Fleet Information
  fleetSize: Number (default: 0)
  maxFleetSize: Number (default: 100)
  maxNoOfSeats: Number (default: 50, min: 1, max: 100)
  
  // Commission and Payment Settings
  commissionRate: Number (default: 0, min: 0, max: 100)
  paymentTerms: String (enum: ['Daily', 'Weekly', 'Monthly'], default: 'Weekly')
  
  // Additional Information
  description: String
  website: String
  socialMedia: {
    facebook: String
    twitter: String
    instagram: String
    linkedin: String
  }
  
  // Device Information
  deviceToken: String (indexed)
  deviceType: Number (enum: [1, 2]) // 1: Android, 2: iOS
  deviceId: String
  deviceInfo: Object
  
  // Language and Preferences
  language: String (enum: ["en", "ar"], default: "en")
  
  // Timestamps
  lastLoginAt: Date
  verifiedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

## Admin CRUD Operations

### 1. Create Operator

**Endpoint:** `POST /v1/operators`

**Authentication:** Admin required

**Request Body:**
```json
{
  "companyName": "ABC Bus Services",
  "companyCode": "ABC001",
  "businessType": "Private",
  "email": "contact@abcservices.com",
  "phone": "9876543210",
  "countryCode": "91",
  "alternatePhone": "9876543211",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "registrationNumber": "REG123456",
  "gstNumber": "27ABCDE1234F1Z5",
  "panNumber": "ABCDE1234F",
  "licenseNumber": "LIC789012",
  "licenseExpiryDate": "2025-12-31",
  "contactPerson": {
    "name": "John Doe",
    "designation": "Manager",
    "phone": "9876543212",
    "email": "john@abcservices.com"
  },
  "password": "securePassword123",
  "status": "Pending",
  "fleetSize": 0,
  "maxFleetSize": 50,
  "maxNoOfSeats": 50,
  "commissionRate": 5,
  "paymentTerms": "Weekly",
  "description": "Premium bus service provider",
  "website": "https://abcservices.com",
  "socialMedia": {
    "facebook": "https://facebook.com/abcservices",
    "twitter": "https://twitter.com/abcservices"
  }
}
```

**Response:**
```json
{
  "message": "Operator created successfully.",
  "data": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "companyName": "ABC Bus Services",
    "companyCode": "ABC001",
    "email": "contact@abcservices.com",
    "status": "Pending",
    "isVerified": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "status": true
}
```

### 2. Get Operator List

**Endpoint:** `GET /v1/operators/search`

**Authentication:** Admin required

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10, max: 100)
- `global_search`: Search term for company name, code, email, etc.
- `status`: Filter by status
- `isVerified`: Filter by verification status
- `sort`: JSON string for sorting (e.g., `{"name": "companyName", "order": "asc"}`)
- `filters`: JSON string for advanced filtering

**Response:**
```json
{
  "data": {
    "totalRecords": 25,
    "operators": [
      {
        "ids": "64a1b2c3d4e5f6789abcdef0",
        "companyName": "ABC Bus Services",
        "companyCode": "ABC001",
        "businessType": "Private",
        "email": "contact@abcservices.com",
        "phone": "9876543210",
        "contactPerson": "John Doe",
        "fleetSize": 0,
        "maxFleetSize": 50,
        "maxNoOfSeats": 50,
        "status": "Pending",
        "isVerified": false,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 3. Get Single Operator

**Endpoint:** `GET /v1/operators/:operatorId`

**Authentication:** Admin required

**Response:**
```json
{
  "message": "Operator fetched successfully.",
  "data": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "companyName": "ABC Bus Services",
    "companyCode": "ABC001",
    "businessType": "Private",
    "email": "contact@abcservices.com",
    "phone": "9876543210",
    "address": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "registrationNumber": "REG123456",
    "licenseNumber": "LIC789012",
    "licenseExpiryDate": "2025-12-31T00:00:00.000Z",
    "contactPerson": {
      "name": "John Doe",
      "designation": "Manager",
      "phone": "9876543212",
      "email": "john@abcservices.com"
    },
    "status": "Pending",
    "isVerified": false,
    "fleetSize": 0,
    "maxFleetSize": 50,
    "maxNoOfSeats": 50,
    "commissionRate": 5,
    "paymentTerms": "Weekly",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "status": true
}
```

### 4. Update Operator

**Endpoint:** `PATCH /v1/operators/:operatorId`

**Authentication:** Admin required

**Request Body:** (Same as create, all fields optional)

**Response:**
```json
{
  "status": true,
  "message": "Operator updated successfully.",
  "data": {
    // Updated operator object
  }
}
```

### 5. Delete Operator

**Endpoint:** `DELETE /v1/operators/:operatorId`

**Authentication:** Admin required

**Response:**
```json
{
  "status": true,
  "message": "Operator deleted successfully.",
  "data": {
    // Deleted operator object
  }
}
```

### 6. Verify Operator

**Endpoint:** `PATCH /v1/operators/:operatorId/verify`

**Authentication:** Admin required

**Response:**
```json
{
  "status": true,
  "message": "Operator verified successfully.",
  "data": {
    // Updated operator object with isVerified: true
  }
}
```

### 7. Change Operator Status

**Endpoint:** `PATCH /v1/operators/:operatorId/status`

**Authentication:** Admin required

**Request Body:**
```json
{
  "status": "Active"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Operator status changed to Active successfully.",
  "data": {
    // Updated operator object
  }
}
```

### 8. Upload Operator Document

**Endpoint:** `PATCH /v1/operators/:operatorId/:documentType`

**Authentication:** Admin required

**Document Types:**
- `registrationCertificate`
- `gstCertificate`
- `panCard`
- `licenseDocument`
- `insuranceDocument`
- `permitDocument`
- `logo`

**Request:** Multipart form data with file

**Response:**
```json
{
  "message": "Operator document uploaded successfully.",
  "data": {
    "documentType": "logo",
    "pathUrl": "https://s3.amazonaws.com/bucket/operators/logo-123.jpg"
  },
  "status": true
}
```

## Operator Authentication

### 1. Operator Login

**Endpoint:** `POST /v1/auth/operator-login`

**Request Body:**
```json
{
  "email": "contact@abcservices.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": {
    "tokenType": "Bearer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "64a1b2c3d4e5f6789abcdef0.abc123...",
    "expiresIn": 1640995200
  },
  "operator": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "companyName": "ABC Bus Services",
    "companyCode": "ABC001",
    "email": "contact@abcservices.com",
    "userType": "operator"
  },
  "message": "Operator login successful"
}
```

### 2. Send Password Reset

**Endpoint:** `POST /v1/auth/operator-send-password-reset`

**Request Body:**
```json
{
  "email": "contact@abcservices.com"
}
```

**Response:**
```json
{
  "message": "We have successfully sent reset link to your email contact@abcservices.com.",
  "status": true
}
```

### 3. Reset Password

**Endpoint:** `POST /v1/auth/operator-reset-password`

**Request Body:**
```json
{
  "email": "contact@abcservices.com",
  "password": "newPassword123",
  "resetToken": "64a1b2c3d4e5f6789abcdef0.abc123..."
}
```

**Response:**
```json
{
  "message": "Your operator password has been changed successfully. You can now login with your new password",
  "status": true
}
```

## Operator Self-Service

### 1. Get Operator Profile

**Endpoint:** `GET /v1/operators/profile`

**Authentication:** Operator required

**Response:**
```json
{
  "message": "Operator profile fetched successfully.",
  "data": {
    // Complete operator profile
  },
  "status": true
}
```

### 2. Update Operator Profile

**Endpoint:** `PATCH /v1/operators/profile`

**Authentication:** Operator required

**Request Body:** (Limited fields - only allowed fields can be updated)
```json
{
  "phone": "9876543210",
  "alternatePhone": "9876543211",
  "address": {
    "street": "456 New Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400002"
  },
  "contactPerson": {
    "name": "Jane Doe",
    "designation": "Operations Manager",
    "phone": "9876543213",
    "email": "jane@abcservices.com"
  },
  "description": "Updated description",
  "website": "https://newabcservices.com"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Operator profile updated successfully.",
  "data": {
    // Updated operator profile
  }
}
```

### 3. Get Operator Dashboard

**Endpoint:** `GET /v1/operators/dashboard`

**Authentication:** Operator required

**Response:**
```json
{
  "message": "Operator dashboard data fetched successfully.",
  "data": {
    "operator": {
      // Operator profile data
    },
    "stats": {
      "totalBuses": 15,
      "activeBuses": 12,
      "fleetSize": 15,
      "maxFleetSize": 50,
      "maxNoOfSeats": 50,
      "commissionRate": 5,
      "paymentTerms": "Weekly"
    },
    "recentActivity": []
  },
  "status": true
}
```

## API Endpoints Summary

### Admin Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/v1/operators` | Create operator | Admin |
| `GET` | `/v1/operators/search` | List operators | Admin |
| `GET` | `/v1/operators/:operatorId` | Get operator | Admin |
| `PATCH` | `/v1/operators/:operatorId` | Update operator | Admin |
| `DELETE` | `/v1/operators/:operatorId` | Delete operator | Admin |
| `PATCH` | `/v1/operators/:operatorId/verify` | Verify operator | Admin |
| `PATCH` | `/v1/operators/:operatorId/status` | Change status | Admin |
| `PATCH` | `/v1/operators/:operatorId/:documentType` | Upload document | Admin |

### Authentication Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/v1/auth/operator-login` | Operator login | Public |
| `POST` | `/v1/auth/operator-send-password-reset` | Send reset email | Public |
| `POST` | `/v1/auth/operator-reset-password` | Reset password | Public |

### Operator Self-Service Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/v1/operators/profile` | Get profile | Operator |
| `PATCH` | `/v1/operators/profile` | Update profile | Operator |
| `GET` | `/v1/operators/dashboard` | Get dashboard | Operator |

## Frontend Integration

### 1. Operator Login Form

```javascript
// React component example
import React, { useState } from 'react';

const OperatorLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/v1/auth/operator-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.token) {
        // Store token and user info
        localStorage.setItem('operatorToken', data.token.accessToken);
        localStorage.setItem('userType', 'operator');
        localStorage.setItem('operatorData', JSON.stringify(data.operator));
        
        // Redirect to operator dashboard
        window.location.href = '/operator/dashboard';
      } else {
        alert('Login failed: ' + (data.message || 'Invalid credentials'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="operator-login-form">
      <h2>Operator Login</h2>
      
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>
      
      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter your password"
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login as Operator'}
      </button>
      
      <div className="form-links">
        <a href="/operator/forgot-password">Forgot Password?</a>
        <a href="/admin/login">Admin Login</a>
      </div>
    </form>
  );
};

export default OperatorLoginForm;
```

### 2. Authenticated API Calls

```javascript
// API utility functions
class OperatorAPI {
  static getAuthHeaders() {
    const token = localStorage.getItem('operatorToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getProfile() {
    const response = await fetch('/api/v1/operators/profile', {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  static async updateProfile(data) {
    const response = await fetch('/api/v1/operators/profile', {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async getDashboard() {
    const response = await fetch('/api/v1/operators/dashboard', {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }
}

// Usage in components
const OperatorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await OperatorAPI.getDashboard();
        setDashboardData(data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="operator-dashboard">
      <h1>Welcome, {dashboardData.operator.companyName}</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Buses</h3>
          <p>{dashboardData.stats.totalBuses}</p>
        </div>
        <div className="stat-card">
          <h3>Active Buses</h3>
          <p>{dashboardData.stats.activeBuses}</p>
        </div>
        <div className="stat-card">
          <h3>Fleet Size</h3>
          <p>{dashboardData.stats.fleetSize}/{dashboardData.stats.maxFleetSize}</p>
        </div>
        <div className="stat-card">
          <h3>Max Seats</h3>
          <p>{dashboardData.stats.maxNoOfSeats}</p>
        </div>
      </div>
    </div>
  );
};
```

### 3. Admin Operator Management

```javascript
// Admin operator management component
const AdminOperatorManagement = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      const response = await fetch('/api/v1/operators/search?page=1&per_page=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setOperators(data.data.operators);
    } catch (error) {
      console.error('Failed to fetch operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOperator = async (operatorId) => {
    if (confirm('Are you sure you want to delete this operator?')) {
      try {
        const response = await fetch(`/api/v1/operators/${operatorId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        
        if (response.ok) {
          fetchOperators(); // Refresh list
          alert('Operator deleted successfully');
        }
      } catch (error) {
        console.error('Failed to delete operator:', error);
        alert('Failed to delete operator');
      }
    }
  };

  const handleVerifyOperator = async (operatorId) => {
    try {
      const response = await fetch(`/api/v1/operators/${operatorId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      if (response.ok) {
        fetchOperators(); // Refresh list
        alert('Operator verified successfully');
      }
    } catch (error) {
      console.error('Failed to verify operator:', error);
      alert('Failed to verify operator');
    }
  };

  if (loading) return <div>Loading operators...</div>;

  return (
    <div className="admin-operator-management">
      <div className="header">
        <h1>Operator Management</h1>
        <button onClick={() => setShowCreateForm(true)}>
          Add New Operator
        </button>
      </div>

      <div className="operators-table">
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Company Code</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Max Seats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((operator) => (
              <tr key={operator.ids}>
                <td>{operator.companyName}</td>
                <td>{operator.companyCode}</td>
                <td>{operator.email}</td>
                <td>{operator.phone}</td>
                <td>
                  <span className={`status ${operator.status.toLowerCase()}`}>
                    {operator.status}
                  </span>
                </td>
                <td>
                  <span className={`verified ${operator.isVerified.toLowerCase()}`}>
                    {operator.isVerified}
                  </span>
                </td>
                <td>{operator.maxNoOfSeats}</td>
                <td>
                  <button onClick={() => handleVerifyOperator(operator.ids)}>
                    Verify
                  </button>
                  <button onClick={() => handleDeleteOperator(operator.ids)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateForm && (
        <OperatorCreateForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchOperators();
          }}
        />
      )}
    </div>
  );
};
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "status": false,
  "message": "Validation error message",
  "errors": {
    "field": "Error description"
  }
}
```

#### 401 Unauthorized
```json
{
  "status": false,
  "message": "Unauthorized access"
}
```

#### 403 Forbidden
```json
{
  "status": false,
  "message": "Access denied. Operator authentication required."
}
```

#### 404 Not Found
```json
{
  "status": false,
  "message": "Operator not found"
}
```

#### 409 Conflict
```json
{
  "status": false,
  "message": "Email already exists"
}
```

#### 500 Internal Server Error
```json
{
  "status": false,
  "message": "Internal server error"
}
```

### Error Handling in Frontend

```javascript
const handleApiError = (error, response) => {
  if (response?.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('operatorToken');
    localStorage.removeItem('userType');
    window.location.href = '/operator/login';
  } else if (response?.status === 403) {
    // Access denied
    alert('Access denied. Please contact administrator.');
  } else if (response?.status === 404) {
    // Resource not found
    alert('Operator not found.');
  } else if (response?.status === 409) {
    // Conflict (duplicate data)
    alert('This information already exists. Please use different values.');
  } else {
    // Generic error
    alert('An error occurred. Please try again.');
  }
};

// Usage in API calls
const updateProfile = async (data) => {
  try {
    const response = await fetch('/api/v1/operators/profile', {
      method: 'PATCH',
      headers: OperatorAPI.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error, response);
    throw error;
  }
};
```

## Security Considerations

1. **Authentication**: All operator endpoints require proper JWT authentication
2. **Authorization**: Operators can only access their own data
3. **Input Validation**: All inputs are validated using Joi schemas
4. **Password Security**: Passwords are hashed using bcrypt
5. **Token Expiration**: JWT tokens have expiration times
6. **Rate Limiting**: Consider implementing rate limiting for login attempts
7. **HTTPS**: Always use HTTPS in production
8. **CORS**: Configure CORS properly for your frontend domain

## Database Indexes

The following indexes are automatically created for optimal performance:

- `email` (unique)
- `companyCode` (unique)
- `registrationNumber` (unique)
- `phone` (indexed)
- `gstNumber` (indexed)
- `panNumber` (indexed)
- `licenseNumber` (indexed)
- `deviceToken` (indexed)
- `address.coordinates` (2dsphere for geospatial queries)
- `isDeleted` (for soft delete queries)

## Environment Variables

Make sure to set these environment variables:

```bash
# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION_INTERVAL=24

# S3 Configuration (for document uploads)
S3_BUCKET_OPERATOR=your_operator_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region

# Base URL
BASE_URL=http://localhost:3000/
FULLBASEURL=http://localhost:3000/
```

## Testing

### Sample Test Data

```javascript
const sampleOperator = {
  companyName: "Test Bus Services",
  companyCode: "TEST001",
  businessType: "Private",
  email: "test@testservices.com",
  phone: "9876543210",
  countryCode: "91",
  address: {
    street: "Test Street",
    city: "Test City",
    state: "Test State",
    pincode: "123456",
    country: "India"
  },
  registrationNumber: "TEST123456",
  licenseNumber: "TEST789012",
  licenseExpiryDate: "2025-12-31",
  contactPerson: {
    name: "Test User",
    designation: "Manager",
    phone: "9876543211",
    email: "testuser@testservices.com"
  },
  password: "testPassword123",
  status: "Pending",
  fleetSize: 0,
  maxFleetSize: 10,
  maxNoOfSeats: 50,
  commissionRate: 5,
  paymentTerms: "Weekly"
};
```

This documentation provides a comprehensive guide for implementing and using the Operator Management System. The system is designed to be scalable, secure, and easy to integrate with both admin and operator frontend applications.
