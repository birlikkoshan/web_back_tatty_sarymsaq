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

## API Routes

### Page Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Home page with navigation |
| `/about` | GET | About page |
| `/contact` | GET | Contact form page |
| `/login` | GET | Login page |
| `/signup` | GET | Sign up page |
| `/courses` | GET | List all courses with filtering and search |
| `/courses/:id` | GET | Course enrollment detail page |

### API Routes

#### Courses API (`/api/courses`)

| Route | Method | Description | Query Parameters |
|-------|--------|-------------|------------------|
| `/api/courses` | GET | Get all courses with filtering, sorting, and field projection | `title`, `code`, `instructor`, `type`, `minCredits`, `maxCredits`, `minCapacity`, `maxCapacity`, `enrolled`, `sort`, `fields` |
| `/api/courses/:id` | GET | Get a specific course by ID | - |
| `/api/courses` | POST | Create a new course | - |
| `/api/courses/:id` | PUT | Update an existing course | - |
| `/api/courses/:id` | DELETE | Delete a course | - |

**Query Parameters for GET /api/courses:**
- `title` - Filter by course title (case-insensitive regex)
- `code` - Filter by course code (case-insensitive regex)
- `instructor` - Filter by instructor name (case-insensitive regex)
- `type` - Filter by course type (exact match)
- `minCredits` - Minimum credits filter
- `maxCredits` - Maximum credits filter
- `minCapacity` - Minimum capacity filter
- `maxCapacity` - Maximum capacity filter
- `enrolled` - Exact enrolled count filter
- `sort` - Sort field (prefix with `-` for descending, e.g., `-title`)
- `fields` - Comma-separated list of fields to return (projection)

**Example API Requests:**
```bash
# Get all courses
GET /api/courses

# Filter courses by title
GET /api/courses?title=Programming

# Sort by credits descending
GET /api/courses?sort=-credits

# Get only title and code fields
GET /api/courses?fields=title,code

# Complex query: filter and sort
GET /api/courses?minCredits=3&type=course&sort=-capacity
```

#### Contact API

| Route | Method | Description |
|-------|--------|-------------|
| `/contact` | POST | Submit contact form (with validation) |

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Thanks, John Doe! Your message has been received.",
  "id": "mongodb_object_id"
}
```

**Response (Error):**
```json
{
  "error": "Validation failed",
  "details": ["Name is required", "Email format is invalid"]
}
```

## Routes Organization

### `routes/pages.js`
Handles static page routes:
- `GET /` → index.html
- `GET /about` → about.html
- `GET /contact` → contact.html
- `GET /login` → login.html
- `GET /signup` → signup.html

### `routes/courses.js`
Handles course page rendering:
- `GET /courses` → Renders courses listing page with dynamic data from MongoDB
- `GET /courses/:id` → Renders course enrollment detail page
- Uses templates: `views/courses.html` and `views/enrollment.html`
- Placeholders: `{{COURSES_LIST}}`, `{{COURSE_INFO}}`, `{{COURSE_TITLE}}`

### `routes/apiCourses.js`
RESTful API for course management:
- Full CRUD operations (Create, Read, Update, Delete)
- Advanced filtering, sorting, and field projection
- Input validation and error handling
- Returns JSON responses

### `routes/contact.js`
Contact form submission handler:
- `POST /contact` → Validates and saves contact form submissions
- Server-side validation with detailed error messages
- Stores submissions in MongoDB `submissions` collection

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
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

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