# Travel Story App

A full-stack MERN application for sharing and managing your travel experiences.

## Overview

Travel Story App is a comprehensive platform built using the MERN stack (MongoDB, Express, React, Node.js) that allows users to document and share their travel adventures. Users can create an account, log in securely, and start building a collection of their travel stories with rich details including images and travel dates.

## Features

- **User Authentication**
  - Secure signup and login functionality
  - JWT-based authentication
  - Protected routes for authenticated users

- **Travel Story Management**
  - Create new travel stories with titles, descriptions, and locations
  - Upload images to accompany your travel experiences
  - Add precise travel dates to organize your journeys chronologically
  - Edit existing stories to update details
  - Delete unwanted stories

- **Enhanced User Experience**
  - Search functionality to quickly find specific stories
  - Filter stories by date range
  - Pin favorite stories to the top for easy access
  - Responsive design for both desktop and mobile use

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Responsive Tailwind CSS
- Axios for API requests

### Backend
- Node.js with Express.js
- MongoDB for database
- Mongoose for object modeling
- JWT for secure authentication
- Multer for image upload handling

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/gavinadlan/Travel-Story.git
cd Travel-Story
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
   - Create a `.env` file in the backend directory
   - Add the following variables:
     ```
     PORT=8000
     ACCESS_TOKEN_SECRET=your_jwt_secret_key
     ```

5. Start the development servers

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /create-account` - Register a new user
- `POST /login` - Log in an existing user
- `GET /get-user` - Get current user information (requires auth)

### Image Management
- `POST /image-upload` - Upload image for a story
- `DELETE /delete-image` - Delete an image from uploads folder

### Travel Stories
- `POST /add-travel-story` - Create a new travel story
- `GET /get-all-stories` - Get all user's travel stories
- `PUT /edit-story/:id` - Update an existing travel story
- `DELETE /delete-story/:id` - Delete a travel story
- `PUT /update-is-favourite/:id` - Toggle favorite status of a story

### Search and Filtering
- `GET /search` - Search for stories by query
- `GET /travel-stories/filter` - Filter stories by date range

## Future Enhancements
- Social features (comments, likes)
- User profiles with statistics
- Map integration to visualize travel routes
- Public/private story options
- Tagging system for better organization

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Thanks to all contributors who participate in this project
- Inspired by travelers worldwide who love to share their stories
