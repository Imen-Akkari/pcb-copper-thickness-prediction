# Backend - Copper Quality Control System

FastAPI-based backend service providing REST API endpoints, real-time WebSocket communication, machine learning predictions, and serial device integration for copper manufacturing quality control.

## 🚀 Features

- **REST API**: Comprehensive endpoints for data management and system operations
- **WebSocket Support**: Real-time data streaming for live monitoring
- **Machine Learning**: TensorFlow/Keras models for quality prediction
- **Serial Communication**: Direct integration with CMI511 measurement devices
- **Database Integration**: SQL Server connectivity with ORM support
- **User Authentication**: JWT-based authentication with role management
- **Email Notifications**: Automated user account creation and alerts
- **Data Processing**: Pandas-based data analysis and export capabilities

## 🛠️ Technology Stack

- **FastAPI** - Modern Python web framework
- **TensorFlow/Keras** - Machine learning framework
- **SQLAlchemy** - Database ORM
- **PyODBC** - SQL Server connectivity
- **PySerial** - Serial communication
- **Pandas** - Data processing
- **Passlib** - Password hashing
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 📋 Prerequisites

- Python 3.8 or higher
- SQL Server (Express or higher)
- ODBC Driver 17 for SQL Server
- Serial port access (for CMI511 device)

## 🚀 Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🏃‍♂️ Development

### Start Development Server
```bash
python app/main.py
# or
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Run Tests
```bash
pytest
```

### Code Formatting
```bash
black .
flake8 .
```

## 📁 Project Structure

```
app/
├── main.py              # FastAPI application entry point
├── models/              # Database models
├── services/            # Business logic services
├── api/                 # API route handlers
│   ├── auth.py         # Authentication endpoints
│   ├── measurements.py # Measurement data endpoints
│   ├── predictions.py  # ML prediction endpoints
│   └── users.py        # User management endpoints
├── core/               # Core functionality
│   ├── config.py       # Configuration settings
│   ├── database.py     # Database connection
│   └── security.py     # Authentication utilities
└── ml/                 # Machine learning components
    ├── models/         # Trained ML models
    └── utils.py        # ML utilities
```## 🔧 
Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_SERVER=LAPTOP-8DFJ9BLE\MSSQLSERVER01
DB_NAME=cuivre
DB_TRUSTED_CONNECTION=yes

# Serial Communication
SERIAL_PORT=COM3
SERIAL_BAUDRATE=4800
SERIAL_BYTESIZE=7
SERIAL_PARITY=even
SERIAL_STOPBITS=1
SERIAL_TIMEOUT=2

# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000

# Machine Learning
MODEL_PATH=./ml/models/
SCALER_PATH=./ml/models/scaler.pkl
```

### Database Setup
1. **Create database**
   ```sql
   CREATE DATABASE cuivre;
   ```

2. **Create required tables**
   ```sql
   -- Users table
   CREATE TABLE Users (
       Id INT IDENTITY(1,1) PRIMARY KEY,
       Email NVARCHAR(255) UNIQUE NOT NULL,
       Password NVARCHAR(255) NOT NULL,
       Role NVARCHAR(50) NOT NULL,
       FirstName NVARCHAR(100),
       LastName NVARCHAR(100),
       CreatedAt DATETIME2 DEFAULT SYSDATETIME()
   );

   -- Articles table
   CREATE TABLE cuivre_scop (
       Num_OF NVARCHAR(50) PRIMARY KEY,
       -- Add other columns as needed
   );

   -- Measurements table
   CREATE TABLE MESURE_OF (
       Id INT IDENTITY(1,1) PRIMARY KEY,
       Num_OF NVARCHAR(50),
       valeur_mesure FLOAT,
       datetime_mesure DATETIME2,
       FOREIGN KEY (Num_OF) REFERENCES cuivre_scop(Num_OF)
   );

   -- Alerts table
   CREATE TABLE Alerts (
       Id INT IDENTITY(1,1) PRIMARY KEY,
       Article INT,
       Mesure FLOAT,
       Status NVARCHAR(100) NOT NULL,
       CreatedAt DATETIME2 DEFAULT SYSDATETIME()
   );
   ```

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - User authentication
- `POST /api/add-user` - Create new user (admin only)
- `GET /users` - List all users
- `DELETE /users/{user_id}` - Delete user

### Measurements
- `GET /api/data` - Get current measurement value
- `POST /api/save-mesure` - Save new measurement
- `GET /api/mesures/{Num_OF}` - Get measurements for specific article
- `GET /api/dashboard/mesures` - Get recent measurements for dashboard

### Articles
- `GET /articles` - List all articles
- `GET /articles/{Num_OF}` - Get specific article details

### Predictions
- `GET /api/dashboard/predictions` - Get predictions with date filtering
- `WS /ws/predict` - Real-time prediction WebSocket

### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create new alert
- `GET /alertes` - Get simulated alerts (legacy endpoint)

## 🤖 Machine Learning

### Model Support
The system supports both:
- **TensorFlow/Keras models** (.h5 files)
- **Scikit-learn models** (.pkl files)

### Model Loading
Models are automatically loaded from:
- `modele_nn.h5` - Neural network model (priority)
- `modele_clf.pkl` - Classical ML model (fallback)
- `modele_nn_scaler.pkl` - Feature scaler

### Prediction Pipeline
1. **Data Preprocessing**: Input validation and scaling
2. **Model Inference**: Prediction using loaded model
3. **Post-processing**: Result formatting and confidence scoring

## 📡 Serial Communication

### CMI511 Device Integration
- **Port**: COM3 (configurable)
- **Baudrate**: 4800
- **Data bits**: 7
- **Parity**: Even
- **Stop bits**: 1

### Data Flow
1. Continuous reading from serial port
2. Data validation and parsing
3. Real-time broadcasting via WebSocket
4. Optional database storage

## 🧪 Testing

### Unit Tests
```bash
pytest tests/
```

### Integration Tests
```bash
pytest tests/integration/
```

### API Testing
```bash
pytest tests/api/
```

### Load Testing
```bash
locust -f tests/load/locustfile.py
```

## 📦 Deployment

### Docker Deployment
```bash
docker build -t copper-quality-backend .
docker run -p 8000:8000 copper-quality-backend
```

### Production Deployment
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🐛 Troubleshooting

### Common Issues

1. **Database connection failed**
   - Verify SQL Server is running
   - Check connection string in .env
   - Ensure ODBC driver is installed

2. **Serial port access denied**
   - Check port permissions
   - Verify COM port number
   - Ensure device is connected

3. **Model loading failed**
   - Verify model files exist
   - Check file permissions
   - Validate model format

## 🤝 Contributing

1. Follow PEP 8 style guide
2. Add type hints to all functions
3. Write comprehensive tests
4. Update API documentation

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TensorFlow Documentation](https://www.tensorflow.org/guide)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)