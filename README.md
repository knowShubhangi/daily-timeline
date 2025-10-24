# Daily Planner

A **teal-gradient, mobile-friendly daily planner** built with React, featuring checklists, streak tracking, and persistent local storage.

## Features

* ✅ Track daily tasks with checkboxes
* 🌈 Color-coded time blocks for visual clarity
* 🔥 Streak counter to maintain consistency
* 📝 Editable task labels and notes
* 📱 Mobile optimized
* 💾 State is saved locally in the browser using `localStorage`
* 🎨 Teal-gradient soft background for eye-friendly experience

## Daily Schedule Example

1. Wake & Sunlight (8:30 AM) - Hydrate + 10m sunlight
2. Meditation (9:30 - 10:00 AM) - 30 min guided / breathwork
3. Breakfast (10:00 - 10:30 AM) - Protein-rich meal
4. Work Block 1 (11:00 AM - 2:00 PM) - Deep work / focused tasks
5. Lunch (2:00 - 2:30 PM) - Balanced meal
6. Rest / Prep (2:30 - 3:15 PM) - Stretch, short walk
7. Gym + Commute (3:30 - 6:30 PM) - Workout + travel
8. Work Block 2 (7:30 - 9:00 PM) - Admin / light work
9. Dinner (9:00 - 9:30 PM) - Nutritious meal
10. Meetings (9:30 - 11:30 PM) - Team syncs
11. Wind Down (11:30 PM - 12:15 AM) - Games, read, reflect
12. Sleep (1:00 AM) - Aim for 7+ hours

## Installation

1. Clone the repository:

   ```bash
   git clone <repo_url>
   cd <repo_folder>
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the development server:

   ```bash
   npm start
   ```

## Deployment

* Build the app:

  ```bash
  npm run build
  ```
* Host the `build/` folder on your preferred platform (GitHub Pages, Netlify, Vercel, or your own server).

## Usage

* Check tasks as you complete them.
* Edit task labels and notes inline.
* Click `+1 Day` to increment your streak.
* Click `Reset Checkmarks` to clear daily progress.

## Notes

* All data is stored locally in your browser; progress **will not sync across devices**.
* Works best on modern browsers with localStorage support.

## License

MIT License
