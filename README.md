# 📰 Marko's Blog  

**A full-stack blog platform built with ASP.NET Core 8.0 and React.js**  

Marko's Blog is a modern blogging platform designed to provide users with an intuitive and interactive experience.  
It enables users to create, edit, and follow blog posts, interact through comments and likes, and receive **real-time notifications** powered by SignalR.  
The system is built using **Clean Architecture** principles and follows the **CQRS (Command Query Responsibility Segregation)** pattern for high scalability and maintainability.

🔗 Live Demo https://marko-blog.vercel.app/

👨‍💻 Admin login: <br/>
Username: admin <br/>
Password: admin123

👨‍💻 Author login: <br/>
Username: emily_s <br/>
Password: pass123

---

## 🧩 Database Schema 

<img width="1684" height="1193" alt="database" src="https://github.com/user-attachments/assets/dff2f658-ed57-4b0c-9c1b-9921fa39fce2" />

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

```graphql
MyBlog/
├── Domain/           # Core entities and business models
├── EFDataAccess/     # Entity Framework configurations, migrations & DbContext
├── Application/      # CQRS commands & queries, DTOs, validation
├── Implementation/   # Services, repositories, SignalR hub, etc.
├── API/              # ASP.NET Core Web API (Controllers, Middleware, JWT)
└── Client/           # React.js frontend app (Vite)
```

---

## ⚡ Setup Instructions  

### 🔧 1. Prerequisites 
Install:
- .NET SDK 8.0+
- Node.js 18+
- PostgreSQL: Railway hosted instance or Local PostgreSQL (postgres default user)
- EF Core CLI tool:
```bash
dotnet tool install --global dotnet-ef --version 8.0.0
```

### 🗄️ 2. Backend Appsettings
Before running the API, create your local config file:
Go to the API/ folder
Copy the template file:
```pgsql
appsettings.Development.json.example → appsettings.Development.json
```
Open the new file and fill in your real values: <br/> 
PostgreSQL connection string (Railway or local Postgres) <br/>
JWT secret key (min 32 chars) <br/>
Optional SMTP config <br/> 
This file is NOT tracked by Git and must be created manually. <br/>

🔐 JWT Example
```json
"JWT": {
    "Issuer": "http://localhost:5000",
    "Audience": "BlogClient",
    "SecretKey": "your-dev-secret-key-min-32-chars",
    "TokenExpiryMinutes": 120
},
```

✉ SMTP Example
```json
"SMTP": {
    "SenderEmail": "noreply@yourdomain.com",
    "Host": "smtp.yourdomain.com",
    "Port": 587,
    "Username": "noreply@yourdomain.com",
    "Password": "your-smtp-password"
}
```

### 🗃️ 3. Database Configuration (PostgreSQL)
API uses PostgreSQL connection from appsettings.Development.json. <br/>
✔ Railway example:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=YOUR_HOST;Port=YOUR_PORT;Database=railway;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
}
```

✔ Local PostgreSQL example:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=blog;Username=postgres;Password=yourpassword"
}
```

📦 Required NuGet package:
```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

### 🛠️ 4. Apply Migrations
Start migrations:
```bash
cd EFDataAccess
dotnet ef database update
```
This creates the blog database automatically.

### 🌱 5. Seed Initial Data

Seeder will automatically start when you run API.
```bash
cd API
dotnet run
```
If the database is empty, initial data will be inserted.

### 💻 6. Frontend Environment Variables
In folder `Client/` create `.env` <br/>
It must be next to vite.config.js.

🔥 Firebase
```ini
VITE_FIREBASE_API_KEY=AIzaSyBp3oi6SrSoQ8G3jrgzZKye4KSmrLCae7k
VITE_FIREBASE_AUTH_DOMAIN=blog-a6b98.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=blog-a6b98
VITE_FIREBASE_STORAGE_BUCKET=blog-a6b98.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=311198757906
VITE_FIREBASE_APP_ID=1:311198757906:web:3023a83a49eeb68fa494cb
VITE_FIREBASE_MEASUREMENT_ID=G-TJWVQ5W4KH
```
🔗 API URL:
```ini
VITE_API_URL=http://localhost:5000/api
```

### ▶️ 7. Start Backend
```bash
cd Api
dotnet restore
dotnet run
```
Backend URL: http://localhost:5000
Swagger: http://localhost:5000/swagger

### ▶️ 8. Start Frontend
```bash
cd Client
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

