# Contributing to Copper Quality Control System

Thank you for your interest in contributing to the Copper Quality Control System! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** first to avoid duplicates
2. **Use the issue template** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce the problem
   - Expected vs actual behavior
   - Environment details (OS, browser, versions)
   - Screenshots or error messages if applicable

### Suggesting Features

1. **Check the roadmap** to see if the feature is already planned
2. **Create a feature request** with detailed description
3. **Explain the use case** and potential benefits
4. **Consider implementation complexity** and alternatives

### Code Contributions

1. **Fork the repository** and create a feature branch
2. **Follow coding standards** outlined below
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Submit a pull request** with clear description

## 🛠️ Development Setup

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- SQL Server (Express or higher)
- Git
- Docker (optional)

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/copper-quality-control-system.git
   cd copper-quality-control-system
   ```

2. **Set up backend**
   ```bash
   cd back_end_python
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up frontend**
   ```bash
   cd mon-projet4
   npm install
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd back_end_python
   python main.py

   # Terminal 2 - Frontend
   cd mon-projet4
   npm start
   ```

## 📝 Coding Standards

### Python (Backend)

- **Follow PEP 8** style guide
- **Use type hints** for all function parameters and return values
- **Write docstrings** for all functions and classes
- **Use meaningful variable names** and avoid abbreviations
- **Keep functions small** and focused on single responsibility

#### Code Formatting
```bash
# Format code
black .

# Check linting
flake8 .

# Type checking
mypy .
```

#### Example Code Style
```python
from typing import List, Optional
from pydantic import BaseModel

class MeasurementService:
    """Service for handling measurement operations."""
    
    def get_measurements_by_article(
        self, 
        article_id: str, 
        limit: Optional[int] = None
    ) -> List[Measurement]:
        """
        Retrieve measurements for a specific article.
        
        Args:
            article_id: The article identifier
            limit: Maximum number of measurements to return
            
        Returns:
            List of measurement objects
            
        Raises:
            ValueError: If article_id is invalid
        """
        # Implementation here
        pass
```

### TypeScript/Angular (Frontend)

- **Follow Angular style guide**
- **Use TypeScript strict mode**
- **Implement proper error handling**
- **Use reactive programming patterns** with RxJS
- **Write unit tests** for components and services

#### Code Formatting
```bash
# Lint code
ng lint

# Format code (if Prettier is configured)
npm run format
```

#### Example Code Style
```typescript
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private readonly apiUrl = environment.apiUrl;
  private measurementsSubject = new BehaviorSubject<Measurement[]>([]);
  
  constructor(private http: HttpClient) {}
  
  /**
   * Get measurements for a specific article
   * @param articleId - The article identifier
   * @returns Observable of measurements array
   */
  getMeasurementsByArticle(articleId: string): Observable<Measurement[]> {
    return this.http.get<Measurement[]>(`${this.apiUrl}/api/mesures/${articleId}`);
  }
}
```

## 🧪 Testing Guidelines

### Backend Testing

- **Write unit tests** for all business logic
- **Use pytest** as the testing framework
- **Mock external dependencies** (database, serial ports, etc.)
- **Aim for 80%+ code coverage**

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/
```

### Frontend Testing

- **Write unit tests** for components and services
- **Use Jasmine and Karma** for testing
- **Mock HTTP calls** and external dependencies
- **Test user interactions** and component behavior

```bash
# Run tests
npm test

# Run tests with coverage
ng test --code-coverage
```

## 📋 Pull Request Process

### Before Submitting

1. **Ensure all tests pass**
2. **Update documentation** if needed
3. **Add changelog entry** for significant changes
4. **Rebase your branch** on the latest main branch
5. **Use conventional commit messages**

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(api): add endpoint for bulk measurement import

fix(dashboard): resolve real-time data update issue

docs(readme): update installation instructions

test(auth): add unit tests for login service
```

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Changelog updated
```

## 🔍 Code Review Process

### For Reviewers

1. **Check functionality** - Does the code work as intended?
2. **Review code quality** - Is it readable, maintainable, and efficient?
3. **Verify tests** - Are there adequate tests with good coverage?
4. **Check documentation** - Is documentation updated and accurate?
5. **Consider security** - Are there any security implications?

### For Contributors

1. **Respond promptly** to review feedback
2. **Make requested changes** or explain why they're not needed
3. **Keep discussions professional** and constructive
4. **Update your branch** as needed during review

## 🚀 Release Process

1. **Version bump** following semantic versioning
2. **Update CHANGELOG.md** with new version details
3. **Create release branch** from main
4. **Run full test suite** and manual testing
5. **Create GitHub release** with release notes
6. **Deploy to production** (if applicable)

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: [your-email@example.com] for private inquiries

## 🏆 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to the Copper Quality Control System! 🎉