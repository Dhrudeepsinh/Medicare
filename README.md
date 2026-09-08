# 🏥 MediCare — Doctor Portal

A full-stack medical patient management system for doctors to manage patients, appointments, medical records, and reports.

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts  |
| Backend  | Node.js, Express.js                     |
| Database | MongoDB (Mongoose)                      |
| Auth     | JWT (JSON Web Tokens), bcryptjs         |

---

## Features

- 🔐 Doctor authentication (register / login)
- 👥 Patient management (add, view, update)
- 📅 Appointment scheduling & tracking
- 🗂️ Medical records per patient
- 📊 Dashboard with charts and reports
- ⚙️ Doctor profile & settings

---

## Project Structure

```
medical-management-system/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # Dashboard, Patients, Appointments, Reports…
│       ├── components/
│       └── services/
└── server/          # Express backend
    ├── models/      # Doctor, Patient, Appointment, MedicalRecord
    ├── controllers/
    ├── routes/
    └── middleware/
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### 1. Clone & Install

```bash
git clone <repo-url>
cd medical-management-system
npm run install-all
```

### 2. Configure Environment

Copy `.env.example` to `server/.env` and fill in your values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed Sample Data *(optional)*

```bash
npm run seed
```

### 4. Run the App

```bash
npm run dev
```

- **Frontend** → http://localhost:5173  
- **Backend API** → http://localhost:5000

---

## Available Scripts

| Command               | Description                          |
|-----------------------|--------------------------------------|
| `npm run dev`         | Start both client and server         |
| `npm run client`      | Start frontend only                  |
| `npm run server`      | Start backend only                   |
| `npm run seed`        | Seed the database with sample data   |
| `npm run install-all` | Install all dependencies             |

---

## License

MIT
