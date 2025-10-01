# Gmail Authentication with Firebase

This project now supports Gmail authentication using Firebase. Users can login or register using their Google/Gmail accounts.

## Setup Instructions

### 1. Environment Variables

Add the following Firebase Admin SDK credentials to your `.env` file:

```env
# Firebase Admin SDK (for server-side verification)
FIREBASE_CLIENT_EMAIL=your-firebase-admin-client-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**How to get Firebase Admin credentials:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`sports-d369e`)
3. Click on the gear icon ⚙️ → Project Settings
4. Go to the "Service Accounts" tab
5. Click "Generate New Private Key"
6. Download the JSON file
7. From the JSON file, copy:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

**Note:** Make sure to keep the `\n` characters in the private key and wrap it in quotes.

### 2. Firebase Console Configuration

Ensure your Firebase project has Google Sign-In enabled:

1. Go to Firebase Console → Authentication
2. Click on "Sign-in method" tab
3. Enable "Google" provider
4. Add authorized domains if needed

## API Endpoints

### Login with Gmail
**POST** `/api/auth/gmail/login`

**Request Body:**
```json
{
  "idToken": "firebase-id-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "resource": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "user@gmail.com",
      "photoURL": "https://...",
      "provider": "google",
      "firebaseUid": "firebase-uid",
      "createdAt": "2025-10-01T...",
      "updatedAt": "2025-10-01T..."
    }
  }
}
```

### Register with Gmail
**POST** `/api/auth/gmail/register`

Same request/response format as login. For OAuth providers, login and register are functionally the same - if the user doesn't exist, they are created automatically.

## Client-Side Usage

### Using the GmailAuth Component

```jsx
import GmailAuth from '@/app/components/GmailAuth';

export default function LoginPage() {
  return (
    <div>
      <GmailAuth />
    </div>
  );
}
```

### Manual Implementation

```javascript
import { auth } from '@/app/lib/config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

async function loginWithGmail() {
  try {
    // Sign in with Google
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Get Firebase ID token
    const idToken = await result.user.getIdToken();

    // Send to backend
    const response = await fetch('/api/auth/gmail/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Store JWT token
      localStorage.setItem('token', data.resource.token);
      console.log('User:', data.resource.user);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

## How It Works

1. **Client-side:** User clicks "Login with Gmail"
2. **Firebase:** Opens Google sign-in popup
3. **Client-side:** Gets Firebase ID token after successful sign-in
4. **Backend:** Receives ID token and verifies it with Firebase Admin SDK
5. **Backend:** Extracts user info (email, name, photo, UID)
6. **Backend:** Creates new user or updates existing user in MongoDB
7. **Backend:** Generates JWT token for session management
8. **Client-side:** Stores JWT token for authenticated requests

## Database Schema

The User model has been updated to support Firebase authentication:

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (optional - not needed for OAuth),
  firebaseUid: String (unique, sparse),
  photoURL: String,
  provider: String (enum: ['email', 'google', 'firebase']),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Notes

- Firebase ID tokens are verified server-side using Firebase Admin SDK
- JWT tokens are generated for session management
- Tokens expire after 7 days
- Never expose Firebase Admin credentials in client-side code
- Store JWT tokens securely (localStorage or httpOnly cookies)

## Testing

You can test the authentication using tools like Postman or curl:

```bash
# First, get a Firebase ID token from the client-side
# Then send it to the backend:

curl -X POST http://localhost:3000/api/auth/gmail/login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-firebase-id-token"}'
```

## Troubleshooting

### "Firebase admin initialization error"
- Check that `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are set correctly
- Ensure the private key includes `\n` characters and is wrapped in quotes

### "Invalid Firebase token"
- Token may have expired (Firebase ID tokens expire after 1 hour)
- Get a fresh token from the client-side

### "Email not found in token"
- Ensure Google Sign-In is properly configured in Firebase Console
- Check that the user granted email permission during sign-in
