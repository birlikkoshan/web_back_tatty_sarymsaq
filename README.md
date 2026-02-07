# Student and Course Management System
## Team Tatty Sarymsaq
* Artur Jaxygaliyev
* Birlik Koshan
* Alikhan Nurzhan
* Nursultan Beisenbek

## Description
This is a web-based system designed for managing student and course information, which allows for such actions as:
* Enrolling to courses
* Dropping from courses
* Finding your own curriculum easily
* Automatically generate comfortable timetable
* See your courses' teachers' contact info

## Technology Stack
* **Backend:** Node.js with Express.js
* **Database:** MongoDB
* **Frontend:** HTML, CSS, JavaScript (Vanilla)
* **Dependencies:**
  - express ^5.2.1
  - mongodb ^7.0.0
  - dotenv ^17.2.3

## Installation & Running Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database (local or cloud instance)
- npm (Node Package Manager)

### Setup Steps
1. Clone this repository:
   ```bash
   git clone https://github.com/birlikkoshan/web_back_tatty_sarymsaq.git
   ```

2. Navigate to the project directory:
   ```bash
   cd web_back_tatty_sarymsaq
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=assignment3
   PORT=3000
   ```

5. Start the server:
   ```bash
   npm start
   ```
   Or:
   ```bash
   node server.js
   ```

6. Open your browser and visit `http://localhost:3000`

## Project Structure

```
web_back_tatty_sarymsaq/
├── database/
│   └── mongo.js          # MongoDB connection and collection helpers
├── public/               # Static assets
│   ├── icons/           # Icon files
│   ├── images/          # Image assets
│   ├── about.css        # About page styles
│   ├── enrollment.css    # Enrollment page styles
│   ├── register.css     # Registration page styles
│   ├── style.css        # Main stylesheet
│   └── validation.js    # Client-side form validation
├── routes/              # Route handlers
│   ├── apiCourses.js    # Course API endpoints (REST)
│   ├── contact.js       # Contact form handling
│   ├── courses.js       # Course page routes
│   └── pages.js         # Static page routes
├── views/               # HTML templates
│   ├── about.html
│   ├── contact.html
│   ├── courses.html     # Course listing page with filters
│   ├── enrollment.html  # Course enrollment detail page
│   ├── index.html       # Home page
│   ├── login.html
│   ├── not_found.html   # 404 error page
│   └── signup.html
├── utils.js             # Utility functions (shared helpers)
├── server.js            # Main server file
├── package.json         # Project dependencies
└── README.md           # This file
```

## Frontend Routes (Pages)

These URLs return HTML pages. All are `GET` unless noted.

| Path | Auth | Description |
|------|------|-------------|
| `/` | — | Home page |
| `/about` | — | About page |
| `/contact` | — | Contact form page |
| `/login` | — | Login page |
| `/signup` | — | Registration page |
| `/profile` | Required | User profile (any authenticated user) |
| `/my-courses` | Required | Student’s “My courses” page |
| `/instructor-courses` | Required, **instructor** | Instructor courses list |
| `/admin-courses` | Required, **admin** | Admin courses list |
| `/courses` | — | Courses list (role-specific template) |
| `/courses/:id` | — | Course detail (admin / instructor / enrollment view) |
| *(any other)* | — | 404 → `not_found.html` |

**Auth behavior:** 401 (API) returns JSON `{ "error": "Unauthorized" }`; page routes redirect to `/login`. 403 (API) returns `{ "error": "Not accessible for your role" }` with no redirect.

---

## API Endpoints

### Authentication (`/api`)

