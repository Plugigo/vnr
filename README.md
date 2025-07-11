# VNR-360 Village Portal

A comprehensive village portal built with React and Firebase, providing various services and information for the village community.

## Features

- **User Authentication**: Login/signup with Firebase Auth
- **Role-based Access**: Admin and normal user roles
- **News & Announcements**: Post and view village news
- **Bulletin Board**: Community classifieds and announcements
- **Services Directory**: Local business and service listings
- **Events & Festivals**: Village events calendar
- **Education**: School information and resources
- **Agriculture**: Crop advisory and government schemes
- **Jobs**: Local job postings and MGNREGA updates
- **Culture**: Traditional knowledge and recipes
- **Gallery**: Village photos and memories
- **Health**: Health camps and information
- **Community Chat**: Real-time community participation
- **Admin Panel**: Content management and statistics

## Tech Stack

- **Frontend**: React 18, React Router DOM
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: CSS with inline styles (common.css for shared styles)
- **State Management**: React Hooks

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vnr-360
```

2. Install dependencies:
```bash
npm install
```

3. Firebase Configuration:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase config from Project Settings

4. Environment Setup:
   Create a `.env` file in the root directory with your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

5. Update Firebase Configuration:
   - Open `src/firebase.js`
   - Replace the `firebaseConfig` object with your Firebase project details

6. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

### Default Admin Account

- Email: `admin@vnr.com`
- Password: Set during first signup
- Any user with email `admin@vnr.com` will automatically get admin privileges

## Project Structure

```
src/
├── pages/                 # Page components
│   ├── News.js           # News and announcements
│   ├── BulletinBoard.js  # Community bulletin board
│   ├── ServicesDirectory.js # Local services
│   ├── Events.js         # Village events
│   ├── Education.js      # Educational resources
│   ├── Agriculture.js    # Agricultural information
│   ├── Jobs.js          # Job postings
│   ├── Culture.js       # Cultural content
│   ├── Gallery.js       # Photo gallery
│   ├── Health.js        # Health information
│   ├── Participation.js # Community chat
│   └── AdminPanel.js    # Admin dashboard
├── App.js               # Main app component
├── App.css              # App-specific styles
├── common.css           # Shared styles
├── firebase.js          # Firebase configuration
├── ErrorBoundary.js     # Error handling
└── index.js             # App entry point
```

## Features by User Role

### Normal Users
- View all content
- Submit posts to bulletin board (requires admin approval)
- Participate in community chat
- View services, events, and information

### Admin Users
- All normal user privileges
- Create, edit, and delete all content
- Approve bulletin board posts
- Access admin panel with statistics
- Manage all sections

## Firebase Collections

- `users`: User profiles and roles
- `news`: News and announcements
- `bulletin`: Bulletin board posts
- `services`: Service directory entries
- `events`: Village events
- `education`: Educational content
- `agriculture`: Agricultural information
- `jobs`: Job postings
- `culture`: Cultural content
- `gallery`: Photo gallery
- `health`: Health information
- `chat`: Community chat messages

## Security Rules

Ensure your Firestore security rules allow:
- Read access for all authenticated users
- Write access for admins only
- User profile management for own profile

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

## Troubleshooting

### Firebase Connection Issues
- Check internet connection
- Verify Firebase project status
- Clear browser cache
- Check Firebase configuration

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for missing dependencies
- Verify environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team. 