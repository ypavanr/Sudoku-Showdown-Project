# Sudoku Savvy 🎮🧩(https://sudoku-savvy.vercel.app/)

A real-time multiplayer Sudoku platform where you can **compete, collaborate, or play solo**.

## 📌 Motivation

What began as a friendly competition between us quickly turned into a full-fledged project. We used to challenge each other to solve Sudoku puzzles faster, but couldn’t find any apps that let us compete on the same puzzle in real-time. Most platforms focused only on solo play, and none offered the **multiplayer experience** we wanted.

So, we decided to build our own. At first, the focus was purely on competition—racing to finish the same puzzle faster than friends. But as we developed, we realized **solving puzzles together** was just as fun. That led to implementing a **cooperative mode**, where multiple players could work on the same Sudoku grid as a team.

Over time, we kept refining the project with **user-friendly features** and polished interfaces, making Sudoku Savvy evolve from a personal challenge into a **multiplayer Sudoku platform designed to bring people together—whether competing, collaborating, or just playing casually**.



## 🚀 Key Features

* **User Icon & Username** – Personalize your profile with a fun icon and name.
* **Competitive Mode** – Race against others in real-time to finish the puzzle fastest.
* **Cooperative Mode** – Solve the same puzzle together with friends.
* **Solo Mode** – Play at your own pace for practice or relaxation.
* **Difficulty Levels** – Easy (35 cells), Medium (45), Hard (55), Expert (66).
* **Expert Level** – Unique challenge with multiple solutions, no validation, and no scoring.
* **Custom Puzzle Generator** – Generates unique puzzles for Easy–Hard.
* **Expert Generator** – Creates multi-solution puzzles for ultimate difficulty.
* **Solution Verifier** – Ensures uniqueness for all levels except Expert.
* **Room Creation** – Multiple rooms with custom settings.
* **One Room per Player** – Keeps gameplay consistent.
* **Host Privileges** – Host chooses difficulty, mode, and timer.
* **Host Transfer** – New host auto-assigned if current host leaves.
* **Custom Validation Toggle** – Enable/disable automatic validation.
* **Real-Time Chat** – Chat with players while solving puzzles.
* **Quit Button** – Leave the game anytime with one click.
* **New Game Trigger** – Hosts can instantly start a new round.
* **Leaderboard (Competitive)** – Tracks rankings by speed & accuracy.
* **Point System** – Earn points based on time & accuracy (disabled in Expert/no-validation).
* **Mid-Game Join (Co-op)** – Late joiners sync seamlessly with ongoing matches.
* **Collapsible Chat** – Minimize/maximize chat panel anytime.


## 🛠 Tech Stack

**Frontend:**

* React.js (Vite)
* localStorage (for persistence)
* Socket.IO Client

**Backend:**

* Node.js + Express.js
* Socket.IO Server

**Database & Deployment:**

* Supabase (PostgreSQL) – Stores engagement analytics (room ID, usernames, etc.)
* nanoid – Generates short unique room IDs
* Vercel – Frontend hosting
* Render – Backend hosting

**Dev Tools:**

* VS Code
* Git (version control)



## 📚 What We Learned

* **Real-Time Communication:** Gained experience with Socket.IO, managing rooms, handling client-server events, and building multiplayer systems.
* **Frontend & UX:** Designed responsive layouts, smooth transitions, and intuitive controls—focusing on usability for different modes.
* **Sudoku Algorithms:** Built custom puzzle generators with unique solutions for Easy–Hard, and multi-solution flexibility for Expert. Learned validation, solution verification, and dynamic input handling.
* **Game Flow Management:** Implemented setup, restarts, host transitions, and disconnection handling. Learned how real-time multiplayer games function behind the scenes.


## ⚙️ Setup & Usage

### 🔧 Prerequisites

* [Node.js](https://nodejs.org/) (v18+)
* npm (comes with Node.js)

### 📂 Clone the Repository

```bash
git clone https://github.com/ypavanr/Sudoku-Showdown-Project
cd sudoku-savvy
```

---

### 🌍 Environment Variables

#### 📌 Frontend (`frontend/.env`)

Create a file named `.env` inside the **`frontend/`** folder:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 📌 Backend (`backend/src/.env`)

Create a file named `.env` inside the **`backend/src/`** folder:

```bash
SUPABASE_PROJECT_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

👉 Replace the placeholders with values from your [Supabase project dashboard](https://supabase.com/).

---

### ▶️ Backend Setup

```bash
cd backend
npm install
node src/index.js
```

This will start the backend server (default: `http://localhost:3000`).

---

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

This will start the frontend dev server (default: `http://localhost:5173`).

Now open the frontend in your browser and it will connect to the backend automatically. 🎉

---
