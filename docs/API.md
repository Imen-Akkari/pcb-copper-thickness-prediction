# API Documentation

This document provides comprehensive documentation for the Copper Quality Control System REST API.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com`

## Authentication

The API uses JWT (JSON Web Token) based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Connexion réussie",
  "role": "admin"
}
```

## User Management

### Get All Users
```http
GET /users
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "Id": 1,
    "Email": "admin@example.com",
    "Role": "admin"
  },
  {
    "Id": 2,
    "Email": "operator@example.com",
    "Role": "operateur"
  }
]
```

### Create User
```http
POST /api/add-user
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "role": "operateur"
}
```

**Response:**
```json
{
  "message": "Utilisateur ajouté ✅",
  "password": "abc123def",
  "email_sent": true
}
```

### Delete User
```http
DELETE /users/{user_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Utilisateur supprimé"
}
```

## Measurements

### Get Current Measurement
```http
GET /api/data
```

**Response:**
```json
{
  "valeur": "45.23"
}
```

### Save Measurement
```http
POST /api/save-mesure
Content-Type: application/json

{
  "num_of": "93115",
  "valeur": "45.23",
  "date": "2024-01-15T10:30:00"
}
```

**Response:**
```json
{
  "status": "ok"
}
```

### Get Measurements by Article
```http
GET /api/mesures/{Num_OF}
```

**Response:**
```json
[
  {
    "Id": 1,
    "Num_OF": "93115",
    "valeur_mesure": 45.23,
    "datetime_mesure": "2024-01-15T10:30:00"
  }
]
```

### Get Dashboard Measurements
```http
GET /api/dashboard/mesures
```

**Response:**
```json
{
  "mesures": [
    {
      "Num_OF": "93115",
      "valeur_mesure": 45.23,
      "datetime_mesure": "2024-01-15T10:30:00"
    }
  ]
}
```#
# Articles

### Get All Articles
```http
GET /articles
```

**Response:**
```json
[
  {
    "Num_OF": "93115",
    "Description": "Copper tube 15mm",
    "Tolerance_Min": 20.0,
    "Tolerance_Max": 60.0
  }
]
```

### Get Article by Number
```http
GET /articles/{Num_OF}
```

**Response:**
```json
{
  "Num_OF": "93115",
  "Description": "Copper tube 15mm",
  "Tolerance_Min": 20.0,
  "Tolerance_Max": 60.0
}
```

## Predictions

### Get Dashboard Predictions
```http
GET /api/dashboard/predictions?start=2024-01-01&end=2024-01-31
```

**Query Parameters:**
- `start` (optional): Start date (YYYY-MM-DD)
- `end` (optional): End date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "num_of": "93115",
    "value": 45.23,
    "timestamp": "2024-01-15T10:30:00",
    "prediction": 1,
    "proba": 0.85
  }
]
```

### Real-time Predictions (WebSocket)
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/predict');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log(data);
  // {
  //   "value": 45.23,
  //   "prediction": 1,
  //   "proba": 0.85,
  //   "ts": "2024-01-15T10:30:00Z"
  // }
};
```

## Alerts

### Get Alerts
```http
GET /api/alerts?limit=50
```

**Query Parameters:**
- `limit` (optional): Maximum number of alerts to return (default: 50)

**Response:**
```json
[
  {
    "Id": 1,
    "Article": 93115,
    "Mesure": 66.4,
    "Status": "Mesure hors tolérance",
    "CreatedAt": "2024-01-15T10:30:00"
  }
]
```

### Create Alert
```http
POST /api/alerts
Content-Type: application/json

{
  "article": 93115,
  "mesure": 66.4,
  "status": "Mesure hors tolérance"
}
```

**Response:**
```json
{
  "message": "Alerte enregistrée"
}
```

### Get Simulated Alerts (Legacy)
```http
GET /alertes
```

**Response:**
```json
[
  {
    "article": 93115,
    "mesure": 66.4,
    "status": "Mesure hors tolérance"
  }
]
```

## Dashboard Statistics

### Get Articles Count
```http
GET /api/dashboard/articles-count
```

**Response:**
```json
{
  "nb_articles": 150,
  "nb_mesures": 2500
}
```

## Error Handling

### Error Response Format
```json
{
  "detail": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Common Error Examples

**Authentication Required:**
```json
{
  "detail": "Not authenticated"
}
```

**User Not Found:**
```json
{
  "detail": "Utilisateur non trouvé"
}
```

**Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- **WebSocket connections**: 5 concurrent connections per IP

## CORS Configuration

The API supports Cross-Origin Resource Sharing (CORS) for the following origins:

- `http://localhost:4200` (Angular development server)
- `http://localhost:3000` (Alternative development port)

## Data Models

### User Model
```typescript
interface User {
  Id: number;
  Email: string;
  Role: 'admin' | 'operateur';
  FirstName?: string;
  LastName?: string;
  CreatedAt: string;
}
```

### Measurement Model
```typescript
interface Measurement {
  Id: number;
  Num_OF: string;
  valeur_mesure: number;
  datetime_mesure: string;
}
```

### Article Model
```typescript
interface Article {
  Num_OF: string;
  Description?: string;
  Tolerance_Min?: number;
  Tolerance_Max?: number;
}
```

### Prediction Model
```typescript
interface Prediction {
  num_of: string;
  value: number;
  timestamp: string;
  prediction: number;
  proba: number | number[];
}
```

### Alert Model
```typescript
interface Alert {
  Id: number;
  Article?: number;
  Mesure?: number;
  Status: string;
  CreatedAt: string;
}
```

## SDK Examples

### Python SDK Example
```python
import requests

class CopperQualityAPI:
    def __init__(self, base_url, token=None):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        if token:
            self.session.headers.update({
                'Authorization': f'Bearer {token}'
            })
    
    def login(self, email, password):
        response = self.session.post(
            f'{self.base_url}/api/login',
            json={'email': email, 'password': password}
        )
        return response.json()
    
    def get_measurements(self, num_of):
        response = self.session.get(
            f'{self.base_url}/api/mesures/{num_of}'
        )
        return response.json()
```

### JavaScript SDK Example
```javascript
class CopperQualityAPI {
  constructor(baseUrl, token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }

  async getMeasurements(numOf) {
    const response = await fetch(`${this.baseUrl}/api/mesures/${numOf}`, {
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
    });
    return response.json();
  }
}
```