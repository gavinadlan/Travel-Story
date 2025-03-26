# Travel Story App

## 🌍 Overview

Travel Story App is a full-stack MERN (MongoDB, Express, React, Node.js) application designed for users to document and share their travel experiences. Users can securely register, log in, and create travel stories enriched with images and dates.

## ✨ Features

### 🔐 User Authentication

- Secure signup & login
- JWT-based authentication
- Protected routes for authenticated users

### 🗺️ Travel Story Management

- Create, edit, and delete travel stories
- Upload images
- Add travel dates and locations

### 🔍 Enhanced User Experience

- Search and filter stories by date range
- Mark favorite stories
- Responsive design (desktop & mobile)

## 🛠️ Tech Stack

### Frontend

- React.js
- React Router
- Tailwind CSS
- Axios

### Backend

- Node.js & Express.js
- MongoDB & Mongoose
- JWT authentication
- Multer for image uploads

## 🚀 Getting Started

### 📌 Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gavinadlan/Travel-Story.git
   cd Travel-Story
   ```
2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Set up environment variables:
   ```bash
   cd backend
   touch .env
   ```
   Add the following to `.env`:
   ```env
   PORT=8000
   ACCESS_TOKEN_SECRET=your_jwt_secret_key
   ```
4. Start the development servers:
   ```bash
   cd backend && npm run dev
   cd frontend && npm start
   ```
5. Open `http://localhost:3000` in your browser.

## 📡 API Endpoints

### 🔑 Authentication

- `POST /create-account` - Register user
- `POST /login` - Authenticate user
- `GET /get-user` - Fetch user details

### 🏞️ Travel Stories

- `POST /add-travel-story` - Create a story
- `GET /get-all-stories` - Retrieve user stories
- `PUT /edit-story/:id` - Update a story
- `DELETE /delete-story/:id` - Remove a story
- `PUT /update-is-favourite/:id` - Mark/unmark as favorite

### 📸 Image Management

- `POST /image-upload` - Upload images
- `DELETE /delete-image` - Remove uploaded images

### 🔍 Search & Filter

- `GET /search` - Search by query
- `GET /travel-stories/filter` - Filter stories by date

## 📌 Future Enhancements

- Social features (comments, likes)
- User profiles & statistics
- Map integration
- Public/private stories
- Tagging system

> 💡 Inspired by travelers worldwide who love sharing their adventures!
