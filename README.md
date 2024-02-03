# Weekly Schedule Calendar

The Weekly Schedule Calendar is a web application built with Vite React frontend and Express backend. It allows users to view and manage their weekly schedule by selecting dates from a calendar and adding events to specific timeslots.

## Features

- View weekly schedule
- Navigate between weeks
- Select dates from a calendar
- Add events to specific timeslots
- Save events to persist data
- Retrieve events for the selected week

## Technologies Used

- **Frontend:**
  - Vite
  - React
  - Moment.js (for date/time manipulation)
- **Backend:**
  - Express
  - fs (file system module for data storage)
- **Deployment:**
  - Render (for deploying the application)

## Setup Instructions

1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory: `cd <project-directory>`
3. Install dependencies:
   - For frontend: `cd frontend && npm install`
   - For backend: `npm install`
4. Start the development servers:
   - Frontend: `cd frontend && npm run dev`
   - Backend: `npm run start`

## API Endpoints

- `POST /api/save-events`: Save events to persist data.
- `GET /api/calendar-events?year=<year>&month=<month>&day=<day>`: Retrieve events for the selected week.

## Deployment

The application can be deployed using Render or any other hosting service. Make sure to build the frontend before deploying.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.
