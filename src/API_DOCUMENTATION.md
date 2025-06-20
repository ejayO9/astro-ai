# API Documentation

This document describes all available API endpoints in the Express server.

## Base URL

```
http://localhost:3001/api
```

## Endpoints

### 1. Chat Endpoint

**POST** `/api/chat`

Processes chat messages and returns AI-generated responses.

#### Request Body

```json
{
  "messages": [
    {
      "role": "user | assistant | system",
      "content": "Message content"
    }
  ],
  "characterId": "character-id",
  "resetChat": false
}
```

#### Response

```json
{
  "response": "AI generated response",
  "conversationId": "unique-conversation-id",
  "messageId": "unique-message-id"
}
```

#### Error Responses

- `400 Bad Request` - Invalid request body
- `500 Internal Server Error` - Server error

---

### 2. D1 Chart (Planetary Positions) Endpoint

**POST** `/api/astrology/d1-chart`

Calculates and returns planetary positions for given birth details.

#### Request Body

```json
{
  "date": "1990-01-15",      // YYYY-MM-DD format
  "time": "14:30",           // HH:MM format (24-hour)
  "city": "New Delhi",       // City name
  "latitude": 28.6139,       // Latitude (-90 to 90)
  "longitude": 77.2090,      // Longitude (-180 to 180)
  "timezone": "+05:30"       // Timezone offset (+/-HH:MM)
}
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 0,
      "name": "Sun",
      "fullDegree": 301.2345,
      "normDegree": 1.2345,
      "speed": 0.9856,
      "isRetro": false,
      "sign": "Capricorn",
      "signLord": "Saturn",
      "nakshatra": "Shravana",
      "nakshatraLord": "Moon",
      "nakshatra_pad": 2,
      "house": 10,
      "is_planet_set": false,
      "planet_awastha": "Yuva"
    },
    // ... more planets
  ],
  "metadata": {
    "responseTime": "245ms",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Planet Data Fields

- **id**: Unique identifier for the planet
- **name**: Name of the planet (Sun, Moon, Mars, etc.)
- **fullDegree**: Absolute degree position (0-360)
- **normDegree**: Degree within the current sign (0-30)
- **speed**: Current speed of the planet
- **isRetro**: Whether the planet is in retrograde motion
- **sign**: Current zodiac sign
- **signLord**: Ruling planet of the sign
- **nakshatra**: Lunar mansion name
- **nakshatraLord**: Ruling planet of the nakshatra
- **nakshatra_pad**: Quarter of the nakshatra (1-4)
- **house**: House number (1-12)
- **is_planet_set**: Whether the planet is set
- **planet_awastha**: State/condition of the planet

#### Validation Rules

1. **date**: Must be in YYYY-MM-DD format
2. **time**: Must be in HH:MM format (24-hour)
3. **city**: Non-empty string
4. **latitude**: Number between -90 and 90
5. **longitude**: Number between -180 and 180
6. **timezone**: Format +/-HH:MM (e.g., "+05:30", "-08:00")

#### Error Responses

- `400 Bad Request` - Validation failed
  ```json
  {
    "error": "Validation failed",
    "details": [
      "Date must be in YYYY-MM-DD format",
      "Latitude must be between -90 and 90"
    ]
  }
  ```

- `500 Internal Server Error` - Server error or API failure
  ```json
  {
    "error": "Failed to get D1 Chart data: API request failed"
  }
  ```

## Authentication

Currently, the API does not require authentication. In production, you should implement proper authentication mechanisms.

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting for production use.

## CORS

CORS is not configured. Add appropriate CORS headers for cross-origin requests.

## Environment Variables

Required environment variables:

```env
# Server
PORT=3001

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Astrology API
ASTROLOGY_API_USER_ID=your_user_id
ASTROLOGY_API_KEY=your_api_key
```

## Example Usage

### Using cURL

```bash
# Chat endpoint
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "characterId": "default"
  }'

# D1 Chart endpoint
curl -X POST http://localhost:3001/api/astrology/d1-chart \
  -H "Content-Type: application/json" \
  -d '{
    "date": "1990-01-15",
    "time": "14:30",
    "city": "New Delhi",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": "+05:30"
  }'
```

### Using JavaScript/TypeScript

```typescript
// D1 Chart request
const response = await fetch('http://localhost:3001/api/astrology/d1-chart', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    date: "1990-01-15",
    time: "14:30",
    city: "New Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: "+05:30"
  })
});

const data = await response.json();
console.log(data);
``` 