# 🏫 Smart School Management System (Role-Based Access Control)

A full-stack School Management System built with React.js, Tailwind CSS, Node.js + Express.js, MongoDB (Mongoose), and JWT authentication with strict server-side Role-Based Access Control (RBAC).

---

## 👥 System Roles & Permissions

1. **Super Admin** (`admin@school.com` / `password123`):
   - Root system governance
   - Create, edit, and delete user accounts (Admins, Principals, Teachers)
   - Reset passwords
   - Create and delete classes
   - Assign and reassign class teachers with automated two-way database synchronization

2. **Principal** (`principal@school.com` / `password123`):
   - School-wide academic oversight across Class 1 to 10
   - View all students and search by name/roll/phone with class filters
   - Inspect individual student profiles, attendance history, and report cards
   - Monitor class-by-class and school-wide attendance metrics
   - View faculty directory and teacher assignments

3. **Class Teacher** (`rahul@school.com` / `password123` - Class 5-A):
   - Strictly scoped to assigned class (`classId`)
   - View only assigned class students (attempting to access other classes returns `403 Forbidden`)
   - Register new students into their class
   - Edit student demographics
   - Mark daily attendance (Present/Absent toggles and bulk actions)
   - Record and evaluate examination marks across subjects

---

## 🚀 Quick Setup & How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or MongoDB Atlas URI)

---

### Step 1: Start Backend

```bash
cd backend
npm install
npm run seed      # Populates classes 1-10, teachers, students, attendance, & marks
npm start         # Runs on http://localhost:5000
```

### Step 2: Start Frontend

```bash
cd frontend
npm install
npm run dev       # Runs on http://localhost:5173
```

Open your browser at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

