# Pilot - Dynamic Movie & TV Show Tracker

A modern, responsive web application similar to Letterboxd for tracking movies and TV shows. Built with React, Firebase, and TMDB API featuring real-time data, user authentication, and personal collections.

## 🚀 Features

### 🎬 Core Functionality
- **Real Movie Data**: Live data from The Movie Database (TMDB) API
- **User Authentication**: Secure signup/signin with Firebase Auth
- **Personal Watchlists**: Add movies and shows to your personal watchlist
- **Favorites System**: Mark content as favorites with heart icon
- **Rating System**: Rate movies and TV shows (coming soon)
- **Search**: Find specific movies and shows across the entire TMDB database
- **Trending Content**: Discover what's popular right now
- **Detailed Views**: Comprehensive movie/show information with cast, ratings, and more

### 🔐 Authentication Features
- **Email/Password Authentication**: Traditional signup and signin
- **Google OAuth**: Quick signin with Google account
- **User Profiles**: Personal profile with viewing statistics
- **Secure Data**: User data stored securely in Firebase Firestore
- **Session Management**: Persistent login sessions

### 🎨 Design Features
- **Landing Page**: Beautiful onboarding experience for new users
- **Modern Dark Theme**: Sleek black/dark gray color scheme with coral red accents
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Interactive Cards**: Hover effects, action buttons, and smooth animations
- **Professional UI**: Clean, minimalist interface inspired by modern streaming platforms

### 📱 User Experience
- **Conditional Rendering**: Different experiences for authenticated vs non-authenticated users
- **Real-time Updates**: Instant feedback when adding/removing from lists
- **Loading States**: Smooth loading indicators and error handling
- **Mobile-First**: Optimized for mobile devices with touch-friendly interactions

## 🛠 Tech Stack

### Frontend
- **React 18**: Modern React with hooks and context
- **React Router**: Client-side routing and navigation
- **Lucide React**: Beautiful, consistent icons
- **CSS3**: Modern CSS with Grid, Flexbox, and animations

### Backend & Services
- **Firebase Authentication**: User management and authentication
- **Firebase Firestore**: NoSQL database for user data
- **TMDB API**: Real movie and TV show data
- **Axios**: HTTP client for API requests

### Development
- **Create React App**: Development environment and build tools
- **Environment Variables**: Secure API key management
- **Git**: Version control with proper .gitignore

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project
- TMDB API key

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd pilot-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration
   - Add your TMDB API key

4. **Configure Firebase:**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Copy your config to `.env`

5. **Get TMDB API Key:**
   - Sign up at [themoviedb.org](https://www.themoviedb.org/)
   - Request an API key from your account settings
   - Add it to your `.env` file

6. **Start the development server:**
```bash
npm start
```

7. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.js          # Navigation with auth state
│   ├── Header.css
│   ├── MovieCard.js       # Interactive movie cards
│   ├── MovieCard.css
│   ├── AuthModal.js       # Login/signup modal
│   └── AuthModal.css
├── pages/
│   ├── Landing.js         # Landing page for non-auth users
│   ├── Landing.css
│   ├── Home.js           # Main app for authenticated users
│   ├── Home.css
│   ├── MovieDetail.js    # Detailed movie view
│   ├── MovieDetail.css
│   ├── Profile.js        # User profile and stats
│   └── Profile.css
├── services/
│   ├── tmdbApi.js        # TMDB API integration
│   ├── authService.js    # Firebase auth functions
│   └── userDataService.js # User data management
├── contexts/
│   └── AuthContext.js    # Authentication context
├── config/
│   └── firebase.js       # Firebase configuration
├── App.js                # Main app with routing
└── App.css               # Global styles
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# TMDB API Configuration
REACT_APP_TMDB_API_KEY=your_tmdb_api_key
```

### Firebase Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎯 Key Features Explained

### Authentication Flow
- **Landing Page**: Beautiful onboarding for new users
- **Auth Modal**: Seamless signup/signin experience
- **Protected Routes**: Automatic redirection based on auth state
- **User Context**: Global authentication state management

### Data Management
- **Real-time Sync**: User data synced with Firestore
- **Optimistic Updates**: Instant UI feedback
- **Error Handling**: Graceful error states and recovery
- **Offline Support**: Basic offline functionality

### Movie Integration
- **Live Data**: Real movie/TV data from TMDB
- **Search**: Full-text search across TMDB database
- **Trending**: Dynamic trending content
- **Details**: Rich movie information with cast and crew

## 🎨 Design System

### Color Palette
- **Primary Background**: `#0f0f0f` (Deep black)
- **Secondary Background**: `#1a1a1a` (Dark gray)
- **Accent Color**: `#ff6b6b` (Coral red)
- **Success**: `#22c55e` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Text Primary**: `#ffffff` (White)
- **Text Secondary**: `#cccccc` (Light gray)

### Typography
- **Primary Font**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI')
- **Headings**: Bold weights (600-700)
- **Body**: Regular weight (400)
- **Small Text**: Medium weight (500)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔮 Future Enhancements

- **Advanced Filtering**: Genre, year, rating filters
- **Social Features**: Follow users, share reviews
- **Recommendations**: AI-powered content suggestions
- **Reviews System**: Write and read detailed reviews
- **Custom Lists**: Create themed movie collections
- **Notifications**: New releases and recommendations
- **Dark/Light Theme**: Theme switching option
- **Mobile App**: React Native version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **TMDB**: The Movie Database for comprehensive movie data
- **Firebase**: Google Firebase for authentication and database
- **Lucide**: Beautiful icon library
- **React**: Amazing frontend framework
- **Letterboxd**: Design inspiration for movie tracking