Session cookie is set on login/signup; send cookies for protected endpoints.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/signup` | — | Register a new user (student) |
| `POST` | `/api/login` | — | Log in; sets session |
| `POST` | `/api/logout` | — | Log out; destroys session |
| `GET` | `/api/me` | — | Current auth status and user info |
| `GET` | `/api/instructors` | Required, **admin** | List instructors (name, email) |

**POST `/api/signup`** — Body: `firstname`, `surname`, `email`, `password` (min 8), optional `department`. Returns `201` `{ "ok": true }` or `400` with `details` array.

**POST `/api/login`** — Body: `email`, `password`. Returns `200` `{ "ok": true }` or `401` `{ "error": "Invalid credentials" }`.

**POST `/api/logout`** — Returns `200` `{ "ok": true }`.

**GET `/api/me`** — Returns `200` `{ "authenticated": false }` or `{ "authenticated": true, "user": { "id", "email", "firstname", "surname", "role" } }`.

**GET `/api/instructors`** — Returns `200` array of `{ "name", "email" }` or `403` for wrong role.

---

### Courses API (`/api/courses`)

All require authentication and the listed role(s).

| Method | Path | Roles | Description |
|--------|------|--------|-------------|
| `GET` | `/api/courses` | student, admin, instructor | List courses (filter/sort/paginate) |
| `GET` | `/api/courses/:id` | student, admin, instructor | Get one course by ID |
| `GET` | `/api/courses/:id/students` | admin, instructor | List students assigned to the course |
| `POST` | `/api/courses` | admin, instructor | Create a course |
| `PUT` | `/api/courses/:id` | admin | Update a course |
| `DELETE` | `/api/courses/:id` | admin, instructor | Delete a course |
| `POST` | `/api/courses/:id/enroll` | student | Self-enroll in course |
| `POST` | `/api/courses/:id/drop` | student | Drop (leave) course |
| `POST` | `/api/courses/:id/add-student` | instructor | Assign a student (body: `studentId`) |
| `POST` | `/api/courses/:id/assign/:studentId` | instructor | Assign a student by ID in URL |

**GET `/api/courses`** — Query (all optional): filter `type`, `title`, `code`, `instructor`, `minCredits`, `maxCredits`, `minCapacity`, `maxCapacity`, `enrolled`; `sort` (e.g. `title`, `-credits`); `fields` (comma-separated); `page`, `limit` (default 6, max 50). Without pagination: `200` array of courses. With pagination: `200` `{ "items": [...], "pagination": { "page", "limit", "total", "totalPages", "hasPrev", "hasNext" } }`. Courses include `studentIds` (string array).

**GET `/api/courses/:id`** — Returns `200` course object or `400`/`404`.

**GET `/api/courses/:id/students`** — Returns `200` array of `{ "id", "firstname", "surname", "email", "department" }` or `403`/`404`.

**POST `/api/courses`** — Body: `title`, `code`, `credits`, `capacity` (required); optional `description`, `type`, `instructor`, `email`, `schedule`, `room`, `prerequisites`, `department`. Returns `201` created course or `400` with `details`.

**PUT `/api/courses/:id`** — Body: any subset of course fields. Returns `200` updated course or `400`/`404`.

**DELETE `/api/courses/:id`** — Returns `200` `{ "ok": true }` or `404`.

**POST `/api/courses/:id/enroll`** — Student only. No body. Rules: not already enrolled; max 5 courses per student; max 2 courses outside student’s department. Returns `200` course or `409` (e.g. "Already enrolled", "Course is full", or limit message).

**POST `/api/courses/:id/drop`** — Student only. Removes current user from course. Returns `200` course or `409` "Not enrolled in this course".

**POST `/api/courses/:id/add-student`** — Instructor only. Body: `studentId` (ObjectId of student). Same enrollment limits as enroll. Returns `200` `{ "ok": true, "message", "course" }` or `404`/`409`.

**POST `/api/courses/:id/assign/:studentId`** — Instructor only. Same as `add-student` with `studentId` in URL.

---

### Contact API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/contact` | — | Submit contact form |

**Request body (JSON or form):** `name`, `email`, `message` (all required; email validated).

**Responses:** `201` `{ "success": true, "message": "Thanks, ...! Your message has been received.", "id": "..." }` or `400` `{ "error": "Validation failed", "details": ["..."] }`.

---

## Routes Organization

