# MongoDB Atlas Connection String Format

## Connection String Template

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/coffee_shop_db?retryWrites=true&w=majority
```

## Step-by-Step Guide

1. **Get your cluster connection string:**
   - MongoDB Atlas Dashboard → Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string

2. **Replace placeholders:**
   - `USERNAME` → Your database username
   - `PASSWORD` → Your database password (URL encode special characters)
   - `CLUSTER` → Your cluster name (e.g., `cluster0.xxxxx`)
   - Add `/coffee_shop_db` before the `?` to specify the database name

3. **Example:**
   ```
   Original: mongodb+srv://myuser:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   
   Modified: mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/coffee_shop_db?retryWrites=true&w=majority
   ```

4. **Special Characters in Password:**
   - If your password contains special characters, URL encode them:
     - `@` → `%40`
     - `#` → `%23`
     - `$` → `%24`
     - `%` → `%25`
     - `&` → `%26`
     - `+` → `%2B`
     - `=` → `%3D`
     - `?` → `%3F`

## Where to Use

### Option 1: Direct in server.js
Edit line 18 in `backend/server.js`:
```javascript
const MONGODB_URI = 'mongodb+srv://your-connection-string-here';
```

### Option 2: Environment Variable (.env file)
1. Create `.env` file in `backend` folder
2. Add:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string-here
   ```
3. Install dotenv: `npm install dotenv`
4. The server.js already supports dotenv (optional)

## Verification

After setting up, run:
```bash
cd backend
npm run seed
```

You should see:
- "Connected to MongoDB for seeding"
- "Sample menu items inserted successfully"

If you see connection errors, double-check:
- Username and password are correct
- IP address is whitelisted in MongoDB Atlas
- Database name is correct (`coffee_shop_db`)
- Connection string format is correct

