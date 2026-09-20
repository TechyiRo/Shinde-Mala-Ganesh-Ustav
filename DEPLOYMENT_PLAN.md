# 🚀 शिंदे मळा गणेश उत्सव मंडळ — Production Deployment Plan

This document provides a comprehensive, step-by-step guide to deploying the **शिंदे मळा गणेश उत्सव मंडळ** system to production with real-time MongoDB Atlas integration, automated HTTPS/SSL, and mobile PWA support.

---

## 📋 Pre-Deployment Status & Checklist

| Item | Status | Details |
| :--- | :---: | :--- |
| **MongoDB Atlas Cluster** | ✅ Ready | `cluster0.cosetsy.mongodb.net` (Database: `ganesh_utsav`) |
| **Data Clean Slate** | ✅ Wiped | All sample receipts, expenses & events wiped; counters at ₹0 |
| **Official Committee** | ✅ Saved | अध्यक्ष: श्री. तुषार शिंदे \| खजिनदार: श्री. तुकाराम शिंदे व श्री. धनंजय शिंदे \| कार्यवाह: श्री. मानस शिंदे |
| **Mandal Address** | ✅ Saved | शिंदे मळा, हिंगणी दुमाला , ४१२२१० |
| **First Pavti Serial** | ✅ Ready | Starts at `GU-2026-0001` |
| **Production Build** | ✅ Tested | `npm run build` generates clean `dist/` bundle |
| **Security** | ✅ Protected | `.env` added to `.gitignore` to prevent credential exposure |

> [!IMPORTANT]
> **Atlas IP Whitelist Requirement:**
> In your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/):
> 1. Go to **Network Access** → **IP Access List**.
> 2. Click **Add IP Address**.
> 3. Select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
> 4. Click **Confirm**. This ensures cloud deployment platforms (Render, Railway, Vercel, etc.) can connect without IP restrictions.

---

## 🌐 Deployment Method 1: Render.com (Recommended)
*Render provides free cloud hosting with automatic SSL, continuous deployment from GitHub, and zero configuration.*

### Step 1: Push Project to GitHub
1. Initialize git and commit your files (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for production deployment"
   ```
2. Create a new repository on [GitHub](https://github.com/new) (private or public).
3. Link and push to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/shinde-mala-ganesh-utsav.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create Web Service on Render
1. Sign in to [Render.com](https://render.com/).
2. Click **New +** → **Web Service**.
3. Select your GitHub repository (`shinde-mala-ganesh-utsav`).
4. Configure the settings:
   - **Name**: `shinde-mala-ganesh-utsav` (or your preferred name)
   - **Region**: Singapore (Southeast Asia) or Frankfurt
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/index.js`
   - **Plan Type**: `Free`

### Step 3: Add Environment Variables
Under the **Environment Variables** section on Render, add:
- `MONGODB_URI` = `mongodb+srv://srohidas0_db_user:gOZTyVbZPwxaYNx2@cluster0.cosetsy.mongodb.net/ganesh_utsav?retryWrites=true&w=majority`
- `NODE_ENV` = `production`

### Step 4: Deploy
Click **Create Web Service**. Render will automatically:
- Install dependencies
- Build the optimized Vite frontend bundle
- Start the Express server
- Connect to MongoDB Atlas
- Provide a free HTTPS URL: `https://shinde-mala-ganesh-utsav.onrender.com`

---

## 🚂 Deployment Method 2: Railway.app (Alternative)

1. Sign up on [Railway.app](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository.
4. Go to **Variables** tab in your Railway service and add:
   - `MONGODB_URI` = `mongodb+srv://srohidas0_db_user:gOZTyVbZPwxaYNx2@cluster0.cosetsy.mongodb.net/ganesh_utsav?retryWrites=true&w=majority`
   - `NODE_ENV` = `production`
5. Under **Settings** → **Networking**, click **Generate Domain**.
6. Your app is live instantly with an HTTPS domain!

---

## 🖥️ Deployment Method 3: Self-Hosted Linux VPS (Ubuntu / Hostinger / DigitalOcean)

If you have your own VPS with a custom domain (e.g. `shindemalaganeshutsav.in`):

### 1. Connect to VPS and Install Node.js
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx
sudo npm install -g pm2
```

### 2. Clone & Build
```bash
cd /var/www
git clone https://github.com/<your-username>/shinde-mala-ganesh-utsav.git
cd shinde-mala-ganesh-utsav
npm install
npm run build
```

### 3. Create Production `.env`
```bash
nano .env
```
Paste:
```env
MONGODB_URI=mongodb+srv://srohidas0_db_user:gOZTyVbZPwxaYNx2@cluster0.cosetsy.mongodb.net/ganesh_utsav?retryWrites=true&w=majority
PORT=5000
NODE_ENV=production
```

### 4. Start with PM2 (Auto-Restart on Reboot)
```bash
pm2 start server/index.js --name "ganesh-utsav"
pm2 save
pm2 startup
```

### 5. Configure Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/ganesh-utsav
```
Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/ganesh-utsav /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Free SSL with Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📱 Mobile App / PWA Features After Deployment

Once deployed with HTTPS, users and committee members can:
1. Open the website on their smartphones (Chrome on Android, Safari on iPhone).
2. A banner will pop up: **"अॅप इन्स्टॉल करा (Install App)"**.
3. Tap **इन्स्टॉल (Install)** or "Add to Home Screen".
4. An app icon named **"गणेश पावती"** appears on the phone screen. It opens in full-screen standalone mode like a native app.
5. Receipt generation and WhatsApp sharing work seamlessly directly from the phone.

---

## 🔒 Admin Credentials & Security
- **Admin Login**:
  - Username: `admin`
  - Password: `ganpati2026`
- **Treasurer / Committee Member (Read-Only)**:
  - Username: `member`
  - Password: `member123`

---

## 🚀 Post-Deployment First Actions
1. **Open the live URL** and verify the public transparency portal shows:
   - एकूण जमा: ₹०
   - एकूण खर्च: ₹०
   - शिल्लक: ₹०
   - एकूण पावत्या: ०
2. **Log into Admin portal** (`admin` / `ganpati2026`).
3. **Issue first test receipt** (`GU-2026-0001`) to confirm live saving to MongoDB Atlas.
4. **Share public link** via WhatsApp to mandal members and devotees!
