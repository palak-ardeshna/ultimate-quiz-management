# 🎓 QuizQuest: A Comprehensive Quiz & Reward Management System

QuizQuest is a full-stack **MERN (MongoDB, Express, React, Node.js)** application designed to provide an interactive quiz-playing experience coupled with a robust reward redemption system. This project demonstrates high-level architecture, secure authentication, and real-time data synchronization.

---

## 🚀 Key Features

### **👤 For Users**
- **Secure Authentication:** JWT-based login and registration with encrypted password storage using Bcrypt.js.
- **Interactive Quiz Engine:** Browse available quizzes across different difficulty levels (Easy, Medium, Hard).
- **Time-Critical Scoring Logic:** A unique scoring algorithm that rewards speed:
  - **10-20 seconds:** 100% score awarded.
  - **20-50 seconds:** 50% score awarded.
  - **>50 seconds:** 30% score awarded.
- **Performance Analytics:** A dedicated "My Attempts" dashboard to track quiz history, earned points, and completion time.
- **Reward System:** Request point redemptions directly through the user interface.

### **🔑 For Admins**
- **Unified Admin Dashboard:** Manage the entire ecosystem through a clean, tabbed interface.
- **User Oversight:** Monitor all registered users, their total accumulated points, and quiz activity.
- **Dynamic Quiz Management:** Full CRUD operations for quizzes, including multi-option questions and correct answer validation.
- **Redemption Approval Flow:** Process user reward requests with customizable admin commission percentages.

---

## 🛠️ Technical Stack

- **Frontend:** React.js (Vite), SCSS (Modular & Responsive), Axios, React Router DOM.
- **Backend:** Node.js, Express.js (RESTful API Design).
- **Database:** MongoDB with Mongoose ODM for efficient data modeling.
- **State Management:** React Context API for global authentication and user state.
- **Middleware:** Custom authentication and role-based access control (RBAC).

---

## 💻 Installation & Setup

### **Prerequisites**
- Node.js (v16+)
- MongoDB (Local or Atlas)

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/quiz-management.git
cd quiz-management
```

### **2. Backend Configuration**
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```
Start the server:
```bash
npm run dev
```

### **3. Frontend Configuration**
```bash
cd ../frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## 🔑 Default Credentials
Upon initial server startup, a default administrator account is automatically seeded:
- **Email:** `admin@gmail.com`
- **Password:** `admin123`

---

## � API Endpoints Summary

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Authenticate & get token | Public |
| GET | `/api/quiz` | Fetch all quizzes | Public |
| POST | `/api/quiz` | Create a new quiz | Admin |
| POST | `/api/user-quiz/submit` | Submit quiz attempt | User |
| POST | `/api/reward/request` | Request redemption | User |
| POST | `/api/reward/approve/:id` | Approve redemption | Admin |

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

Developed with precision by **[Your Name]**
