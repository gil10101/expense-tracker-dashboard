# ExpenseTracker3D

A modern expense tracking application with stunning 3D visualizations built with Next.js and Three.js.

## Overview

ExpenseTracker3D helps you manage your personal finances with a visually engaging interface. Track expenses, set budgets, and visualize your spending patterns with interactive 3D charts and graphs.

## Features

- **3D Visualizations**: Interactive 3D animations using Three.js to visualize your financial data
- **Expense Tracking**: Add, categorize, and manage expenses with an intuitive interface
- **Budget Management**: Set and track budgets for different expense categories
- **Analytics Dashboard**: View comprehensive analytics of your spending patterns
- **User Authentication**: Secure user authentication with Firebase
- **Profile Management**: Customize your profile and account settings
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Search Functionality**: Easily find expenses with the search feature
- **Notifications**: Get alerts about budget limits and other important updates

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **3D Rendering**: Three.js, React Three Fiber
- **Authentication & Database**: Firebase (Authentication, Firestore)
- **State Management**: React Context API
- **UI Components**: Radix UI, Shadcn UI
- **Charts**: Recharts
- **Animation**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/expense-tracker-3d.git
   cd expense-tracker-3d
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up/Login**: Create an account or login with your credentials
2. **Dashboard**: View your financial overview with 3D visualizations
3. **Expenses**: Add, edit, and categorize your expenses
4. **Budgets**: Set up and manage budgets for different categories
5. **Analytics**: Explore detailed analytics of your spending patterns
6. **Profile**: Manage your profile settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.

