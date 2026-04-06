# Headcorn Manifest

Live manifest display for Headcorn dropzone, powered by the GoSkydive API. A single-page web app with no build step, designed for ops screens and wallboards.

## Deployment

### GitHub Pages

1. Push the repo to GitHub
2. Go to **Settings > Pages**
3. Set source to the branch containing `index.html`
4. The app will be available at `https://<username>.github.io/<repo>/`

### Any static host

Serve `index.html` from any web server or CDN. No build step or dependencies required (fonts load from Google Fonts CDN).

### Local

Open `index.html` directly in a browser.

## API

**Base URL:** `https://dz.goskydive.com`

**Auth:** HTTP Basic — pass an `Authorization: Basic <token>` header.

### Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/manifests?dropzone_id=<id>` | GET | Returns today's manifest/load data |
| `/calendar/weather-holds?dropzone_id=<id>&date=YYYY-MM-DD` | GET | Returns weather hold status and wallboard message |

Both endpoints are polled every 30 seconds (configurable in settings).

### Dropzone IDs

| Dropzone | ID |
|---|---|
| Headcorn | `dz_0kFFGQXAkk` |
| Old Sarum | `dz_0dropzone1` |
| Swansea | `dz_0rU8gA2pHO` |

## Data Schema

### Manifest

```json
{
  "liftNumber": 3,
  "manifestStatus": "airborne | trained | candidate | landedComplete | draft",
  "manifestDate": "2026-04-06",
  "dropzoneId": "dz_0kFFGQXAkk",
  "planeSlots": 18,
  "passengerSlots": 6,
  "takeOffDateTime": "2026-04-06T10:30:00Z",
  "landedDateTime": null,
  "customerCount": 4,
  "colleagueCount": 8,
  "customers": [],
  "colleagues": [],
  "sets": []
}
```

### Customer

```json
{
  "eid": "cust_abc",
  "setEid": "set_123",
  "customerRole": "tandem",
  "fullName": "Jane Smith",
  "arrivalTime": "09:00:00",
  "weightInLbs": 150,
  "teamName": null,
  "isTrained": true,
  "prominantNote": "Birthday jump!",
  "fitSignatureFileLocation": "https://..."
}
```

### Colleague

```json
{
  "eid": "col_xyz",
  "setEid": "set_123",
  "colleagueRole": "tandemInstructor | tandemInstructorWithHandcam | tandemVideographer | sportsSolo",
  "fullName": "John Doe",
  "weightInLbs": 180,
  "bpaLicenseType": "a | b | c | d",
  "cameraName": "GoPro Hero 12",
  "jumpMasterSeniority": 5
}
```

### Set

```json
{
  "eid": "set_123",
  "skydiveType": "tandem | colleagueSports",
  "jumpAltitudeInFt": 15000,
  "requiresCameraHandcam": true,
  "requiresCameraFreefall": false,
  "requiresCoach": false,
  "specialWarning": null
}
```

### Linking

Customers, colleagues, and sets are linked by `setEid`. A tandem customer shares a `setEid` with their instructor and optional videographer. Always match by `setEid`, never by array position.

## Settings

Click the cog icon to configure:
- **Dropzone** — switch between Headcorn, Old Sarum, and Swansea
- **API Key** — Base64-encoded Basic auth credentials
- **Refresh interval** — polling frequency in seconds (default 30)

Settings persist in `localStorage`.

## CORS

The GoSkydive API may not include CORS headers for all origins. If you see fetch errors, you may need to:
- Open the official GoSkydive wallboard first to establish a session cookie
- Use a CORS proxy
- Deploy behind a reverse proxy that adds the appropriate headers