- **`routes/pages.js`** — Static and role-based pages: `/`, `/about`, `/contact`, `/login`, `/signup`, `/profile`, `/my-courses`, `/instructor-courses`, `/admin-courses`.
- **`routes/courses.js`** — `GET /courses`, `GET /courses/:id` (role-specific templates).
- **`routes/apiCourses.js`** — REST API for courses (CRUD, enroll, drop, assign, list students).
- **`routes/auth.js`** — `/api/signup`, `/api/login`, `/api/logout`, `/api/me`, `/api/instructors`.
- **`routes/contact.js`** — `POST /contact`; validates and stores in MongoDB `submissions` collection.

## Utility Functions (`utils.js`)

The project uses a centralized utility module with the following functions:

### HTML Utilities
- `escapeHtml(text)` - Prevents XSS attacks by escaping HTML characters

### Course Utilities
- `calculateStats(item)` - Calculates enrollment statistics (percentage, spots remaining)
- `generateCourseInfo(item, stats)` - Generates HTML for course detail pages

### MongoDB Utilities
- `isValidObjectId(id)` - Validates MongoDB ObjectId format
- `toPublic(doc)` - Converts MongoDB documents to public format (replaces `_id` with `id`)

### Query Utilities
- `parseSort(sortRaw)` - Parses sort parameter from query string
- `parseFields(fieldsRaw)` - Parses field projection parameter
- `buildFilter(query)` - Builds MongoDB filter from query parameters

### Validation Utilities
- `isValidEmail(email)` - Validates email format
- `validateCreateBody(body)` - Validates course creation data
- `validateUpdateBody(body)` - Validates course update data
- `validateContactForm(data)` - Validates contact form data

## Database Schema

### Courses Collection
```javascript
{
  _id: ObjectId,
  type: String,              // "course", "lab", "seminar"
  title: String,             // Required
  code: String,              // Required (e.g., "CS101")
  credits: Number,          // Required, positive
  capacity: Number,          // Required, positive
  enrolled: Number,          // Default: 0, non-negative
  description: String,       // Required
  instructor: String,        // Optional
  email: String,            // Optional, validated format
  schedule: String,          // Optional (e.g., "Mon & Wed 10:00-11:30 AM")
  room: String,              // Optional
  prerequisites: String,     // Optional
  createdAt: Date,
  updatedAt: Date
}
```

### Submissions Collection
```javascript
{
  _id: ObjectId,
  name: String,              // Required
  email: String,             // Required, validated format
  message: String,           // Required
  time: String               // ISO timestamp
}
```

## Features

### Course Management
- **Dynamic Course Rendering:** All course data is stored in MongoDB and rendered dynamically
- **Advanced Filtering:** Filter courses by title, code, instructor, type, credits range, capacity range, and enrollment count
- **Sorting:** Sort courses by any field in ascending or descending order
- **Field Projection:** Request only specific fields to reduce response size
- **CRUD Operations:** Full Create, Read, Update, Delete functionality via REST API
- **Enrollment Tracking:** Real-time enrollment status with progress bars
- **Capacity Management:** Automatic validation to ensure enrolled students don't exceed capacity

### Course Search & Filtering
- **Search Fields:** Title, code, instructor (case-insensitive regex matching)
- **Range Filters:** Credits and capacity ranges
- **Type Filtering:** Filter by course type
- **Client-side Filtering:** Interactive filter UI on courses page with accordion interface
- **Real-time Updates:** Filter results update dynamically

### Contact Form
- **Server-side Validation:** Comprehensive validation with detailed error messages
- **Email Validation:** Proper email format checking
- **Data Persistence:** Submissions saved to MongoDB with timestamps
- **Error Handling:** Returns HTTP 400 with validation errors, HTTP 201 on success

### Security Features
- **XSS Protection:** HTML escaping for all user-generated content
- **Input Validation:** Server-side validation for all API endpoints
- **Error Handling:** Proper error messages without exposing internal details
- **Environment Variables:** Sensitive configuration stored in `.env` file

### Course Enrollment Details
- **Dynamic Rendering:** Course information loaded from MongoDB
- **Enrollment Status:** Visual progress bars showing enrollment percentage
- **Course Information Display:**
  - Credits, code, title
  - Description and prerequisites
  - Instructor name and email (clickable mailto links)
  - Schedule and room location
  - Enrollment status with remaining spots calculation
