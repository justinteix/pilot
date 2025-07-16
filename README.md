# WatchList - Movie & TV Show Tracker

A modern, responsive web application similar to Letterboxd for tracking movies and TV shows. Built with React and featuring a clean, dark theme design.

## Features

### 🎬 Core Functionality
- **Browse Movies & TV Shows**: Discover trending and popular content
- **Search**: Find specific movies and shows
- **Movie Details**: View comprehensive information including cast, ratings, and overview
- **Personal Watchlist**: Add movies to your watchlist
- **Rating System**: Rate movies with a 5-star system
- **User Profile**: Track your viewing statistics and preferences

### 🎨 Design Features
- **Modern Dark Theme**: Sleek black/dark gray color scheme with red accents
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Clean UI**: Minimalist interface inspired by modern streaming platforms
- **Smooth Animations**: Hover effects and transitions for better UX
- **Professional Typography**: Clean, readable fonts throughout

### 📱 Responsive Layout
- **Mobile-First**: Optimized for mobile devices
- **Flexible Grid**: Adaptive movie card layouts
- **Touch-Friendly**: Large buttons and touch targets
- **Collapsible Navigation**: Mobile-optimized header

## Tech Stack

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Lucide React**: Beautiful, consistent icons
- **CSS3**: Modern CSS with Grid and Flexbox
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd watchlist-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── Header.js          # Navigation header with search
│   ├── Header.css
│   ├── MovieCard.js       # Individual movie/show cards
│   └── MovieCard.css
├── pages/
│   ├── Home.js           # Main page with movie grid
│   ├── Home.css
│   ├── MovieDetail.js    # Detailed movie view
│   ├── MovieDetail.css
│   ├── Profile.js        # User profile and stats
│   └── Profile.css
├── App.js                # Main app component
├── App.css               # Global styles
├── index.js              # App entry point
└── index.css             # Base styles
```

## Key Components

### Header
- Logo and navigation
- Search functionality
- Responsive mobile menu
- User profile access

### MovieCard
- Movie poster display
- Rating overlay
- Watchlist toggle
- Hover animations

### Home Page
- Hero section
- Trending movies grid
- Filter tabs (Trending, Popular, Recent)
- Search results

### Movie Detail Page
- Full backdrop hero
- Movie information and metadata
- Action buttons (Watch, Watchlist, Like)
- User rating system
- Cast information

### Profile Page
- User statistics
- Tabbed interface (Watchlist, Favorites, Ratings, Stats)
- Personal movie collections

## Styling Approach

### Color Scheme
- **Primary Background**: `#0f0f0f` (Deep black)
- **Secondary Background**: `#1a1a1a` (Dark gray)
- **Accent Color**: `#ff6b6b` (Coral red)
- **Text Primary**: `#ffffff` (White)
- **Text Secondary**: `#cccccc` (Light gray)
- **Text Muted**: `#999999` (Medium gray)

### Design Principles
- **Minimalism**: Clean, uncluttered interface
- **Consistency**: Uniform spacing, typography, and colors
- **Accessibility**: High contrast ratios and readable fonts
- **Performance**: Optimized images and smooth animations

## Future Enhancements

- **API Integration**: Connect to TMDB or similar movie database
- **User Authentication**: Login/signup functionality
- **Social Features**: Follow users, share reviews
- **Advanced Filtering**: Genre, year, rating filters
- **Recommendations**: Personalized movie suggestions
- **Reviews**: Write and read movie reviews
- **Lists**: Create custom movie lists
- **Dark/Light Theme**: Theme switching option

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspiration from Letterboxd and modern streaming platforms
- Icons provided by Lucide React
- Movie data structure based on TMDB API format