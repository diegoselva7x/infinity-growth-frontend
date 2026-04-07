# Infinity Growth — Frontend

ASP.NET MVC frontend for **Infinity Growth**, a financial investment management platform that enables clients to manage portfolios, advisors to handle client relationships, and administrators to oversee the entire system.

> This project consumes the [Infinity Growth REST API](https://github.com/diegoselva7x/infinity-growth-backend) and is built with .NET 8, Razor Views, and Tailwind CSS.

---

## Features

- **Multi-role system** — Admin, Advisor (Asesor), and Client with role-based access control
- **Two-factor authentication** — Login with email/password + OTP validation
- **JWT authentication** — Tokens parsed and stored as secure HttpOnly cookies
- **Investment management** — Clients can view and manage their portfolios in real time
- **PayPal integration** — Deposits and withdrawals via PayPal API
- **Commission tracking** — Admins can view and manage advisor commissions
- **User management** — Admin panel to manage all system users
- **Client registration** — Advisors register new clients with temporary credentials
- **Reports** — Role-specific reports for admins, advisors, and clients
- **Dark / Light theme** — Toggle persisted via localStorage
- **Responsive design** — Mobile-first UI with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | ASP.NET 8 MVC |
| Views | Razor (.cshtml) |
| Styling | Tailwind CSS v4 |
| Auth | JWT + Cookie Authentication + OTP |
| HTTP Client | HttpClient (REST API consumption) |
| UI Libraries | jQuery, SweetAlert2, Flatpickr, GridJS |
| Payments | PayPal API |
| JSON | Newtonsoft.Json |

---

## User Roles

### Admin
- Manage all system users
- View and manage advisor commissions
- Access admin-level reports

### Asesor (Advisor)
- Register new clients
- View client investment reports
- View transaction reports

### Cliente (Client)
- View personal investment portfolio
- Make deposits and withdrawals via PayPal
- Access investment dashboard and client reports

---

## Project Structure

```
InfinityGrowth_UI/
├── Controllers/
│   ├── AuthController.cs        # Login, OTP, logout, password change
│   ├── AdminController.cs       # User management, commissions
│   ├── AsesorController.cs      # Client registration
│   ├── ClienteController.cs     # Portfolio view
│   ├── InversionesController.cs # Investments dashboard
│   ├── WalletController.cs      # PayPal deposits & withdrawals
│   ├── ReportesController.cs    # Role-based reports
│   └── LandingPageController.cs # Public landing page
├── Models/                      # ViewModels and API response models
├── Views/
│   ├── Auth/                    # Login, profile, password change
│   ├── Admin/                   # User management, commissions
│   ├── Asesor/                  # Client registration
│   ├── Cliente/                 # Portfolio
│   ├── Inversiones/             # Investments
│   ├── Reportes/                # All report views
│   ├── LandingPage/             # Public landing page
│   └── Shared/                  # Layout, sidebar, error
├── Helpers/
│   └── JwtHelper.cs             # JWT token utilities
├── wwwroot/
│   ├── css/                     # Tailwind output
│   ├── js/                      # Page-specific JS modules
│   └── public/                  # Images, icons, SVGs
├── Program.cs                   # App config, middleware, auth policies
└── appsettings.json             # Configuration (API base URL)
```

---

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (for Tailwind CSS compilation)
- The [Infinity Growth Backend](https://github.com/diegoselva7x/infinity-growth-backend) running locally

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/diegoselva7x/infinity-growth-frontend.git
   cd infinity-growth-frontend
   ```

2. **Configure the API URL**

   Edit `InfinityGrowth_UI/appsettings.json` and set the backend base URL:
   ```json
   {
     "ApiSettings": {
       "BaseUrl": "https://localhost:YOUR_API_PORT"
     }
   }
   ```

3. **Install frontend dependencies**
   ```bash
   cd InfinityGrowth_UI
   npm install
   ```

4. **Run the application**
   ```bash
   dotnet run
   ```

   The app will be available at `https://localhost:PORT` (check `Properties/launchSettings.json` for the exact port).

---

## Authentication Flow

```
1. User submits email + password
        ↓
2. API validates credentials → returns UserId
        ↓
3. If temporary password → redirect to change password
        ↓
4. OTP sent → user enters OTP
        ↓
5. API validates OTP → returns JWT token
        ↓
6. JWT parsed → claims stored in secure HttpOnly cookie
        ↓
7. Session active for 40 minutes (sliding expiration)
```

---

## Screenshots

> Coming soon

---

## Related Repositories

- **Backend API:** [infinity-growth-backend](https://github.com/diegoselva7x/infinity-growth-backend)
