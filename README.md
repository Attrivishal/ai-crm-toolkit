# PipelineIQ - AI Sales Assistant 

**PipelineIQ** (formerly SalesMind) is a professional, production-ready MERN stack application designed to supercharge sales workflows with AI-driven lead management and insights.

---

## 🔗 Live Demo
- **Frontend (S3)**: [http://pipelineiq-bucket.s3-website-us-east-1.amazonaws.com](http://pipelineiq-bucket.s3-website-us-east-1.amazonaws.com)
- **Backend (EC2)**: [http://3.235.75.159/api/health](http://3.235.75.159/api/health)

---

## ✨ Features
- **AI Sales Copilot**: Intelligent AI assistant to help draft outreach and analyze deals.
- **Lead Management**: Organize and track leads with a sleek, interactive dashboard.
- **Dynamic Interactions**: Log activities, schedule follow-ups, and manage your sales pipeline.
- **Secure Authentication**: JWT-based login with OAuth support (Google & GitHub).
- **Pro Design**: High-end SaaS aesthetic with glassmorphism and smooth animations.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, TailwindCSS, Framer Motion, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas.
- **Runtime**: Ubuntu 22.04 LTS (EC2).
- **Process Manager**: PM2.
- **Reverse Proxy**: Nginx.
- **Static Hosting**: Amazon S3.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisite
- Node.js (v18+)
- MongoDB Atlas Account
- OpenAI API Key

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/your-username/ai-crm-toolkit.git
cd ai-crm-toolkit
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env # Fill in your MONGO_URI, JWT_SECRET, and OPENAI_API_KEY
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
---

## 🏗️ Production Deployment Architecture
- **Continuous Hosting**: The frontend is built locally and synced to an **Amazon S3** bucket.
- **Backend Scaling**: The backend runs on **Amazon EC2**, optimized with **Nginx** as a reverse proxy for Port 80.
- **Auto-Restart**: **PM2** ensures the Node.js application is always running and handles zero-downtime restarts.
- **Security**: Hardened with **Helmet.js**, **HPP**, and **Express Rate Limiting**.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact
**Vishal Attri** - [Your Portfolio/LinkedIn] - vishalattri196@gmail.com

Project Link: [https://github.com/your-username/ai-crm-toolkit](https://github.com/your-username/ai-crm-toolkit)
