<img width="1365" height="562" alt="image" src="https://github.com/user-attachments/assets/49557d01-91af-487f-8680-c6668934ac78" />

# Nexus API - Backend Developer Internship Assignment

A scalable REST API with JWT Authentication, Role-Based Access Control (RBAC), and a responsive React frontend.

## 🚀 Core Features

### Backend (Primary Focus)
- **User Authentication**: Secure registration and login with password hashing (bcrypt) and JWT token generation.
- **RBAC (Role-Based Access Control)**: Middleware to differentiate between `user` and `admin` roles.
- **Project CRUD**: RESTful APIs for managing a 'Project' entity.
- **API Versioning**: All endpoints are prefixed with `/api/v1/`.
- **Validation**: Strict input validation using Zod.
- **Security**: Implementation of Helmet for secure headers and CORS for resource sharing.

### Frontend
- **Modern UI**: Built with React, Tailwind CSS, and Shadcn UI.
- **Auth Flow**: Protected routes ensuring only authenticated users access the dashboard.
- **Interactive Dashboard**: Perform CRUD operations on projects with real-time feedback.
- **State Management**: Clean state handling for authentication tokens and data fetching.

---

## 🛠 Tech Stack

- **Server**: Node.js, Express.js
- **Database**: SQLite (via `better-sqlite3`)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Validation**: Zod
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **UI Components**: Shadcn UI, Lucide Icons

---

## 📖 API Documentation

### Auth Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/auth/register` | Create a new user account | No |
| POST | `/api/v1/auth/login` | Authenticate user and return JWT | No |

### Projects Endpoints
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/v1/projects` | List all projects (Admin see all, Users see own) | Yes | Any |
| POST | `/api/v1/projects` | Create a new project | Yes | Any |
| PUT | `/api/v1/projects/:id` | Update an existing project | Yes | Owner/Admin |
| DELETE| `/api/v1/projects/:id` | Delete a project | Yes | Owner/Admin |

### Admin Endpoints
| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/v1/admin/stats` | System statistics (Users/Projects count) | Yes | Admin |

---

## 📈 Scalability & Future Improvements

To transition this proof-of-concept into a production-grade system, the following enhancements are recommended:

1. **Database Migration**: Move from SQLite to a distributed SQL database like **PostgreSQL** or **MySQL**. Use an ORM like **Prisma** or **Drizzle** for type-safe queries and migration management.
2. **Caching**: Implement **Redis** for session management and caching frequently accessed data (like project lists) to reduce database load.
3. **Microservices**: If the system grows, decouple the Auth service from the Project service. This allows independent scaling of high-traffic modules.
4. **Logging & Monitoring**: Integrate structured logging with **Winston** or **Pino**, and monitor system health with **Prometheus/Grafana** or **Datadog**.
5. **Containerization**: Use **Docker** and Kubernetes for consistent deployment across environments and effortless scaling.
6. **Load Balancing**: Deploy behind an **NGINX** reverse proxy or cloud load balancer to distribute traffic and handle SSL termination.

---

## 🛠 Setup & Development

1. **Install Dependencies**: `npm install`
2. **Launch Dev Server**: `npm run dev`
3. **Access App**: `http://localhost:3000`

The database (`database.db`) is automatically initialized on the first run.
