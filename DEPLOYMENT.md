# 🚀 Easy-Employee Production Deployment Guide

## Prerequisites
- [ ] GitHub account
- [ ] Netlify account (free tier)
- [ ] MongoDB Atlas account (free tier)
- [ ] Render/Railway account (for backend)

---

## Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. **Network Access**: Add `0.0.0.0/0` to allow connections from anywhere

---

## Part 2: Backend Deployment (Render - Recommended)

### Step 1: Prepare Backend
1. Create `backend/.env` file (copy from `.env.example`)
2. Fill in your MongoDB connection string
3. Generate a strong JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Step 2: Deploy to Render
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. **Settings**:
   - **Name**: `easy-employee-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

5. **Environment Variables** (Add these in Render dashboard):
   ```
   PORT=5500
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_generated_secret
   CLIENT_URL=https://your-app-name.netlify.app
   ```

6. Click "Create Web Service"
7. **Copy your backend URL** (e.g., `https://easy-employee-api.onrender.com`)

---

## Part 3: Frontend Deployment (Netlify)

### Step 1: Update Environment Variables
1. Open `frontend/.env.production`
2. Replace with your actual backend URL:
   ```
   REACT_APP_BASE_URL=https://easy-employee-api.onrender.com
   ```

### Step 2: Deploy to Netlify

#### Option A: Netlify CLI (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project root
cd Easy-Employee
netlify deploy --prod
```

#### Option B: Netlify Dashboard
1. Go to [Netlify](https://www.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. **Build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

5. **Environment variables**:
   - Add `REACT_APP_BASE_URL` with your backend URL

6. Click "Deploy site"

### Step 3: Update Backend CORS
1. Go back to Render dashboard
2. Update `CLIENT_URL` environment variable with your Netlify URL
3. Trigger a redeploy

---

## Part 4: Post-Deployment Configuration

### Update Backend CORS (if needed)
If you get CORS errors, update `backend/server.js`:
```javascript
const corsOption = {
    credentials: true,
    origin: [
        'http://localhost:3000',
        'https://your-app-name.netlify.app'  // Add your Netlify URL
    ]
}
```

### Test Your Deployment
1. Visit your Netlify URL
2. Try logging in
3. Test all features:
   - [ ] Authentication
   - [ ] Employee management
   - [ ] Team management
   - [ ] Attendance tracking
   - [ ] PDF generation
   - [ ] Chat functionality

---

## Troubleshooting

### Issue: "Network Error" or API not responding
- **Check**: Backend URL in `.env.production`
- **Check**: Backend is running on Render
- **Check**: CORS configuration includes your Netlify URL

### Issue: "Cannot connect to database"
- **Check**: MongoDB connection string is correct
- **Check**: IP whitelist includes `0.0.0.0/0`
- **Check**: Database user has correct permissions

### Issue: Routes not working (404 errors)
- **Check**: `_redirects` file exists in `frontend/public`
- **Check**: `netlify.toml` is in project root

### Issue: Environment variables not working
- **Netlify**: Check "Site settings" → "Environment variables"
- **Render**: Check "Environment" tab in service dashboard
- **Remember**: Restart/redeploy after changing env vars

---

## Monitoring & Maintenance

### Netlify
- **Logs**: Netlify Dashboard → Deploys → View logs
- **Analytics**: Available in dashboard
- **Custom domain**: Site settings → Domain management

### Render
- **Logs**: Service → Logs tab
- **Metrics**: Service → Metrics tab
- **Auto-deploy**: Enabled by default on git push

### MongoDB Atlas
- **Monitor**: Atlas Dashboard → Metrics
- **Alerts**: Configure in Atlas
- **Backups**: Available in paid tiers

---

## Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] JWT secret is strong and unique
- [ ] MongoDB has authentication enabled
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic on Netlify/Render)
- [ ] Sensitive data is not in frontend code
- [ ] API rate limiting is configured

---

## Cost Estimate

- **Netlify**: Free (100GB bandwidth, 300 build minutes/month)
- **Render**: Free (750 hours/month, sleeps after 15min inactivity)
- **MongoDB Atlas**: Free (512MB storage, shared cluster)

**Total**: $0/month for development/small projects

---

## Next Steps

1. Set up custom domain (optional)
2. Configure email notifications
3. Set up monitoring/alerts
4. Create backup strategy
5. Document API endpoints
6. Set up CI/CD pipeline

---

## Support

If you encounter issues:
1. Check Netlify/Render logs
2. Verify all environment variables
3. Test backend API directly (Postman/curl)
4. Check MongoDB connection

**Deployment completed! 🎉**
