# EduNavigator Backend

**AI-Powered University Admission & Comparison System** — REST API for the EduNavigator frontend.

Built with **Node.js + Express + MongoDB (Mongoose) + JWT authentication**.

---

## 🚀 Quick Start

### 1. Install
```bash
cd edunavigator-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# then edit .env — set MONGO_URI and JWT_SECRET
```

### 3. Start MongoDB
Either run MongoDB locally (`mongod`) or use **MongoDB Atlas** free tier and paste the connection string into `MONGO_URI`.

### 4. Seed sample data (universities, admissions, scholarships)
```bash
npm run seed
```

### 5. Run the server
```bash
npm run dev       # with auto-reload (nodemon)
# or
npm start
```

Server runs on **http://localhost:5000**

---

## 📂 Project Structure

```
edunavigator-backend/
├── config/db.js               # MongoDB connection
├── controllers/               # Business logic
├── middleware/auth.js         # JWT + role guards
├── models/                    # Mongoose schemas
├── routes/                    # Express routers
├── data/seed.js               # Sample data seeder
├── server.js                  # App entrypoint
├── .env.example
└── package.json
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint          | Description                | Auth |
|--------|-------------------|----------------------------|------|
| POST   | /auth/register    | Create student account     | ❌   |
| POST   | /auth/login       | Login, returns JWT         | ❌   |
| GET    | /auth/me          | Current user profile       | ✅   |
| PUT    | /auth/me          | Update profile             | ✅   |

### Universities
| Method | Endpoint                  | Description                                  |
|--------|---------------------------|----------------------------------------------|
| GET    | /universities             | List/search (query: search, city, sector)    |
| GET    | /universities/:id         | Get single university with programs          |
| POST   | /universities             | Create (admin)                               |
| PUT    | /universities/:id         | Update (admin)                               |
| DELETE | /universities/:id         | Delete (admin)                               |

### Admissions
| Method | Endpoint                | Description                              |
|--------|-------------------------|------------------------------------------|
| GET    | /admissions             | List all admission cycles                |
| GET    | /admissions/upcoming    | Upcoming deadlines (next 10)             |
| POST   | /admissions             | Create admission (admin)                 |

### Scholarships
| Method | Endpoint          | Description                     |
|--------|-------------------|---------------------------------|
| GET    | /scholarships     | List scholarships (filter: type)|
| POST   | /scholarships     | Create (admin)                  |

### 🔀 Compare
| Method | Endpoint    | Body                    | Returns                 |
|--------|-------------|-------------------------|-------------------------|
| POST   | /compare    | `{ ids: [id1, id2, ...] }` | Side-by-side matrix   |

### 🤖 AI Recommendation
| Method | Endpoint          | Body                                                                                          |
|--------|-------------------|-----------------------------------------------------------------------------------------------|
| POST   | /recommendation   | `{ percentage, interest, city, budget, degreeLevel }` — returns top matches with match score |

### Applications
| Method | Endpoint                    | Description                             | Auth   |
|--------|-----------------------------|-----------------------------------------|--------|
| POST   | /applications               | Submit application                      | ✅     |
| GET    | /applications/mine          | List my applications                    | ✅     |
| GET    | /applications               | List all (admin)                        | 🛡️     |
| PATCH  | /applications/:id/status    | Update status (admin)                   | 🛡️     |

### Notifications
| Method | Endpoint                    | Description                     | Auth |
|--------|-----------------------------|---------------------------------|------|
| GET    | /notifications              | Get my notifications            | ✅   |
| PATCH  | /notifications/:id/read     | Mark as read                    | ✅   |
| POST   | /notifications              | Broadcast (admin)               | 🛡️   |

### Contact
| Method | Endpoint     | Description                          |
|--------|--------------|--------------------------------------|
| POST   | /contact     | Submit contact form (public)         |
| GET    | /contact     | List messages (admin)                |

---

## 🔗 Integrating with Your Frontend

Your frontend (the `public/site/` HTML files) can call this API using `fetch()`. Example:

```js
// login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
  .then(r => r.json())
  .then(({ token, user }) => localStorage.setItem('token', token));

// authenticated request
fetch('http://localhost:5000/api/applications/mine', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// AI recommendation
fetch('http://localhost:5000/api/recommendation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    percentage: 85, interest: 'Engineering',
    city: 'Islamabad', budget: 200000, degreeLevel: 'Bachelors'
  })
}).then(r => r.json()).then(console.log);
```

### Serve frontend + backend together (optional)
Copy your frontend `site/` folder into `edunavigator-backend/public/` and the server will serve it automatically at `http://localhost:5000/site/index.html`.

---

## 🛡️ Admin User
To create an admin, register a user then update its role in Mongo:
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

---

## 📦 Deployment
- **Render / Railway / Heroku**: Push repo, set env vars (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`), deploy.
- **MongoDB Atlas**: Recommended free managed database.
- Update your frontend's `API_BASE_URL` to your deployed backend URL.

---

Built for **Final Year Project — EduNavigator** 🎓
