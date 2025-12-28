# Student and Course Management System
## Team Tatty Sarymsaq
* Artur Jaxygaliyev
* Birlik Koshan
* Alikhan Nurzhan
* Nursultan Beisenbek
## Description
This is a system designed for managing student and course information, which allows for such actions as
* Enrolling to courses
* Dropping from courses
* Finding your own curriculum easily
* Automatically generate comfortable timetable
* See your courses' techears' contact info
## Installation & Running Instructions
1. Clone this repo
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Start the server: `node server.js`
5. Open your browser and visit `http://localhost:3000`

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Home page with navigation |
| `/about` | GET | About page |
| `/contact` | GET | Contact form page |
| `/contact` | POST | Submit contact form (with validation) |
| `/courses` | GET | List all courses with search functionality |
| `/courses/:id` | GET | Course enrollment detail page (dynamic from items.json) |
| `/api/courses` | GET | Get courses JSON with optional search query |
| `/api/info` | GET | Project information in JSON format |
| `/search` | GET | File-based search (query param: `q`) |

## Project Structure

### Routes Organization (`/routes` directory)
The application is organized into modular route files for better maintainability:

- **`pages.js`** - Static pages (home, about, contact)
  - `GET /` → index.html
  - `GET /about` → about.html  
  - `GET /contact` → contact.html

- **`courses.js`** - Course listing and API
  - `GET /courses` → Dynamic courses list with search
  - `GET /api/courses` → Returns filtered courses JSON
  - Uses template: `views/courses.html`

- **`items.js`** - Course detail pages
  - `GET /courses/:id` → Individual course enrollment page
  - Loads data from `items.json`
  - Uses template: `views/enrollment.html`
  - Helper functions: `readItems()`, `findItemById()`, `calculateStats()`, `generateCourseInfo()`

- **`contact.js`** - Contact form submission
  - `POST /contact` → Handle form submissions
  - Server-side validation with HTTP 400 error responses
  - Saves to `submissions.json`

- **`search.js`** - File search functionality
  - `GET /search?q=<query>` → Search files by name

- **`api.js`** - API metadata
  - `GET /api/info` → Project information

### Template-Based HTML Files

- **`views/courses.html`** - Template for courses listing page
  - Placeholder: `{{SEARCH_QUERY}}` - Current search query
  - Placeholder: `{{COURSES_LIST}}` - Generated course cards

- **`views/enrollment.html`** - Template for course detail page
  - Placeholder: `{{COURSE_INFO}}` - Complete course information block
  - Simplified single placeholder for all course details
  - Server generates course info with `generateCourseInfo()` function

## Features

### Dynamic Course Rendering
- All course data comes from `items.json`
- Server reads JSON and generates HTML dynamically
- Templates use `{{PLACEHOLDER}}` system for data injection
- Support for 5 courses: Calculus 1, Introduction to Programming, International Language 1, OOP, Web-Technologies

### Course Search
- **Endpoint:** `GET /courses?q=<query>`
- **Search fields:** Course title, code, instructor, description
- **Case-insensitive:** Search matches partial strings
- **API:** `GET /api/courses?q=<query>` returns JSON

### Contact Form Validation
- **Required fields:** Name, Email, Message
- **Email validation:** Proper email format check
- **HTTP 400 response:** Returns JSON with validation errors
- **Success response:** HTTP 201 with confirmation message
- **Storage:** Submissions saved to `submissions.json` with timestamp

### Course Enrollment Details
- **Dynamic rendering** from `items.json`
- **Course information includes:**
  - Credits, code, title
  - Description and prerequisites
  - Instructor name and email
  - Schedule and room location
  - Enrollment status with progress bar
  - Remaining spots calculation

## Forms

### Contact Form
- **Fields:** Name, Email, Message
- **Submission:** POST to `/contact`
- **Validation:** Server-side with HTTP 400 error responses for invalid data
- **Response:** JSON with success message or validation error details
- **Storage:** Submissions saved to `submissions.json` with timestamp

## Additional Features

### Search Functionality
- **Endpoint:** `GET /search?q=<query>`
- **Description:** Search through available pages in the views directory
- **Usage:** Navigate to `/search?q=about` to find pages matching "about"
- **Response:** HTML list of matching pages with links

### Course Detail Pages
- **Endpoint:** `GET /courses/:id`
- **Description:** Display detailed information about a specific course
- **Fallback:** Checks static HTML file first, then `items.json` for matching data
- **Response:** Rendered course enrollment page with all details

### API Info
- **Endpoint:** `GET /api/info`
- **Description:** Returns project metadata including name, version, description, and available routes
- **Response:** JSON object with project information

## Future Roadmap

### Week 1: Project Setup & Planning
* Complete project structure setup
* Technology stack finalization (Node.js, Express, Database choice)
* UI/UX wireframes and design mockups
* API endpoint planning and documentation
* Team role assignments and task distribution

### Week 2: Basic Forms & POST Requests
* Create course registration form
* Implement POST endpoint for form submissions
* Basic form validation (client-side)
* Error handling for form submissions
* Frontend-backend communication setup

### Week 3: Database Integration
* Database schema design (Students, Courses, Enrollments, Teachers, Timetables)
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
* Course browsing and search functionality
* Course enrollment logic with prerequisites checking
* Enrollment status tracking
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
* Contact information display
* Office hours management
* Course-teacher association
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

