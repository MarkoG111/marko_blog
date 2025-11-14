# 📰 MyBlog  

**A full-stack blog platform built with ASP.NET Core 8.0 and React.js**  

MyBlog is a modern blogging platform designed to provide users with an intuitive and interactive experience.  
It enables users to create, edit, and follow blog posts, interact through comments and likes, and receive **real-time notifications** powered by SignalR.  
The system is built using **Clean Architecture** principles and follows the **CQRS (Command Query Responsibility Segregation)** pattern for high scalability and maintainability.

🔗 Live Demo https://gacho-dev.rs/marko-blog

---

## 🧩 Table of Contents  
- [Key Features](#key-features)  
- [Architecture Overview](#architecture-overview)  
- [Technologies Used](#technologies-used)  
- [Security](#security)  
- [Performance and Scalability](#performance-and-scalability)  
- [Folder Structure](#folder-structure)  
- [Setup Instructions](#setup-instructions)  

---

## 🔑 Key Features  

✅ **Post Management** – Create, edit, and delete blog posts with images and categories.  
✅ **Comments & Likes** – Interact with posts and comments in real-time.  
✅ **Following System** – Follow favorite authors and get updates about their activity.  
✅ **Real-Time Notifications** – SignalR provides instant updates on comments, likes, and follows.  
✅ **JWT + Firebase Authentication** – Ensures secure login and role-based access.  
✅ **Advanced Filtering & Pagination** – Find content efficiently by multiple criteria.  
✅ **Use Case Logging** – Every action is logged for transparency and analysis.  
✅ **Responsive Design** – Fully optimized for desktop and mobile devices.  
✅ **Administrative Dashboard** – Manage users, posts, and author requests.  

---

## 🏗️ Architecture Overview  

MyBlog follows a **multi-layered architecture** adhering to **Clean Architecture** and **SOLID** principles:

| Layer | Description |
|-------|--------------|
| **Domain** | Defines core business entities and rules. Independent of any technical details. |
| **EFDataAccess** | Manages database operations using Entity Framework Core. Includes configurations, migrations, and global filters. |
| **Application** | Contains business logic, use-cases, commands, queries, DTOs, validation, and logging. Implements the **CQRS** pattern. |
| **Implementation** | Provides concrete service implementations (repositories, SignalR, email services, etc.). |
| **API** | ASP.NET Core Web API exposing RESTful endpoints for the frontend. Includes centralized error handling and JWT authentication. |
| **Client** | React.js frontend communicating with the API via Fetch API and SignalR. Uses Redux Toolkit for state management and Tailwind CSS for styling. |

---

## ⚙️ Technologies Used  

### 🖥 Backend  
- **ASP.NET Core 8.0** – Web API  
- **C#** – Core language  
- **Entity Framework Core** – ORM for SQL Server  
- **SignalR** – Real-time WebSocket communication  
- **CQRS** – Segregated command and query processing  
- **JWT** – Token-based authentication  
- **Sentry** – Error logging and performance tracking

### 💻 Frontend  
- **React.js** – Client-side app  
- **Redux Toolkit** – Global state management  
- **Tailwind CSS & Flowbite React** – UI styling  
- **Fetch API** – Communication with backend  

### 🗄 Database  
- **SQL Server** – Relational database  
- **EF Core Migrations** – Database version control  

---


## 🔐 Security  

- **JWT (JSON Web Token)** – Handles user authentication and role-based access.  
- **Firebase** – Supports external authentication providers.  
- **FluentValidation** – Validates request data at the application layer.  
- **Global Exception Handling** – Centralized API error management for consistent responses.  

---

## 🚀 Performance and Scalability  

- **Asynchronous operations** – Non-blocking data processing for better performance.  
- **Pagination & Filtering** – Efficiently retrieves only relevant data.  
- **BulkExtensions** – Optimized for large-scale database operations.  
- **Decoupled services** – Easy horizontal scaling and independent deployment.  

---

## 📁 Folder Structure  

MyBlog/<br/>
├── Domain/ # Core entities and business models <br/>
├── EFDataAccess/ # Entity Framework configurations & DbContext <br/>
├── Application/ # CQRS commands, queries, DTOs, validation <br/>
├── Implementation/ # Services, repositories, SignalR hub, etc. <br/>
├── API/ # ASP.NET Core Web API (Controllers, Middleware) <br/>
└── Client/ # React.js frontend app <br/>


---

## ⚡ Setup Instructions  

### 🔧 Prerequisites  
- .NET SDK 8.0+  
- Node.js 18+  
- SQL Server (local or remote)  

### 📦 Backend Setup  
```bash
cd API
dotnet restore
dotnet ef database update
dotnet run
```

### 💻 Frontend Setup
```bash
cd Client
npm install
npm start
```

The backend will run (by default) on https://localhost:5001, and the React client on http://localhost:3000.


