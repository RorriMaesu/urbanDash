# Urban Dash

Urban Dash is an endless runner web game where players navigate through a cyberpunk city, avoiding obstacles and collecting orbs to earn points and tokens.

**Play the game**: [https://rorrimaesu.github.io/urbanDash/](https://rorrimaesu.github.io/urbanDash/)

## Features

- Endless runner gameplay with increasing difficulty
- Collectible orbs for bonus points and tokens
- Daily missions to complete for token rewards
- Shop to purchase cosmetic items and perks
- Global leaderboard to compete with other players
- Responsive design for both desktop and mobile play

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account (for leaderboard and user data)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/RorriMaesu/urbanDash.git
   ```

2. Set up Firebase:
   - Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Set up Firestore database
   - Update the Firebase configuration in `firebase.js` with your project credentials

3. Open `index.html` in your browser or use a local development server:
   ```
   npx serve
   ```

## Firebase Setup

1. Create a new Firebase project
2. Enable Firestore database
3. Set up the following collections:
   - `scores`: for leaderboard data
   - `users`: for user data, inventory, and mission progress
   - `missions`: for daily missions

4. Set up Firestore security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /scores/{id} {
         allow read: if true;
         allow create: if request.resource.data.ts == request.time;
       }
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /missions/{id} {
         allow read: if true;
       }
     }
   }
   ```

## Game Controls

- **Desktop**: Press Space or Up arrow key to jump
- **Mobile**: Tap the screen to jump

## Development

The game is built with:
- Phaser 3 for game engine
- Firebase for backend services
- Vanilla JavaScript for UI and game logic

### Project Structure

- `index.html`: Main HTML file
- `styles.css`: CSS styles
- `game.js`: Main game logic using Phaser
- `firebase.js`: Firebase configuration and database functions
- `shop.js`: Shop functionality
- `missions.js`: Daily missions functionality
- `daily.json`: Daily mission data
- `assets/`: Game assets (sprites, sounds, etc.)

## Deployment

The game is automatically deployed to GitHub Pages using GitHub Actions:

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy the game
3. Your game will be available at `https://rorrimaesu.github.io/urbanDash/`

### Manual Deployment

Alternatively, you can deploy manually:

1. Push your code to GitHub
2. Go to repository settings > Pages
3. Enable GitHub Pages from the `main` branch
4. Your game will be available at `https://rorrimaesu.github.io/urbanDash/`

## Future Enhancements

- Social login (Google, Apple)
- Procedural obstacle patterns
- More character skins and perks
- Live events with special rewards
- Mobile swipe controls for additional actions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Phaser.io for the game engine
- Firebase for backend services
- OpenGameArt for placeholder assets
