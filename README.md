# chat-app

A real-time messaging app with friend requests, private chats, and live delivery over WebSockets. Full stack, built from scratch — vanilla JS + Vite on the frontend, Express, MongoDB, and Socket.io on the backend.

**Live app:** [chat.msamanyu.me](https://chat.msamanyu.me)
**API:** [chat-app-production-6d17.up.railway.app](https://chat-app-production-6d17.up.railway.app)

## What it does

Sign up, log in, add other users as friends, and chat with them in real time. Friend requests have to be accepted before a conversation opens, and every chat runs in its own room so messages stay scoped to the two people in it.

## Features

**Auth**
- Sign up / log in with username + password
- JWT-based sessions, verified server-side
- Stays logged in across refreshes via localStorage

**Friends**
- Add people by username
- Send, accept, or decline friend requests
- Manage your friend list

**Messaging**
- Real-time private messaging over Socket.io
- Each conversation runs in its own room
- Message history persists per conversation
- Every message is tagged with its sender

## Screenshots

<img width="1916" height="975" alt="image" src="https://github.com/user-attachments/assets/d8256ce0-90aa-434e-88ae-4773a57d9d52" />

## Tech stack

| | |
|---|---|
| **Frontend** | HTML5, CSS3, vanilla JS, Vite, Socket.io-client, Google Fonts (Iceland, Quicksand) |
| **Backend** | Node.js, Express, MongoDB, Socket.io, JWT, CORS |
| **Deployment** | GitHub Pages (frontend, custom domain via CNAME) + Railway (backend) |

## API

| Endpoint | What it does |
|---|---|
| `POST /auth/signup` | Create an account |
| `POST /auth/login` | Log in, get a JWT |
| `GET /auth/verify` | Validate a token |
| `POST /user/friend` | Add a friend by username |
| `POST /user/friend-request` | Send / accept / decline a friend request |

## Socket.io events

| Event | Direction | What it's for |
|---|---|---|
| `register-user` | client → server | Identify the connected user |
| `join-room` | client → server | Enter a chat room |
| `leave-room` | client → server | Leave a chat room |
| `private-message` | client → server | Send a message |
| `recieve-private-message` | server → client | Deliver a message (yep, the typo's load-bearing at this point — renaming it means touching every client) |

## Database

Three collections in MongoDB:
- **Users** — username, hashed password
- **Friends** — relationships between users
- **Friend Requests** — pending requests waiting on a response

## Project structure

```
Messaging app/
├── Frontend/
│   ├── src/
│   │   ├── auth.js         # login/signup logic
│   │   ├── main.js         # chat functionality
│   │   ├── auth.css
│   │   └── style.css
│   ├── auth.html
│   ├── index.html
│   └── vite.config.js
├── Backend/
│   ├── src/
│   │   ├── config/db.js    # MongoDB connection
│   │   ├── model/          # data models
│   │   ├── routes/         # API endpoints
│   │   └── index.js        # server entry point
│   └── package.json
└── CNAME
```

## Roadmap

Things I want to get to:
- Group chats, not just 1:1
- Typing indicators / read receipts
- Message search
- Notifications for offline users
