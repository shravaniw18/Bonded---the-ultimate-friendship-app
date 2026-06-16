Here's the updated README with full APK build steps:

```markdown
# 🔗 Bonded

> Your friendship, all in one place.

Bonded is a cross-platform mobile app for close friends to document and live their friendship together — from sharing live moments and competing on study streaks, to raising a virtual pet and tracking their diet. Think of it as a friendship OS.

---

## ✨ Features

| Module | Description |
|---|---|
| 📸 **Moments** | Snapchat-style friend list. Post what you're doing, your friend sees it instantly. Disappears after 24h unless saved. Swipe to dismiss. |
| 📖 **Friendship Book** | A permanent scrapbook of saved moments. Tap 🔖 on any moment to save it forever. Photo grid with lightbox viewer. |
| 📚 **Study Battles** | Log study hours, track streaks, compete on weekly leaderboards. Real-time data per friendship. |
| 🐾 **Shared Pet** | A virtual gecko you raise together. Feed it, play with it, bathe it. Choose between green, pink, or blue gecko. |
| 🥗 **Diet Sync** | Log meals, track daily calories, set shared goals and hold each other accountable. |
| 🚽 **Poop League** | Yes, really. Log, rate, and compete on a weekly leaderboard. |
| ☕ **Cafe Finder** | Find nearby cafes using OpenStreetMap (no API key needed). Save favourites as a pair. |
| 📊 **Friendship Stats** | Closeness ranking across all friends, detailed per-friendship breakdown — moments, study hours, meals, streaks and more. |
| 🏆 **Friend of the Month** | Monthly push notification celebrating your closest friend based on shared activity. |

---

## 🛠 Tech Stack

- **Frontend** — [React Native](https://reactnative.dev/) + [Expo SDK 54](https://expo.dev/)
- **Navigation** — [Expo Router v6](https://docs.expo.dev/router/introduction/)
- **Backend** — [Supabase](https://supabase.com/) (Postgres, auth, real-time, storage)
- **Notifications** — Expo Notifications (requires dev build)
- **Location** — Expo Location
- **Cafe Finder** — [Overpass API](https://overpass-api.de/) (OpenStreetMap, free, no key required)

---

## 🗂 Project Structure

```
bonded/
├── app/
│   ├── index.tsx                    # Auth gate — redirects to login or tabs
│   ├── login.tsx                    # Login + signup
│   ├── invite.tsx                   # Friend invite — share/enter code, friend list
│   ├── camera.tsx                   # Camera + photo upload + push notification
│   ├── home.tsx                     # Post-login redirect
│   └── (tabs)/
│       ├── _layout.tsx              # Bottom tab navigator
│       ├── index.tsx                # Moments — Snapchat-style friend list
│       ├── stats.tsx                # Friendship stats + closeness ranking
│       ├── book.tsx                 # Friendship Book — saved moments grid
│       ├── moments/
│       │   └── [friendshipId].tsx   # Per-friendship moments feed
│       └── modules/
│           ├── _layout.tsx
│           ├── index.tsx            # Modules menu grid
│           ├── study.tsx            # Study battles
│           ├── pet.tsx              # Shared gecko pet
│           ├── diet.tsx             # Diet sync
│           ├── poop.tsx             # Poop league
│           └── cafe.tsx             # Cafe finder
├── components/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── MomentCard.tsx               # Swipe-to-dismiss + save to book
│   ├── ReactionPill.tsx
│   ├── Avatar.tsx
│   ├── StreakBadge.tsx
│   ├── ProgressBar.tsx
│   └── StatCard.tsx
├── lib/
│   ├── supabase.ts                  # Supabase client
│   ├── theme.ts                     # Colors, fonts, spacing tokens
│   ├── notifications.ts             # Push notification helpers
│   └── friendOfMonth.ts             # Friend of the month logic
└── assets/
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [EAS CLI](https://docs.expo.dev/build/setup/) — `npm install -g eas-cli`
- An [Expo account](https://expo.dev/signup) (free)
- A physical Android or iOS device for testing

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/bonded.git
   cd bonded
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**

   Create a `.env` file in the root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   > ⚠️ Never commit `.env` to GitHub. It's already in `.gitignore`.

---

## 📱 Building & Running the App

This app uses native modules (`expo-notifications`, `expo-location`, `expo-camera`) that are not supported in Expo Go. You must use a **dev build APK**.

### Step 1 — Log in to EAS

```bash
eas login
```

This opens a browser to log in to your Expo account.

### Step 2 — Configure EAS (first time only)

```bash
eas build:configure
```

Select **Android** when prompted. This creates an `eas.json` file.

### Step 3 — Add `.npmrc` (fixes peer dependency conflicts)

Create a file called `.npmrc` in your project root:

```
legacy-peer-deps=true
```

On Windows PowerShell:
```powershell
New-Item .npmrc -Value "legacy-peer-deps=true"
```

### Step 4 — Build the dev APK

```bash
eas build --profile development --platform android
```

- The build runs in the cloud (~10 mins)
- You'll get a download link when it's done
- Download the `.apk` file to your computer

### Step 5 — Install the APK on your phone

1. Transfer the `.apk` to your phone (USB, Google Drive, WhatsApp to yourself etc.)
2. Open the file on your phone
3. If prompted, enable **"Install from unknown sources"** in settings
4. Tap Install

> ⚠️ You only need to rebuild the APK when you install a **new native package**. All JS/React Native code changes hot-reload instantly without a rebuild.

### Step 6 — Start the dev server

```bash
npx expo start --dev-client
```

### Step 7 — Connect your phone

1. Open the **Bonded dev build APK** on your phone (not Expo Go)
2. Tap your server in the list, or scan the QR code
3. The app loads with your latest code instantly

### When do I need to rebuild the APK?

| Change | Rebuild needed? |
|---|---|
| Edit a screen or component | ❌ No — hot reloads instantly |
| Add a new screen or route | ❌ No — hot reloads instantly |
| Change Supabase queries | ❌ No — hot reloads instantly |
| Install a new native package (`expo install ...`) | ✅ Yes |
| Change `app.json` permissions or plugins | ✅ Yes |
| Upgrade Expo SDK version | ✅ Yes |

---

## 🗃 Database Schema

```sql
users          (id, username, avatar_url, push_token, last_fotm_notif, created_at)
friendships    (id, user_a, user_b, invite_code,
                pet_name, pet_color, pet_health, pet_happiness, pet_hunger,
                pet_last_fed, pet_last_played, pet_last_bathed, created_at)
moments        (id, friendship_id, user_id, image_url, caption, expires_at, created_at)
study_logs     (id, user_id, friendship_id, duration_mins, created_at)
diet_logs      (id, user_id, friendship_id, meal, calories, created_at)
poop_logs      (id, user_id, friendship_id, rating, notes, created_at)
saved_cafes    (id, friendship_id, place_id, name, rating, address, created_at)
```

---

## 🗓 Roadmap

| Phase | Status | Features |
|---|---|---|
| **Phase 1** | ✅ Done | Auth, invite system, camera, moments feed, all module screens |
| **Phase 2** | ✅ Done | Swipe to dismiss, Friendship Book, push notifications, Friend of the Month |
| **Phase 3** | ✅ Done | All modules wired to Supabase, cafe finder with OpenStreetMap, multiple friends support, Snapchat-style moments, closeness ranking stats |
| **Phase 4** | 🔲 Next | Polish pass, animations, Play Store / TestFlight release |

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
- `shravani` — active development

Always make changes on `shravani` and merge into `main` when stable:

```bash
git checkout main
git merge shravani
git push origin main
```

Never push directly to `main`.

---

## 📄 License

Private project — not open source.
```