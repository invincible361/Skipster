# 🚀 Deployment Guide for Netlify

## Frontend Deployment (Netlify)

### 1. Prepare Your Repository

1. **Create a new repository** on GitHub/GitLab
2. **Push your code** to the repository
3. **Ensure the `static` folder** contains all frontend files

### 2. Deploy to Netlify

1. **Go to [Netlify](https://netlify.com)**
2. **Click "New site from Git"**
3. **Connect your repository**
4. **Set build settings:**
   - **Build command:** (leave empty)
   - **Publish directory:** `static`
5. **Click "Deploy site"**

### 3. Configure Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

```
API_BASE_URL=https://your-backend-url.com
```

### 4. Update netlify.toml

Replace `https://your-backend-url.com` in `netlify.toml` with your actual backend URL.

## Backend Deployment Options

### Option A: Railway (Recommended)
1. **Go to [Railway](https://railway.app)**
2. **Connect your GitHub repository**
3. **Deploy the backend folder**
4. **Get your backend URL**

### Option B: Render
1. **Go to [Render](https://render.com)**
2. **Create a new Web Service**
3. **Connect your repository**
4. **Set build command:** `pip install -r requirements.txt`
5. **Set start command:** `python run_backend.py`

### Option C: Heroku
1. **Create a `Procfile`** with: `web: python run_backend.py`
2. **Deploy to Heroku**
3. **Get your backend URL**

## CORS Configuration

Make sure your backend allows requests from your Netlify domain:

```python
# In your FastAPI app
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-netlify-app.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Testing

1. **Deploy frontend to Netlify**
2. **Deploy backend to your chosen platform**
3. **Update `API_BASE_URL` in Netlify environment variables**
4. **Test the application**

## Troubleshooting

- **CORS errors:** Check your backend CORS configuration
- **API not found:** Verify your `API_BASE_URL` environment variable
- **Build errors:** Check that your `static` folder contains all files 