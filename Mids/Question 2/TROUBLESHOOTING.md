# MongoDB Connection Troubleshooting

## Error: "bad auth : authentication failed"

This error means your MongoDB Atlas username or password is incorrect. Follow these steps:

### Step 1: Verify Database User in MongoDB Atlas

1. **Log into MongoDB Atlas Dashboard:**
   - Go to https://cloud.mongodb.com
   - Sign in with your account

2. **Check Database Users:**
   - Click on "Database Access" in the left sidebar
   - You should see a list of database users
   - Verify the username matches: `mani87654321manimani`
   - If the user doesn't exist, create a new one

3. **Create/Edit Database User (if needed):**
   - Click "Add New Database User" or edit existing user
   - Choose "Password" authentication method
   - Username: `mani87654321manimani` (or create a new one)
   - Password: Enter your password (remember it!)
   - User Privileges: Select "Atlas admin" or "Read and write to any database"
   - Click "Add User" or "Update User"

### Step 2: Get Connection String from Atlas

1. **Go to Clusters:**
   - Click "Clusters" in the left sidebar
   - You should see your cluster (cluster0.o7ltit)

2. **Get Connection String:**
   - Click "Connect" button on your cluster
   - Choose "Connect your application"
   - Select "Node.js" as driver
   - Copy the connection string (it will look like):
     ```
     mongodb+srv://<username>:<password>@cluster0.o7ltit.mongodb.net/?retryWrites=true&w=majority
     ```

3. **Replace Placeholders:**
   - Replace `<username>` with your actual database username
   - Replace `<password>` with your actual database password
   - Add `/coffee_shop_db` before the `?` to specify database name
   - Final format:
     ```
     mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.o7ltit.mongodb.net/coffee_shop_db?retryWrites=true&w=majority
     ```

### Step 3: Update Connection String

1. **Open `backend/server.js`:**
   - Find line 21 with `const MONGODB_URI`
   - Replace the connection string with the one from Step 2

2. **Open `backend/seed.js`:**
   - Find line 12 with `const MONGODB_URI`
   - Replace the connection string with the same one

### Step 4: Check Network Access

1. **Go to Network Access:**
   - Click "Network Access" in the left sidebar
   - Make sure your IP address is whitelisted
   - Or add `0.0.0.0/0` to allow access from anywhere (for development only)

### Step 5: Special Characters in Password

If your password contains special characters, you need to URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`

### Step 6: Test Connection

After updating, test the connection:

```bash
cd backend
npm run seed
```

You should see:
- "Connected to MongoDB for seeding"
- "Sample menu items inserted successfully"

## Common Issues

### Issue 1: User doesn't exist
**Solution:** Create a new database user in MongoDB Atlas

### Issue 2: Wrong password
**Solution:** Reset the password in MongoDB Atlas or use the correct password

### Issue 3: Password has special characters
**Solution:** URL encode the special characters in the connection string

### Issue 4: IP not whitelisted
**Solution:** Add your IP address or `0.0.0.0/0` in Network Access

### Issue 5: Wrong cluster
**Solution:** Make sure you're using the correct cluster name (cluster0.o7ltit)

## Quick Fix: Get Fresh Connection String

The easiest way is to get a fresh connection string directly from MongoDB Atlas:

1. Atlas Dashboard → Clusters → Connect
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<username>` and `<password>` with your actual credentials
5. Add `/coffee_shop_db` before the `?`
6. Update both `server.js` and `seed.js`

