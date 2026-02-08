# Student and Course Management System
## Team Tatty Sarymsaq
* Artur Jaxygaliyev
* Birlik Koshan
* Alikhan Nurzhan
* Nursultan Beisenbek

## Description
A web-based system for managing students and courses with role-based access:

- **Students:** Browse courses, enroll, drop, view enrolled courses
- **Instructors:** Manage their courses, add/remove students, create courses
- **Admins:** Full CRUD on courses, assign instructors, edit any course

### Features
* Role-based redirect after login (admin → admin-courses, instructor → instructor-courses, student → courses)
* Enroll / drop courses (students)
* Add / remove students (instructors)
* Full-screen loaders during data fetch
* Advanced filtering, sorting, pagination
* Session-based auth with MongoDB store

## Technology Stack
* **Backend:** Node.js, Express 5
* **Database:** MongoDB
* **Frontend:** HTML, CSS, Vanilla JavaScript
* **Dependencies:** express, mongodb, dotenv, bcrypt, express-session, connect-mongo

## Installation & Running

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)

### Setup
1. Clone and install:
   ```bash
   git clone https://github.com/birlikkoshan/web_back_tatty_sarymsaq.git
   cd web_back_tatty_sarymsaq
   npm install
   ```

2. Create `.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=stud_reg
   PORT=3000
   SESSION_SECRET=your_secure_secret
   ```

3. (Optional) Seed data:
   ```bash
   npm run seed
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open `http://localhost:3000`

## Project Structure

```
web_back_tatty_sarymsaq/
├── config/              # Configuration
│   ├── database.js      # MongoDB connection
│   └── index.js         # App config (port, session, etc.)
├── controllers/         # Request handlers
│   ├── apiCoursesController.js
│   ├── authController.js
│   ├── contactController.js
│   ├── coursesController.js
│   └── pagesController.js
├── middleware/          # Auth & role checks
│   ├── requireAuth.js
│   └── requireRole.js
├── models/              # Data layer
│   ├── Course.js
│   ├── Submission.js
│   └── User.js
├── public/              # Static assets
│   ├── auth.js          # Auth UI (login/logout links)
│   ├── courses.js       # Course list, filters, modal
│   ├── style.css
│   ├── courses.css
│   ├── enrollment.css
│   ├── register.css
│   └── validation.js
├── routes/
│   ├── apiCourses.js    # REST API for courses
│   ├── auth.js          # Auth API
│   ├── contact.js
│   ├── courses.js       # GET /courses, /courses/:id
│   └── pages.js         # Static & role pages
├── utils/               # Shared helpers
│   ├── index.js
│   ├── escapeHtml.js
│   ├── calculateStats.js
│   ├── generateCourseInfo.js
│   ├── buildFilter.js
│   ├── parseSort.js
│   ├── parseFields.js
│   └── validate*.js
├── views/               # HTML templates
├── server.js
└── package.json
```

## Frontend Routes

| Path | Auth | Description |
|------|------|-------------|
| `/` | — | Home |
| `/about` | — | About |
| `/contact` | — | Contact form |
| `/login` | — | Login |
| `/signup` | — | Signup |
| `/profile` | Required | User profile |
| `/courses` | — | Courses list (role-based template) |
| `/courses/:id` | Required | Course detail / enrollment |
| `/my-courses` | Required | Student’s enrolled courses |
| `/instructor-courses` | Instructor | Instructor’s courses |
| `/admin-courses` | Admin | Admin courses (CRUD) |
| *(other)* | — | 404 |

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/login` | Login; returns `{ ok: true, role }` |
| `POST` | `/api/logout` | Logout |
| `POST` | `/api/signup` | Register |
| `GET` | `/api/me` | Current user or `{ authenticated: false }` |
| `GET` | `/api/instructors` | Admin: list instructors |

### Courses
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| `GET` | `/api/courses` | student, admin, instructor | List (filter/sort/paginate) |
| `GET` | `/api/courses/:id` | student, admin, instructor | Get one course |
| `GET` | `/api/courses/:id/students` | admin, instructor | List students in course |
| `POST` | `/api/courses` | admin, instructor | Create course |
| `PUT` | `/api/courses/:id` | admin | Update course |
| `DELETE` | `/api/courses/:id` | admin, instructor | Delete course |
| `POST` | `/api/courses/:id/enroll` | student | Self-enroll |
| `POST` | `/api/courses/:id/drop` | student | Drop course |
| `POST` | `/api/courses/:id/add-student` | instructor | Add student (body: `studentId`) |
| `POST` | `/api/courses/:id/assign/:studentId` | instructor | Add student (ID in URL) |
| `POST` | `/api/courses/:id/remove-student/:studentId` | instructor | Remove student |

### Contact
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/contact` | Submit contact form |

## Database Schema

### Courses
- `title`, `code`, `credits`, `capacity`, `enrolled`, `description`
- `type`: "course" | "lab" | "seminar"
- `instructorId`, `schedule`, `room`, `prerequisites`
- `studentIds`: array of ObjectIds
- `createdAt`, `updatedAt`

### Users
- `firstname`, `surname`, `email`, `password` (hashed), `role`: "student" | "instructor" | "admin"

### Submissions
- `name`, `email`, `message`, `time`

## Error Handling

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (e.g. already enrolled, course full) |
| 500 | Internal Server Error |

## License
ISC

## Contributors
- Artur Jaxygaliyev
- Birlik Koshan
- Alikhan Nurzhan
- Nursultan Beisenbek

## Repository
https://github.com/birlikkoshan/web_back_tatty_sarymsaq
