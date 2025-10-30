# Frontend - Copper Quality Control System

Angular-based web application providing an intuitive interface for monitoring copper manufacturing quality control processes.

## 🚀 Features

- **Real-time Dashboard**: Live monitoring of measurement data and quality predictions
- **Interactive Charts**: Visual representation of quality trends and statistics
- **User Management**: Admin panel for managing operators and system users
- **Alert System**: Real-time notifications for quality issues and system alerts
- **Data Export**: Excel export functionality for reports and analysis
- **Responsive Design**: Mobile-friendly interface using Bootstrap 5

## 🛠️ Technology Stack

- **Angular 16** - Web framework
- **TypeScript** - Programming language
- **Bootstrap 5** - CSS framework
- **Bootstrap Icons** - Icon library
- **RxJS** - Reactive programming
- **Chart.js** - Data visualization
- **XLSX** - Excel file handling
- **File-saver** - File download utility

## 📋 Prerequisites

- Node.js 16 or higher
- npm 8 or higher
- Angular CLI 16

## 🚀 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Install Angular CLI globally** (if not already installed)
   ```bash
   npm install -g @angular/cli@16
   ```

## 🏃‍♂️ Development

### Start Development Server
```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`

### Build for Production
```bash
npm run build
# or
ng build --configuration production
```

### Run Tests
```bash
npm test
# or
ng test
```

### Code Linting
```bash
ng lint
```

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/              # Authentication components
│   ├── components/        # Shared components
│   ├── guards/           # Route guards
│   ├── home/             # Main dashboard
│   ├── services/         # Angular services
│   ├── app-routing.module.ts
│   └── app.module.ts
├── assets/               # Static assets
│   ├── fonts/
│   ├── img/
│   └── scss/
└── environments/         # Environment configurations
```## 🔧 Con
figuration

### Environment Configuration
Update `src/environments/environment.ts` for development:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  wsUrl: 'ws://localhost:8000'
};
```

Update `src/environments/environment.prod.ts` for production:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com',
  wsUrl: 'wss://your-api-domain.com'
};
```

### Proxy Configuration
For development, API calls are proxied to the backend. The proxy configuration is in `proxy.conf.json`:

```json
{
  "/api/*": {
    "target": "http://localhost:8000",
    "secure": true,
    "changeOrigin": true
  }
}
```

## 🎨 Styling

The application uses Bootstrap 5 with custom SCSS:

- **Global styles**: `src/styles.css`
- **Component styles**: Individual `.css` files per component
- **Bootstrap customization**: `src/assets/scss/`

## 🔌 API Integration

The frontend communicates with the FastAPI backend through:

- **HTTP Services**: RESTful API calls for CRUD operations
- **WebSocket**: Real-time data updates for measurements and predictions
- **Authentication**: JWT-based authentication with role-based access

### Key Services

- `AuthService`: User authentication and authorization
- `DataService`: Measurement data management
- `WebSocketService`: Real-time communication
- `AlertService`: System notifications and alerts

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### End-to-End Tests
```bash
npm run e2e
```

### Test Coverage
```bash
ng test --code-coverage
```

## 📦 Build and Deployment

### Development Build
```bash
ng build
```

### Production Build
```bash
ng build --configuration production
```

### Docker Build
```bash
docker build -t copper-quality-frontend .
docker run -p 4200:80 copper-quality-frontend
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 4200 already in use**
   ```bash
   ng serve --port 4201
   ```

2. **Node modules issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Angular CLI version mismatch**
   ```bash
   npm uninstall -g @angular/cli
   npm install -g @angular/cli@16
   ```

## 🤝 Contributing

1. Follow Angular style guide
2. Use TypeScript strict mode
3. Write unit tests for new components
4. Update documentation for new features

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)