- **Enrollment Functionality:** Frontend JavaScript handles enrollment via PUT request

## Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/your-database
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Database Name (optional, defaults to "assignment3")
MONGODB_DB_NAME=assignment3

# Server Port (optional, defaults to 3000)
PORT=3000
```

## Error Handling

The API returns appropriate HTTP status codes:

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request — validation or invalid input |
| `401` | Unauthorized — not logged in; API returns JSON, pages redirect to login |
| `403` | Forbidden — logged in but wrong role; message only, no redirect to login |
| `404` | Not Found — resource or route not found |
| `409` | Conflict — business rule (e.g. already enrolled, course full, enrollment limits) |
| `500` | Internal Server Error |

Error responses include a JSON object with an `error` field and optional `details` array:
```json
{
  "error": "Bad Request",
  "details": ["title is required", "credits must be a positive number"]
}
```

## Development Notes

### Code Organization
- **Modular Routes:** Each route file handles a specific domain (pages, courses, API, contact)
- **Centralized Utilities:** All helper functions in `utils.js` for reusability
- **Database Abstraction:** MongoDB connection logic separated in `database/mongo.js`
- **Template System:** HTML templates with placeholder replacement for dynamic content

### Best Practices
- Input validation on all endpoints
- HTML escaping to prevent XSS attacks
- Proper error handling and logging
- Environment variables for configuration
- RESTful API design
- Clean code structure with separation of concerns

## Future Roadmap

### Week 1: Project Setup & Planning ✅
* Complete project structure setup
* Technology stack finalization (Node.js, Express, MongoDB)
* UI/UX wireframes and design mockups
* API endpoint planning and documentation
* Team role assignments and task distribution

### Week 2: Basic Forms & POST Requests ✅
* Create course registration form
* Implement POST endpoint for form submissions
* Basic form validation (client-side and server-side)
* Error handling for form submissions
* Frontend-backend communication setup

### Week 3: Database Integration ✅
* Database schema design (Courses, Submissions)
* Database setup and configuration
* CRUD operations for courses
* Data persistence implementation
* Basic data seeding for testing

### Week 4: User Authentication & Authorization
* User registration system
* Login/logout functionality
* Session management
* Role-based access control (Student, Admin)
* Password hashing and security measures

### Week 5: Course Enrollment System
* Course browsing and search functionality ✅
* Course enrollment logic with prerequisites checking
* Enrollment status tracking ✅
* Student dashboard showing enrolled courses
* Enrollment conflict detection (time, capacity)

### Week 6: Course Dropping & Management
* Drop course functionality
* Enrollment history tracking
* Refund/credit hour management (if applicable)
* Course waitlist implementation
* Notification system for enrollment changes

### Week 7: Curriculum Management
* Curriculum display for each student
* Prerequisite tracking and visualization
* Progress tracking (completed vs. required courses)
* Degree requirement checking
* Academic progress dashboard

### Week 8: Timetable Generation System
* Automatic timetable generation algorithm
* Conflict detection and resolution
* Classroom assignment logic
* Time slot optimization
* Timetable visualization (calendar view)
* Export timetable functionality (PDF/Calendar)

### Week 9: Teacher Information & Contact System
* Teacher profile pages
* Contact information display ✅
* Office hours management
* Course-teacher association ✅
* Teacher rating/review system (optional)
* Communication tools integration

### Week 10: Testing, Optimization & Deployment
* Unit testing for backend APIs
* Integration testing
* Frontend testing and UI/UX improvements
* Performance optimization
* Security audit and fixes
* Documentation completion
* Deployment preparation
* User acceptance testing
* Bug fixes and final polish

## License
ISC

## Contributors
- Artur Jaxygaliyev
- Birlik Koshan
- Alikhan Nurzhan
- Nursultan Beisenbek

## Repository
https://github.com/birlikkoshan/web_back_tatty_sarymsaq