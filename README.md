# JustBank

JustBank is a modern, full-stack banking web application that allows users to securely connect their bank accounts, view balances, transfer funds, and analyze their spending with real-time analytics and a beautiful, responsive UI.

## Features

- **Bank Account Integration:** Securely connect and manage multiple bank accounts using Plaid and Dwolla APIs.
- **Transaction History:** View and search your complete transaction history, including live demo data for testing.
- **Fund Transfers:** Instantly transfer money between your connected accounts.
- **Spending Analytics:** Visualize your spending by category with interactive charts and summaries.
- **Authentication:** Secure sign-in and sign-up flows with modern UI.
- **Responsive Design:** Works seamlessly on desktop and mobile devices.
- **Error Handling:** Robust error boundaries and user-friendly feedback.

## Getting Started 

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd JustBank
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in your API keys and configuration for Plaid, Dwolla, and Appwrite.

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/` — Next.js app directory (routes, layouts, API endpoints)
- `components/` — Reusable UI components
- `lib/` — Utility functions and API integrations
- `constants/` — Static configuration and constants
- `public/` — Static assets (icons, images)
- `types/` — TypeScript type definitions

## Technologies Used
- Next.js 13+
- React 18+
- TypeScript
- Tailwind CSS
- Plaid API
- Dwolla API
- Appwrite
- Chart.js

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.