# Task Management Frontend

A modern React application for managing tasks with a beautiful, responsive UI.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **User Authentication**: Login and registration with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Task Categories**: Organize tasks by work, personal, shopping, health, or other
- **Task Status**: Mark tasks as completed or pending
- **Real-time Updates**: Socket.IO integration for live updates
- **Filtering**: Filter tasks by status and category
- **Statistics**: View task completion statistics
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **Socket.IO Client**: Real-time communication

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## 🔧 Configuration

The frontend is configured to proxy API requests to the backend server running on `http://localhost:3001`. Make sure your backend server is running before using the frontend.

### Environment Variables

The frontend uses the following environment variables (configured in `vite.config.js`):

- `VITE_API_URL`: Backend API URL (default: `http://localhost:3001`)
- `VITE_SOCKET_URL`: Socket.IO server URL (default: `http://localhost:3001`)

## 📱 Usage

### Authentication

1. **Register**: Create a new account with email, password, and name
2. **Login**: Sign in with your credentials
3. **Demo Account**: Use the provided demo account for testing:
   - Email: `john@example.com`
   - Password: `password123`

### Task Management

1. **Create Task**: Click "Add New Task" button
2. **Edit Task**: Click the edit icon on any task
3. **Delete Task**: Click the delete icon on any task
4. **Mark Complete**: Click the checkbox to toggle completion status
5. **Filter Tasks**: Use the dropdown to filter by status or category

### Features

- **Task Categories**: Choose from Work, Personal, Shopping, Health, or Other
- **Task Descriptions**: Add optional descriptions to your tasks
- **Completion Tracking**: Mark tasks as completed with visual feedback
- **Statistics Dashboard**: View total, completed, and pending task counts
- **Real-time Updates**: See changes instantly across all connected clients

## 🎨 UI Components

### Components Structure

```
src/
├── components/
│   ├── Dashboard.jsx          # Main dashboard with task management
│   ├── Header.jsx             # Navigation header with user menu
│   ├── LoginForm.jsx          # User login form
│   ├── RegisterForm.jsx       # User registration form
│   ├── TaskForm.jsx           # Create/edit task modal
│   └── TaskList.jsx           # Display list of tasks
├── contexts/
│   └── AuthContext.jsx        # Authentication state management
├── App.jsx                    # Main app component with routing
└── main.jsx                   # Application entry point
```

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom CSS**: Additional styles in `src/index.css`
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: CSS variables for easy theming

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Input Validation**: Client-side form validation
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Token-based CSRF protection

## 📊 API Integration

The frontend integrates with the backend API endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder to Netlify

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run clean` - Clean build artifacts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Ensure the backend server is running
3. Verify your database connection
4. Check the network tab for API errors

For more help, please refer to the backend documentation or create an issue in the repository.
