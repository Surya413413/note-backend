# Notes App Backend

This is the backend server for the Notes App, built using **Node.js**, **Express.js**, and **SQLite**. It provides RESTful APIs for user authentication and CRUD operations on notes.

## 🚀 Features
- User Authentication (JWT-based)
- Create, Read, Update, Delete (CRUD) Notes
- Pin and Archive Notes
- Secure API Endpoints

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **Authentication:** JWT (JSON Web Token)

---

## 📌 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/Surya413413/notes-app-backend.git
cd notes-app-backend
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory and add the following:
```
PORT=3000
JWT_SECRET=your_secret_key
DB_PATH=./notes.db
```

### 4️⃣ Start the Server
```sh
npm start
```
Server runs on `http://localhost:3000`.

---

## 📡 API Endpoints

### 🔐 Authentication
#### Register a User
```http
POST /register
```
**Request Body:**
```json
{
  "username": "user1",
  "password": "password123"
}
```

#### Login a User
```http
POST /login
```
**Request Body:**
```json
{
  "username": "user1",
  "password": "password123"
}
```
**Response:**
```json
{
  "jwt_token": "your_jwt_token_here"
}
```

### 📝 Notes Management
#### Get All Notes
```http
GET /notes
Headers: { Authorization: Bearer <jwt_token> }
```

#### Create a Note
```http
POST /notes
Headers: { Authorization: Bearer <jwt_token> }
```
**Request Body:**
```json
{
  "title": "My Note",
  "content": "This is my note content"
}
```

#### Update a Note
```http
PUT /notes/:id
Headers: { Authorization: Bearer <jwt_token> }
```

#### Delete a Note
```http
DELETE /notes/:id
Headers: { Authorization: Bearer <jwt_token> }
```

### 📌 Pin & Archive Notes
#### Toggle Pin Status
```http
PATCH /notes/:id/pin
Headers: { Authorization: Bearer <jwt_token> }
```
**Request Body:**
```json
{
  "pinned": true
}
```

#### Toggle Archive Status
```http
PATCH /notes/:id/archive
Headers: { Authorization: Bearer <jwt_token> }
```
**Request Body:**
```json
{
  "archived": true
}
```

---

## 🛠️ Development
### Run Server in Development Mode
```sh
npm run dev
```

### Run Database Migrations
If using migrations for SQLite, run:
```sh
npm run migrate
```

---

## 📜 License
This project is open-source and available under the MIT License.

