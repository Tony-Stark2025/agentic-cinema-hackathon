# 🚀 Google Cloud Run Deployment Guide for Showrunner

This guide walks you through deploying **Showrunner** to **Google Cloud Run** to obtain your live hosted URL for the Devpost hackathon submission.

---

## 🌟 Method 1: Google Cloud Console (Fastest & 1-Click via GitHub)

1. Open the [Google Cloud Run Console](https://console.cloud.google.com/run).
2. Click **Create Service** (or **Deploy Container**).
3. Select **"Continuously deploy from a repository"** and click **Set up with Cloud Build**.
4. Select **GitHub** as your repository provider and choose:
   - **Repository**: `Tony-Stark2025/agentic-cinema-hackathon`
   - **Branch**: `^main$`
   - **Build Type**: `Dockerfile` (Source location: `/Dockerfile`)
5. Under **Service configuration**:
   - **Service name**: `showrunner-studio-ops`
   - **Region**: `us-central1` (or your preferred region)
   - **Authentication**: Select **"Allow unauthenticated invocations"** (public web access).
6. Under **Container, Networking, Security**:
   - Add Environment Variable:
     - `GEMINI_API_KEY`: `your_gemini_api_key`
     - `SHOWRUNNER_STAGE`: `STG-VIRTUAL-STAGE-A`
   - Port: `8080`
   - Memory: `1 GiB`
   - CPU: `1`
7. Click **Create**. Google Cloud Build will automatically build the Docker container and deploy it, providing you with a live `https://showrunner-studio-ops-...-uc.a.run.app` URL.

---

## ⚡ Method 2: Google Cloud Shell (No Local Installation Needed)

If you don't have the `gcloud` CLI installed locally on your machine, you can use Google's free in-browser terminal:

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Click the **Activate Cloud Shell** icon (`>_`) in the top-right toolbar.
3. In the Cloud Shell terminal, run:

```bash
# 1. Clone your repository
git clone https://github.com/Tony-Stark2025/agentic-cinema-hackathon.git
cd agentic-cinema-hackathon

# 2. Deploy directly from source to Cloud Run
gcloud run deploy showrunner-studio-ops \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your_gemini_api_key_here" \
  --memory 1Gi \
  --cpu 1
```

4. When prompted:
   - Allow unauthenticated requests? &rarr; Type `y` (yes).
5. Cloud Run will output your live URL:
   `Service URL: https://showrunner-studio-ops-xxx-uc.a.run.app`

---

## 🔄 Method 3: Automated GitHub Actions CI/CD

We have included `.github/workflows/deploy-cloud-run.yml`.

To enable automated deployments whenever you push to GitHub:
1. In your GitHub repository (`Tony-Stark2025/agentic-cinema-hackathon`), go to **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
2. Add the following repository secrets:
   - `GCP_PROJECT_ID`: Your Google Cloud Project ID (e.g. `agentic-cinema-2026`).
   - `GCP_SA_KEY`: The JSON key of a Service Account with `Cloud Run Admin` and `Storage Admin` roles.
   - `GEMINI_API_KEY`: Your Gemini API key.
3. Every git commit pushed to `main` will automatically build and deploy the container to Cloud Run!
