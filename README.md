# 🎭 Imposter Question Game

A real-time pass-the-phone multiplayer party game. One player is the imposter with a slightly different question. Discuss, vote, and reveal!

---

## 🚀 Quick Start (Local)

### 1. Install dependencies

```bash
# From project root
npm install          # installs concurrently
cd server && npm install
cd ../client && npm install
```

### 2. Run both server + client

```bash
# From project root
npm run dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:3001

> All players on the same Wi-Fi? They can connect via your local IP, e.g. `http://192.168.1.X:5173`

---

## 📁 Folder Structure

```
imposter-game/
├── server/
│   ├── index.js          # Express + Socket.IO server (all logic here)
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx       # All screens (Home, Lobby, Question, Vote, Reveal)
│   │   ├── index.css     # Dark football-themed styles
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json          # Root scripts
└── README.md
```

---

## 🌐 Deploy to Render (Free)

### Server

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Point to `/server` directory
4. Build command: `npm install`
5. Start command: `node index.js`
6. Note the URL: `https://your-server.onrender.com`

### Client (Render Static Site)

1. New → Static Site → point to `/client`
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Add env var: `VITE_SERVER_URL=https://your-server.onrender.com`

---

## 🌐 Deploy to Vercel (Client only)

The client can be deployed to Vercel, but you'll need the server on Render/Railway.

```bash
cd client
cp .env.example .env
# Edit .env: VITE_SERVER_URL=https://your-server.onrender.com
npx vercel --prod
```

---

## 🎮 How to Play

1. **One person** creates a room → shares the 5-letter code
2. **Everyone joins** on their own device (or pass one phone)
3. **Host starts** the game (needs 3+ players)
4. **Pass the phone** — each player taps "Reveal My Question", reads it, then taps Next
5. **Discuss** — talk about your answers without revealing the exact question
6. **Vote** — each player votes for who they think is the imposter
7. **Reveal** — see if the imposter was caught!

---

## ✨ Features

- 60+ question pairs across football, food, movies, music, travel, tech, history, lifestyle
- Real-time multiplayer via Socket.IO
- Pass-the-phone OR multi-device support
- No database needed (all in memory)
- Mobile-first dark design
