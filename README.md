<!-- Users
  ↓
Frontend (React + Vite)
AWS S3 Static Hosting
http://pipelineiq-frontend.s3-website-us-east-1.amazonaws.com
  ↓
Nginx Reverse Proxy (Port 80)
  ↓
Node.js Backend (PM2)
AWS EC2
  ↓
MongoDB Atlas
Cloud Database




  Users
   ↓
CloudFront CDN (HTTPS + caching)
https://d2t15is6zto323.cloudfront.net
   ↓
AWS S3 (React frontend)
   ↓
AWS EC2 (Node.js + Express API)
Elastic IP: 100.24.243.177
   ↓
MongoDB Atlas (Database) -->