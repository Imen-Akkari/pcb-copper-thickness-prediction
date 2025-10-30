# Copper Quality Control System

An AI-powered quality control system for copper manufacturing that combines real-time measurement monitoring, machine learning predictions, and comprehensive data management.

## 🚀 Features

- **Real-time Monitoring**: Live data acquisition from CMI511 measurement devices via serial communication
- **AI-Powered Predictions**: Machine learning models (TensorFlow/Keras) for quality classification
- **Interactive Dashboard**: Angular-based web interface with real-time updates via WebSocket
- **Data Management**: SQL Server integration for storing measurements and articles
- **Alert System**: Automated quality alerts and tolerance monitoring
- **User Management**: Role-based authentication (Admin/Operator)
- **Export Capabilities**: Excel export functionality for reports and data analysis

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Angular       │    │   FastAPI        │    │   SQL Server    │
│   Frontend      │◄──►│   Backend        │◄──►│   Database      │
│   (Port 4200)   │    │   (Port 8000)    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   CMI511 Device  │
                       │   (Serial COM3)  │
                       └──────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Angular 16** - Modern web framework
- **Bootstrap 5** - UI components and styling
- **RxJS** - Reactive programming
- **WebSocket** - Real-time communication

### Backend
- **FastAPI** - High-performance Python web framework
- **TensorFlow/Keras** - Machine learning models
- **SQLAlchemy** - Database ORM
- **PySerial** - Serial communication
- **Pandas** - Data processing

### Database & Infrastructure
- **SQL Server** - Primary database
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
#
# 📋 Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.8+
- **SQL Server** (Express or higher)
- **Git**
- **Docker** (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/copper-quality-control-system.git
cd copper-quality-control-system
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app/main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access the Application
- Frontend: http://localhost:4200
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📊 Screenshots

### Dashboard Overview
![Dashboard](docs/images/dashboard.png)

### Real-time Monitoring
![Monitoring](docs/images/monitoring.png)

### Quality Predictions
![Predictions](docs/images/predictions.png)

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_SERVER=your-sql-server
DB_NAME=cuivre
DB_TRUSTED_CONNECTION=yes

# Serial Communication
SERIAL_PORT=COM3
SERIAL_BAUDRATE=4800

# Email Configuration (for user notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [Frontend Setup](frontend/README.md)
- [Backend Setup](backend/README.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting guide](docs/DEPLOYMENT.md#troubleshooting)
2. Search existing [GitHub Issues](https://github.com/your-username/copper-quality-control-system/issues)
3. Create a new issue with detailed information

## 🏷️ Version History

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

---

**Made with ❤️ for copper manufacturing quality control**