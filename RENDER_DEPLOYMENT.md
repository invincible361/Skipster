# 🚀 Render + Netlify Deployment Guide

## Backend Deployment (Render)

### 1. Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository: `invincible361/Skipster`

### 2. Create Web Service
1. **Click "New +"** in your Render dashboard
2. **Select "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

#### Build Settings:
- **Name:** `skipster-backend`
- **Environment:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python run_backend.py`

#### Environment Variables:
Add these in the Render dashboard:
```
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
PYTHON_VERSION=3.11
```

### 3. Deploy
1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Copy your Render URL** (e.g., `https://skipster-backend.onrender.com`)

## Frontend Deployment (Netlify)

### 1. Deploy to Netlify
1. **Go to [Netlify](https://netlify.com)**
2. **Click "New site from Git"**
3. **Connect your GitHub repository:** `invincible361/Skipster`
4. **Set build settings:**
   - **Build command:** (leave empty)
   - **Publish directory:** `static`
5. **Click "Deploy site"**

### 2. Configure Environment Variables
1. **Go to Site settings > Environment variables**
2. **Add new variable:**
   - **Key:** `API_BASE_URL`
   - **Value:** `https://your-render-app-name.onrender.com`
   (Replace with your actual Render URL)

### 3. Update CORS Settings
Your backend is already configured to allow Netlify domains, but if you get CORS errors, update the backend CORS settings in `backend/main.py`.

## Testing Your Deployment

### 1. Test Backend
Visit your Render URL + `/docs` to see the API documentation:
```
https://your-render-app-name.onrender.com/docs
```

### 2. Test Frontend
1. **Visit your Netlify URL**
2. **Register a new user**
3. **Test the features:**
   - Upload PDF calendar
   - Use the calendar for holidays
   - Add classes to timetable
   - View pie chart

## Troubleshooting

### Common Issues:

#### 1. CORS Errors
- Check that your Render URL is in the CORS allowlist
- Update `backend/main.py` if needed

#### 2. API Not Found
- Verify your `API_BASE_URL` environment variable in Netlify
- Check that your Render service is running

#### 3. Build Errors
- Ensure all files are in the correct directories
- Check that `requirements.txt` is in the root directory

#### 4. Environment Variables
- Make sure API keys are set in Render
- Verify `API_BASE_URL` is set in Netlify

## URLs to Remember

- **Backend API:** `https://your-render-app-name.onrender.com`
- **Frontend:** `https://your-netlify-app.netlify.app`
- **API Docs:** `https://your-render-app-name.onrender.com/docs`

## Next Steps

1. **Custom domain** (optional)
2. **SSL certificates** (automatic with Netlify/Render)
3. **Monitoring** and analytics
4. **Backup** your data regularly

Your Academic Attendance Tracker is now live! 🎉 