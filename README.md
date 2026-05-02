# 📰 Marko's Blog

> A full-stack blog platform featuring real-time interactions, CQRS-inspired architecture, fine-grained authorization, and hybrid authentication.

🔗 **Live Demo:** [https://marko-blog.vercel.app/](https://marko-blog.vercel.app/)

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Problem & Motivation](#-problem--motivation)
- [Key Features](#-key-features)
- [Demo Credentials](#-demo-credentials)
- [Tech Stack](#-tech-stack)
- [Architecture Explained](#-architecture-explained)
- [Authentication System](#-authentication-system)
- [Real-Time Notifications](#-real-time-notifications)
- [Authorization Model](#-authorization-model)
- [Database Schema](#-database-schema)
- [Folder Structure](#-folder-structure)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Database Seed](#-database-seed)
- [Deployment](#-deployment)
- [Tradeoffs & Limitations](#️-tradeoffs--limitations)

---

## 📌 Overview

Marko's Blog is a full-stack web application that allows users to create, interact with, and follow blog content in real time.

The system is designed to demonstrate:

- Scalable backend architecture (CQRS-inspired with Clean Architecture)
- Real-time communication via SignalR (WebSockets)
- Custom authorization logic beyond basic role checks
- Integration of external authentication (Google via Firebase)

---

## 🧠 Problem & Motivation

Most blog platforms are simple CRUD applications with minimal real-time capabilities and tightly coupled logic. This project explores how to:

- Separate read and write operations for better structure and maintainability
- Handle real-time user interactions (likes, comments, follows, posts)
- Design a flexible authorization system beyond basic role assignments
- Integrate external identity providers while maintaining full backend control

---

## 🚀 Key Features

- 📝 Create, edit, and manage blog posts with categories and images
- 💬 Comment system with nested replies (threaded comments)
- ❤️ Like/unlike posts and comments
- 👥 Follow system - users receive updates from authors they follow
- 🔔 Real-time notifications via WebSockets (SignalR)
- 🔐 Hybrid authentication (JWT + Google via Firebase)
- 🧠 Use-case driven architecture with centralized execution pipeline
- 📊 Full audit log of all executed use-case operations
- 🛡 Fine-grained authorization per action (not just role-based)
- 📧 Email notification on registration (SMTP)
- 📋 Author request system - users can apply to become authors
- 🌙 Light / Dark theme toggle

---

## 👤 Demo Credentials

Use these accounts to explore the live demo:

👨‍💻 **Admin login:**
```
Username: admin
Password: admin123
```

👨‍💻 **Author login:**
```
Username: emily_s
Password: pass123
```

---

## 🛠 Tech Stack

### Backend

![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core_8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white)
![Entity Framework](https://img.shields.io/badge/Entity_Framework_Core-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![SignalR](https://img.shields.io/badge/SignalR-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![FluentValidation](https://img.shields.io/badge/FluentValidation-CC0000?style=for-the-badge&logoColor=white)
![Sentry](https://img.shields.io/badge/Sentry-362D59?style=for-the-badge&logo=sentry&logoColor=white)

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Redux](https://img.shields.io/badge/Redux_Toolkit-593D88?style=for-the-badge&logo=redux&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)

### Database & Deployment

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Fly.io](https://img.shields.io/badge/Fly.io-7B36ED?style=for-the-badge&logoColor=white)

---

## 🧱 Architecture Explained

The backend follows a layered architecture inspired by **Clean Architecture** and **CQRS** principles.

### Layers

| Layer | Responsibility |
|---|---|
| `Domain` | Core business entities and interfaces - no infrastructure dependencies |
| `EFDataAccess` | Database access via Entity Framework Core, configurations, migrations |
| `Application` | Use-case interfaces (CQRS), DTOs, validators, service contracts |
| `Implementation` | Concrete implementations of commands, queries, services, validators |
| `API` | ASP.NET Core Web API - controllers, middleware, JWT, SignalR, DI config |
| `Client` | React frontend - routing, Redux state, real-time layer |

### Command vs Query Separation

- **Commands** → mutate system state (Create, Update, Delete)
- **Queries** → read data only

```
CreatePostCommand   → creates a post + triggers notifications
GetPostsQuery       → fetches filtered and paginated posts
```

### Centralized Execution Pipeline

Every action flows through a single `UseCaseExecutor`:

```
HTTP Request
    ↓
UseCaseExecutor
    ├── Logs the request (actor, data, use-case name)
    ├── Checks permissions (AllowedUseCases)
    └── Executes the use-case
```

---

## 🔐 Authentication System

The app uses a **hybrid authentication** approach.

### Standard Login

1. User sends `username` + `password`
2. Backend validates credentials (BCrypt hash check)
3. JWT is issued and returned

### Google OAuth (Firebase)

1. User signs in via Google popup (Firebase SDK)
2. Frontend receives user data (email, name, avatar)
3. Data is sent to `/api/auth`
4. Backend checks if user exists - creates one if needed
5. JWT is issued and returned

> ⚠️ Firebase is used only as an identity provider. JWT is the sole source of authorization. Firebase tokens are not verified on the backend (a production requirement).

---

## 🔔 Real-Time Notifications

The system combines **REST** and **WebSocket (SignalR)** communication.

### Initial Load

Notifications are fetched via REST API on app start.

### Real-Time Updates

```
User performs action (like / comment / follow / post)
    ↓
Backend creates a Notification record
    ↓
SignalR pushes it to the target user's group
    ↓
Frontend Redux state updates instantly
    ↓
UI re-renders
```

Each user is assigned to a **SignalR group** by their `IdUser`, so notifications are targeted and multi-device friendly.

---

## 🛡 Authorization Model

Instead of classic `[Authorize(Roles = "Admin")]` on controllers, this system uses **use-case level permissions**.

- Each user has a list of allowed `UseCaseEnum` values stored in `UserUseCases`
- Permissions are derived from their role (Admin / Author / User) and automatically updated when role changes
- Every action is validated inside `UseCaseExecutor` before execution

This enables:

- Fine-grained control (e.g., delete own comment vs. delete any comment)
- Easy extension of permissions without touching controllers
- Full auditability via use-case logs

---

## 🧩 Database Schema

<img width="1684" height="1193" alt="database" src="https://github.com/user-attachments/assets/dff2f658-ed57-4b0c-9c1b-9921fa39fce2" />

---

## 📁 Folder Structure

```
My_Blog/
├── Domain/                          # Business entities (Post, User, Comment, etc.)
│   └── *.cs
│
├── EFDataAccess/                    # EF Core DbContext, configurations, migrations
│   ├── BlogContext.cs
│   ├── Configurations/
│   └── Seed/
│
├── Application/                     # CQRS interfaces, DTOs, validators, services
│   ├── Commands/
│   ├── Queries/
│   ├── DataTransfer/
│   ├── Searches/
│   ├── Services/
│   └── Exceptions/
│
├── Implementation/                  # Concrete implementations
│   ├── Commands/
│   ├── Queries/
│   ├── Services/
│   ├── Validators/
│   ├── Logging/
│   └── Extensions/
│
├── API/                             # ASP.NET Core Web API
│   ├── Controllers/
│   │   ├── PostsController.cs
│   │   ├── CommentsController.cs
│   │   ├── CategoriesController.cs
│   │   ├── LikesController.cs
│   │   ├── FollowersController.cs
│   │   ├── NotificationsController.cs
│   │   ├── UsersController.cs
│   │   ├── LoginController.cs
│   │   ├── OAuthController.cs
│   │   ├── RegisterController.cs
│   │   ├── AuthorRequestsController.cs
│   │   ├── ImagesController.cs
│   │   └── UseCaseLogsController.cs
│   ├── Core/
│   │   ├── JWTManager.cs
│   │   ├── JWTService.cs
│   │   ├── NotificationHub.cs
│   │   ├── SignalRNotificationHub.cs
│   │   ├── GlobalExceptionHandler.cs
│   │   └── APIExtension.cs
│   ├── Services/
│   ├── Startup.cs
│   └── Program.cs
│
└── Client/                          # React frontend
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── PostsPage.jsx
        │   ├── PostPage.jsx
        │   ├── CreatePost.jsx
        │   ├── UpdatePost.jsx
        │   ├── Dashboard.jsx
        │   ├── SignIn.jsx
        │   ├── SignUp.jsx
        │   ├── UserPage.jsx
        │   ├── Authors.jsx
        │   ├── CategoryPage.jsx
        │   ├── CreateCategory.jsx
        │   ├── NotificationsPage.jsx
        │   └── UserCommentPage.jsx
        ├── components/
        │   ├── Header.jsx
        │   ├── Footer.jsx
        │   ├── PostCard.jsx
        │   ├── CommentSection.jsx
        │   ├── Comment.jsx
        │   ├── ChildComment.jsx
        │   ├── AdminDashboard.jsx
        │   ├── DashPosts.jsx
        │   ├── DashComments.jsx
        │   ├── DashUsers.jsx
        │   ├── DashCategories.jsx
        │   ├── DashLogs.jsx
        │   ├── DashAuthorRequests.jsx
        │   ├── DashProfile.jsx
        │   ├── PrivateRoute.jsx
        │   ├── OnlyRolePrivateRoute.jsx
        │   ├── ThemeProvider.jsx
        │   └── OAuth.jsx
        ├── redux/
        │   ├── user/userSlice.js
        │   ├── theme/themeSlice.js
        │   └── notification/notificationsSlice.js
        ├── contexts/
        │   ├── ErrorContext.jsx
        │   └── SuccessContext.jsx
        ├── api/
        ├── services/
        ├── utils/
        ├── App.jsx
        └── main.jsx
```

---

## ⚙️ Setup Instructions

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/) running locally
- A Firebase project (for Google OAuth)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/marko-blog.git
cd marko-blog
```

---

### 2. Backend Setup

#### Configure `appsettings.Development.json`

Inside the `API/` folder, update `appsettings.Development.json` with your local values:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=blog;Username=postgres;Password=postgres;SSL Mode=Disable"
  },
  "JWT": {
    "Issuer": "http://localhost:5000",
    "Audience": "BlogClient",
    "SecretKey": "your-dev-secret-key-min-32-chars",
    "TokenExpiryMinutes": 120
  },
  "SMTP": {
    "SenderEmail": "noreply@yourdomain.com",
    "Host": "smtp.yourdomain.com",
    "Port": 587,
    "Username": "noreply@yourdomain.com",
    "Password": "your-smtp-password"
  }
}
```

#### Run Migrations & Start the API

```bash
cd API

# Restore dependencies
dotnet restore

# Apply database migrations (creates tables)
dotnet ef database update

# Start the API
dotnet run
```

The API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd Client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🌿 Environment Variables

### Backend - `appsettings.Development.json`

| Key | Description |
|---|---|
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string |
| `JWT:Issuer` | Token issuer (your API URL) |
| `JWT:Audience` | Token audience (your client name) |
| `JWT:SecretKey` | Secret key - minimum 32 characters |
| `JWT:TokenExpiryMinutes` | Token lifetime in minutes |
| `SMTP:Host` | SMTP server host |
| `SMTP:Port` | SMTP port (587 for TLS) |
| `SMTP:SenderEmail` | Email address used for sending |
| `SMTP:Password` | App password for SMTP auth |

### Frontend - `Client/.env`

Create a `.env` file inside the `Client/` folder:

```env
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
```

> 💡 The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically - you only need `VITE_API_URL` for production builds.

---

## 🌱 Database Seed

The application automatically seeds the database on first run via `DataSeeder.cs`.

Seeded data includes:

- **Roles** - Admin, Author, User
- **Users** - including `admin` and `emily_s` accounts with use-case permissions
- **Categories** - initial blog categories
- **Posts** - sample blog posts with images
- **Post–Category** links
- **Comments** - sample comments with nested replies
- **Followers** - sample follow relationships
- **Likes** - sample likes on posts and comments
- **Notifications** - sample notification entries

> Seeding only runs when the respective tables are empty, so it is safe to re-run.

To manually trigger a fresh seed, drop and recreate the database:

```bash
dotnet ef database drop
dotnet ef database update
```

---

## 🚀 Deployment

| Layer | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com/) |
| Backend | [Fly.io](https://fly.io/) |
| Database | PostgreSQL on [Fly.io](https://fly.io/) |

The project includes a `Dockerfile` and `fly.toml` for backend deployment, and a `vercel.json` for frontend deployment.

---

## ⚠️ Tradeoffs & Limitations

- Firebase token is **not verified** on the backend (would be required in production)
- No recovery mechanism for **missed SignalR events** (e.g., notifications sent while offline)
- Commands handle side-effects (like notifications) **directly** - no event bus or message queue
- `UseCaseEnum` may become **harder to maintain** at scale
- Images are stored **locally** on the server (not cloud-optimized - no S3 or CDN)
- Two sources of truth for auth state: **Redux** + **localStorage** (can desync on edge cases)

---

## 🎯 Why This Project Matters

This project goes beyond a typical CRUD blog and demonstrates:

- Real-time full-stack application design with SignalR
- Clean separation of concerns across multiple backend layers
- Custom authorization beyond simple role checks
- Integration of external OAuth providers (Google/Firebase)
- Practical application of **SOLID principles** in a layered architecture
- CQRS approach with centralized use-case execution and audit logging

It represents a step toward production-oriented system design in the .NET + React ecosystem.
