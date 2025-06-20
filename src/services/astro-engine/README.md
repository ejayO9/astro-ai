# Astrology Engine API

This module provides the core functionality for interacting with external astrology APIs and processing astrological data.

## Overview

The Astrology Engine handles:
- Communication with external astrology APIs
- Birth data format conversions
- Planetary position calculations (D1 Chart)
- API credential validation

## API Structure

### API Client (`apiClient.ts`)

The API client provides a clean interface to interact with the external astrology API service.

#### Key Functions:

1. **`createAstrologyApiClient()`**
   - Creates an instance of the API client
   - Uses credentials from environment variables
   - Returns `null` if credentials are missing

2. **`convertBirthDetailsToApiFormat(birthDetails)`**
   - Converts birth details from request format to API format
   - Handles timezone conversion (e.g., "+05:30" to 5.5)
   - Parses date and time strings

#### Interfaces:

```typescript
interface PlanetData {
  id: number;
  name: string;
  fullDegree: number;
  normDegree: number;
  speed: number;
  isRetro: string | boolean;
  sign: string;
  signLord: string;
  nakshatra: string;
  nakshatraLord: string;
  nakshatra_pad: number;
  house: number;
  is_planet_set: boolean;
  planet_awastha: string;
}

interface BirthDetailsApiFormat {
  day: number;
  month: number;
  year: number;
  hour: number;
  min: number;
  lat: number;
  lon: number;
  tzone: number;
}
```

## Environment Variables

The following environment variables must be set:

```env
ASTROLOGY_API_USER_ID=your_user_id
ASTROLOGY_API_KEY=your_api_key
```

## Usage Example

```typescript
import { createAstrologyApiClient, convertBirthDetailsToApiFormat } from './apiClient';

// Create client
const client = createAstrologyApiClient();
if (!client) {
  throw new Error('API credentials not configured');
}

// Convert birth details
const birthDetails = {
  date: "1990-01-15",
  time: "14:30",
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: "+05:30"
};

const apiData = convertBirthDetailsToApiFormat(birthDetails);

// Fetch planets
const planets = await client.fetchPlanets(apiData);
console.log(planets);
```

## API Endpoints

The external API base URL is: `https://json.astrologyapi.com/v1`

### Available Endpoints:

1. **POST /planets**
   - Gets planetary positions for given birth details
   - Requires authentication via Basic Auth
   - Returns array of planet data

## Error Handling

The API client includes comprehensive error handling:
- Logs all API requests and responses
- Provides detailed error messages
- Handles network failures gracefully
- Validates API responses

## Future Enhancements

Potential additions to the astrology engine:
- House calculations
- Aspect calculations
- Dasha period calculations
- Transit predictions
- Compatibility analysis 