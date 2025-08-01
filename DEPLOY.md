# 🚀 Deploy Guide - RePDF Executive Suite

## Deploy Options

### 1. 🟢 **Vercel Deploy (Recommended)**

#### Prerequisites
- GitHub account
- Vercel account (free)
- Google Gemini API Key

#### Steps
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for production deploy"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repo
   - Set environment variables:
     - `GEMINI_API_KEY`: Your Google Gemini API key

3. **Auto-deploy**: Every push to main branch will trigger automatic deployment

---

### 2. 🔷 **Netlify Deploy**

#### Steps
1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag `dist` folder to deploy
   - Or connect GitHub repo for auto-deploy

3. **Environment Variables**:
   - Add `GEMINI_API_KEY` in Netlify dashboard

---

### 3. 🟡 **GitHub Pages**

#### Steps
1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/repdf"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

---

## 🔧 Production Build

Build the application for production:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

---

## 🌐 Environment Variables

For production deployment, you need:

- `GEMINI_API_KEY`: Google Gemini API key for OCR functionality

### Getting Google Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy the key for deployment

---

## 📱 Features Working in Production

✅ **Client-side only** - No server required  
✅ **PDF processing** - Complete client-side processing  
✅ **Multi-language** - Portuguese, English, Spanish  
✅ **Theme system** - Light/Dark modes  
✅ **OCR functionality** - Via Google Gemini API  
✅ **Responsive design** - Works on mobile/desktop  

---

## 🔒 Security Notes

- API keys are processed client-side
- No server-side data storage
- Files processed locally in browser
- Privacy-first approach

---

## 🚨 Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CORS Issues
- Ensure API keys are properly set
- Check browser console for errors
- Verify Gemini API key permissions

### Deploy Failures
- Check build logs
- Verify all dependencies are in package.json
- Ensure environment variables are set correctly