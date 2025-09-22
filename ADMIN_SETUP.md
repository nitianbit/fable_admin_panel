# Admin Setup Guide

## Creating a Sample Admin User

This guide will help you create a sample admin user for the RedBus Admin Panel.

### Prerequisites

1. Make sure MongoDB is running
2. Ensure your `.env` file has the correct `MONGODB_URI` configured
3. All required dependencies are installed (`npm install` or `yarn install`)

### Method 1: Using NPM/Yarn Script (Recommended)

Run the following command from the project root:

```bash
# Basic admin creation (without permissions)
npm run create-admin
# or
yarn create-admin

# Full admin creation (with all permissions)
npm run create-admin-full
# or
yarn create-admin-full
```

### Method 2: Direct Node.js Execution

```bash
# Basic admin creation (without permissions)
node scripts/create_admin.js

# Full admin creation (with all permissions)
node scripts/create_admin_with_permissions.js

# Or using the root script
node create_sample_admin.js
```

### Method 3: Manual Database Insertion

If you prefer to create the admin manually, you can use MongoDB Compass or mongo shell:

```javascript
// Connect to your MongoDB database
use redbus_admin

// Create admin user (password will be hashed automatically)
db.admins.insertOne({
  email: "admin@admin.com",
  password: "123456", // This will be hashed by bcrypt
  firstname: "Super",
  lastname: "Admin",
  phone: "9876543210",
  role: "admin",
  picture: "default.jpg",
  is_active: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Create admin details
db.admindetails.insertOne({
  adminId: ObjectId("ADMIN_ID_FROM_ABOVE"),
  company: "RedBus Admin Panel",
  address_1: "Admin Office",
  address_2: "Main Building",
  city: "Mumbai",
  pincode: "400001",
  is_agent: false,
  commission: 0
})
```

## Sample Admin Credentials

After running the script, you can login with:

- **Email:** `admin@admin.com`
- **Password:** `123456`
- **Role:** `admin`
- **Status:** `Active`

## What the Script Does

1. **Connects to MongoDB** using your configured connection string
2. **Checks for existing admin** to prevent duplicates
3. **Creates admin user** with the specified credentials
4. **Creates admin details** with company information
5. **Creates/assigns admin role** with appropriate permissions
6. **Displays success message** with login credentials

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Error: MongoDB connection error
   ```
   - Check if MongoDB is running
   - Verify `MONGODB_URI` in your `.env` file
   - Ensure network connectivity

2. **Admin Already Exists**
   ```
   Admin with email admin@admin.com already exists
   ```
   - This is normal if you've already created the admin
   - The script will show existing admin details

3. **Permission Errors**
   ```
   Error: EACCES: permission denied
   ```
   - Make sure you have write permissions to the project directory
   - Try running with `sudo` if necessary (Linux/Mac)

4. **Module Not Found**
   ```
   Error: Cannot find module
   ```
   - Run `npm install` or `yarn install` to install dependencies
   - Check if all required models exist in the correct paths

### Environment Variables

Make sure your `.env` file contains:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/redbus_admin

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION_INTERVAL=24

# Other required variables...
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change Default Password**: After first login, change the default password
2. **Use Strong Passwords**: Use complex passwords in production
3. **Environment Variables**: Never commit `.env` files to version control
4. **Database Access**: Restrict database access in production
5. **HTTPS**: Always use HTTPS in production environments

## Next Steps

After creating the admin user:

1. **Start the server**: `npm run dev` or `yarn dev`
2. **Access admin panel**: Navigate to your admin login page
3. **Login with credentials**: Use `admin@admin.com` / `123456`
4. **Change password**: Update to a secure password
5. **Configure permissions**: Set up role-based permissions as needed

## API Testing

You can test the admin login using the API:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.com",
    "password": "123456"
  }'
```

Expected response:
```json
{
  "token": {
    "tokenType": "Bearer",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "expiresIn": 1640995200
  }
}
```

## Support

If you encounter any issues:

1. Check the console output for detailed error messages
2. Verify your MongoDB connection
3. Ensure all dependencies are installed
4. Check file permissions
5. Review the environment configuration

For additional help, refer to the main documentation or contact the development team.
