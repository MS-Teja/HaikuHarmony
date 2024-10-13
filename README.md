# Haiku Harmony

Haiku Harmony is a web application that celebrates the art of haiku by providing a platform for users to create, share, and appreciate these brief poetic gems. Built with Vue.js and leveraging Pinata's Files API, this project combines the simplicity of haiku with the power of decentralized storage.

## Live Demo

Visit Haiku Harmony: [https://haikuharmony.netlify.app/](https://haikuharmony.netlify.app/)

## Features

- Create and share haikus with associated images
- Browse a feed of user-submitted haikus
- Like and interact with others' creations
- Search haikus by tags
- User profiles showcasing individual collections
- A "Hall of Fame" featuring top-rated haikus

## Technology Stack

- Frontend: Vue.js
- Backend: Netlify Functions
- Storage: IPFS via Pinata SDK
- Authentication & Likes: Firebase
- Hosting: Netlify

Thank you for providing that information. I'll update the README to reflect the correct environment variables and development process. Here's the revised section for local development:

## Local Development

To run this project locally:

1. Clone the repository
   ```
   git clone https://github.com/MS-Teja/HaikuHarmony.git
   cd HaikuHarmony
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Install Netlify CLI globally (if not already installed)
   ```
   npm install -g netlify-cli
   ```

4. Set up environment variables
   Create a `.env` file in the root directory and add the following:
   ```
   PINATA_GATEWAY="YOUR_PINATA_GATEWAY_URL"
   PINATA_JWT="YOUR_PINATA_JWT"
   VITE_FIREBASE_API_KEY="VITE_FIREBASE_API_KEY"
   VITE_FIREBASE_AUTH_DOMAIN="VITE_FIREBASE_AUTH_DOMAIN"
   VITE_FIREBASE_PROJECT_ID="VITE_FIREBASE_PROJECT_ID"
   VITE_FIREBASE_STORAGE_BUCKET="VITE_FIREBASE_STORAGE_BUCKET"
   VITE_FIREBASE_MESSAGING_SENDER_ID="VITE_FIREBASE_MESSAGING_SENDER_ID"
   VITE_FIREBASE_APP_ID="VITE_FIREBASE_APP_ID"
   ```

5. Run the development server using Netlify CLI
   ```
   netlify dev
   ```

6. Open the local server address provided by Netlify CLI in your browser

Note: Make sure you have the necessary permissions and Netlify account setup to use Netlify CLI.

## Deployment

This project is set up for deployment on Netlify. Connect your GitHub repository to Netlify and it will automatically deploy when you push to the main branch.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Feedback

If you have any feedback or suggestions, please open an issue in this repository. Your insights are valuable and will help improve Haiku Harmony!

## License

This project is open source and available under the [MIT License](LICENSE).
```
