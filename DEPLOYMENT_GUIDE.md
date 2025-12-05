# Deployment Guide: Hybrid Vercel Setup

This guide walks you through deploying the **Frontend** to Vercel and preparing the **Backend** for a container-based service (like Railway, Fly.io, or AWS).

## 1. Frontend Deployment (Vercel)

The frontend is a static HTML/JS application verified for Vercel.

### Prerequisites (Vercel CLI)
If you haven't installed the Vercel CLI:
```bash
npm i -g vercel
```
*Alternatively, you can skip the CLI and just push your code to GitHub and import the project in the Vercel Dashboard.*

### Step 1: Deploy
Run the following command in the root of your project:
```bash
vercel
```
- **Set up and deploy?** [Y]
- **Which scope?** [Select your team/account]
- **Link to existing project?** [No]
- **Project Name**: [tts-project]
- **In which directory is your code located?**: `./` (Keep default)
- **Want to modify these settings?**: [No] (The `vercel.json` file handles the config)

### Step 2: Configure Backend Connection
Once deployed, your frontend will try to connect to `localhost:8085` by default. To point it to your production backend:

**Option A (Simplest - Hardcode)**
1. Open `frontend/js/config.js`.
2. Find the line: `const API_PORT = '8085';`
3. Edit the logic or uncomment the manual override section.

**Option B (Dynamic - Recommended)**
1. In your Vercel Dashboard, go to **Settings > General > Build & Development Settings**.
2. Change the **Build Command** to:
   ```bash
   echo "window.TTS_API_URL='https://your-backend-url.com'" > frontend/js/env.js
   ```
   *(Replace `https://your-backend-url.com` with your real backend URL)*
3. Add this script reference to `frontend/index.html` **before** `js/main.js`:
   ```html
   <script src="js/env.js"></script>
   ```
4. Redeploy.

## 2. Backend Deployment (Docker)

The backend cannot run on Vercel due to the large AI models (1.4GB+). You must deploy it as a Docker container.

### Dockerfile Info
A production-ready `Dockerfile` is included in the project root.
- **Port**: 8085
- **Volumes**: You **MUST** mount the `models/` directory to `/app/models` in the container, otherwise the server will start but have no voices.

### Example: Railway/Fly.io
1. Push your code to GitHub.
2. Connect your repo to Railway/Fly.
3. **Important**: Since `models/` are large, you have two choices:
    - **A) Bake models into image (Easy but Slow/Large)**: Modify `Dockerfile` to `COPY models ./models` instead of mounting them. This makes your image ~2GB.
    - **B) Network Storage (Advanced)**: Use a persistent volume claim and upload models there.

## Verification Checklist
- [x] `vercel.json` created (Rewrites paths to `frontend/`).
- [x] `.vercelignore` created (Excludes heavy models).
- [x] `config.js` updated to accept `window.TTS_API_URL`.
