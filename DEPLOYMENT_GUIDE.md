# Deployment Guide: Hybrid Vercel + Railway (Docker Hub)

This guide walks you through deploying the **Frontend** to Vercel and the **Backend** to Railway using a custom Docker image.

## 1. Frontend Deployment (Vercel)
*Already Deployed.*
- **URL**: `https://tts-project-edloj8o6n-amine-lahbibs-projects.vercel.app`
- **Config**: Ensure `frontend/js/config.js` or `env.js` points to your backend URL (Set in Step 2).

## 2. Backend Deployment (Railway via Docker Hub)

We are using a **Docker Image** deployment strategy because the 1.4GB models are too large for direct upload but fit in a Docker image.

### Step 1: Code & Build (Completed)
- **Image**: `aminlahbib/tts-project-backend:latest`
- **Status**: Pushed to Docker Hub. Contains all models.

### Step 2: Deploy on Railway
1.  Go to the **[Railway Dashboard](https://railway.com/)**.
2.  Click **"New Project"** -> **"Deploy from Docker Image"**.
3.  Enter the image name:
    ```
    aminlahbib/tts-project-backend:latest
    ```
4.  Click **Deploy**.
5.  Wait for the build/deploy to finish (~2-3 mins).

### Step 3: Public URL
1.  In Railway, click on the **Service** card.
2.  Go to **Settings** -> **Networking**.
3.  Click **"Generate Domain"** (if one isn't there already).
    *   *Example*: `https://tts-project-backend-production.up.railway.app`
4.  Copy this URL.

## 3. Connect Frontend
1.  Go to your **Vercel Project Settings** -> **General** -> **Build & Development Settings**.
2.  Update/Add the **Build Command** to inject the backend URL:
    ```bash
    echo "window.TTS_API_URL='https://YOUR-RAILWAY-URL.up.railway.app'" > frontend/js/env.js
    ```
3.  **Redeploy** the Frontend.

## Verification
- **Check Backend**: Visit `https://YOUR-RAILWAY-URL.up.railway.app/model/voices` (should return JSON list of voices).
- **Check Frontend**: Refresh site. "Server Status" should turn Green.
