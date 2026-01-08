# Calendar Tool

A comprehensive calendar and scheduling application for managing appointments, team availability, and accelerations.

## Features

- 📅 Calendar management with day, week, and month views
- 👥 Team-based scheduling and availability management
- 📊 Capacity planning with visual timeline
- 🚀 Acceleration request system with approval workflow
- 📋 Customizable SOW and email templates
- 🔐 Role-based access control (Admin, CPM, Engineer, Managers)
- 📆 Blocked dates and capacity override management
- 🕒 Time off request system
- 📈 Engineer shift scheduling
- 🔄 Microsoft Teams meeting integration
- 🎨 Light/dark theme support

## Tech Stack

- Node.js 23.9.0
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React Icons
- Vitest for testing
- Zustand for state management
- React Router v6
- date-fns for date manipulation

## Getting Started

### Prerequisites

- Node.js 23.9.0+
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/calendar-tool.git
   cd calendar-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run coverage
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── features/      # Feature-specific code and business logic
├── hooks/         # Custom React hooks
├── lib/          # Utilities and configurations
├── pages/        # Page components
├── store/        # Global state management
├── types/        # TypeScript type definitions
└── utils/        # Helper functions and utilities
```

## Key Features

### Calendar Management
- Day, week, and month views
- Visual timeline of appointments
- Teams meeting integration
- Drag and drop scheduling

### Team Management
- Team-based organization
- Engineer assignment
- Role-based permissions
- Shift scheduling

### Availability Management
- Weekly schedule configuration
- Capacity planning
- Blocked dates
- Date-specific overrides
- Time off requests

### Workflow Management
- Product type configuration
- Change type management
- Duration settings
- Exclusive change types

### Template System
- SOW templates
- Email templates
- Variable substitution
- Active template management

### Acceleration System
- Request submission
- Approval workflow
- Custom fields
- Priority levels

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling
- Write unit tests for critical functionality

### Component Structure
- Keep components focused and reusable
- Use TypeScript interfaces for props
- Implement proper loading and error states
- Follow accessibility best practices

### State Management
- Use Zustand for global state
- Implement proper state persistence
- Handle loading and error states
- Use React Query for data fetching

### Testing
- Write unit tests for critical functionality
- Test error handling
- Test edge cases
- Maintain good test coverage

### Performance
- Implement proper memoization
- Optimize re-renders
- Use proper TypeScript types
- Follow React best practices

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run coverage` - Generate test coverage
- `npm run lint` - Run ESLint

## Environment Variables

The following environment variables are required:

```env
VITE_TEAMS_API_KEY=your_teams_api_key
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.