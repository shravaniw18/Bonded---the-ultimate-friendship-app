# 🔗 Bonded

> Your friendship, all in one place.

Bonded is a cross-platform mobile app for two close friends to document and live their friendship together — from sharing live moments and competing on study streaks, to raising a virtual pet and tracking their diet. Think of it as a friendship OS.

---

## ✨ Features

| Module | Description |
|---|---|
| 📸 **Moments** | Locket-style live photo feed. Post what you're doing, your friend sees it instantly on their home screen. Disappears after 24h unless saved. |
| 📚 **Study Battles** | Log study hours, track streaks, compete on weekly leaderboards. |
| 🐾 **Shared Pet** | A virtual pet you raise together. Feed it, check in daily, keep it alive. |
| 🥗 **Diet Sync** | Log meals, set shared goals, and hold each other accountable. |
| 🚽 **Poop League** | Yes, really. Log, rate, and compete. Leaderboard included. |
| ☕ **Cafe Finder** | AI-powered cafe recommendations based on your vibe. Save favourites as a pair. |
| 📖 **Friendship Book** | A permanent scrapbook of saved moments and milestones. |
| 📊 **Friendship Stats** | Days known, hangouts logged, streaks, inside jokes — your friendship in numbers. |

---

## 🛠 Tech Stack

- **Frontend** — [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- **Backend** — [Supabase](https://supabase.com/) (Postgres database, auth, real-time, storage)
- **Navigation** — [Expo Router](https://docs.expo.dev/router/introduction/)
- **Notifications** — Expo Notifications
- **Cafe Finder** — Google Places API

---

## 🗂 Project Structure

```
bonded/
├── app/                  # Expo Router screens (file = route)
│   ├── index.tsx         # Home — moments feed
│   ├── login.tsx         # Auth screen
│   └── modules/
│       ├── study.tsx
│       ├── pet.tsx
│       ├── diet.tsx
│       ├── poop.tsx
│       └── cafe.tsx
├── components/           # Reusable UI components
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── theme.ts          # Colors, fonts, spacing
└── assets/               # Images, icons, fonts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [Expo Go](https://expo.dev/go) app on your phone

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/bonded.git
   cd bonded
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   > ⚠️ Never commit `.env` to GitHub. It's already in `.gitignore`.

4. **Run the app**
   ```bash
   npx expo start
   ```
   Scan the QR code with Expo Go on your phone.

---

## 🗃 Database Schema

```
users          — id, username, avatar_url
friendships    — id, user_a, user_b, invite_code
moments        — id, friendship_id, user_id, image_url, caption, expires_at
study_logs     — id, user_id, friendship_id, duration_mins, created_at
diet_logs      — id, user_id, friendship_id, meal, calories, created_at
poop_logs      — id, user_id, friendship_id, rating, notes, created_at
```

> Every table has a `friendship_id` — this app is always about two people, not one.

---

## 🗓 8-Week Roadmap

| Week | Focus |
|---|---|
| 1 | Expo setup, Supabase project, GitHub repo, design system |
| 2 | Auth (email + password), friend invite by code, DB schema |
| 3 | Moments — camera, upload, real-time feed, reactions |
| 4 | Push notifications, 24h expiry, save to book, home screen widget |
| 5 | Study battles + shared pet (basic) |
| 6 | Diet sync + poop league |
| 7 | Cafe finder + friendship book / stats |
| 8 | Bug fixes, polish, TestFlight / Play Store internal testing |

---

## 👥 Team

| Role | Owns |
|---|---|
| **P1** — Frontend lead | Screens, navigation, UI components, animations |
| **P2** — Backend lead | Supabase schema, auth, real-time, storage |
| **P3** — Features + QA | Modules, notifications, design polish, testing |

---

## 🤝 Contributing

We use two branches:
- `main` — stable, working code only
- `dev` — active development, everyone works here

Always branch off `dev`, make your changes, and open a PR back into `dev`. Never push directly to `main`.

---

## 📄 License

Private project — not open source.
