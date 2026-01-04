# Contributing to Brainlyx AI

Thank you for your interest in contributing to Brainlyx AI! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- A Supabase account (for testing database features)
- API keys for AI providers (optional, for testing AI integrations)

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/Mamoonkhan11/BrainlyxAI.git
   cd BrainlyxAI
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```

## 📝 Contribution Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Commit Messages
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

Examples:
```
feat(auth): add Google OAuth integration
fix(chat): resolve message streaming issue
docs(readme): update installation instructions
```

### Pull Request Process
1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines

3. **Test your changes**:
   ```bash
   npm run lint
   npm run build
   npm run test  # if tests exist
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - Test instructions

## 🏗️ Architecture Guidelines

### Component Structure
```
components/
├── ui/                    # Reusable UI components (ShadCN)
├── forms/                # Form components
├── layout/               # Layout components
└── features/             # Feature-specific components
```

### API Routes Structure
```
app/api/
├── [feature]/            # Feature-based grouping
│   ├── route.ts         # Main route handler
│   └── [id]/            # Dynamic routes
│       └── route.ts
```

### State Management
- Use React hooks for local state
- Use Supabase for server state
- Avoid global state unless necessary
- Prefer prop drilling over complex state management

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for all public functions
- Document complex logic with inline comments
- Update README.md for new features

### API Documentation
- Document all API endpoints in the route files
- Include request/response examples
- Specify authentication requirements

## 🔒 Security Considerations

### API Keys
- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement proper validation for user inputs

### Authentication
- Follow Supabase security best practices
- Implement proper role-based access control
- Validate user permissions on all protected routes

## 🚀 Deployment

### Environment Setup
- Ensure all environment variables are configured
- Test database migrations
- Verify API key configurations

### Build Process
```bash
npm run build
npm run start
```

## 📋 Checklist for Contributions

- [ ] Code follows TypeScript and ESLint standards
- [ ] Tests pass and coverage maintained
- [ ] Documentation updated
- [ ] Commit messages follow conventional format
- [ ] PR description is clear and comprehensive
- [ ] Breaking changes documented
- [ ] Security implications considered

Thank you for contributing to Brainlyx AI! 🎉
#
