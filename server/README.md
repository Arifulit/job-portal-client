# Resume Analysis Server

Lightweight Express server to accept a resume PDF and return a simple analysis.

Install dependencies and start:

```bash
cd server
npm install
npm run start
```

Endpoint:
- `POST /api/resume/analyze` - form-data field `file` (PDF)

Response: JSON with `success`, `score`, `scoreBreakdown`, `extractedSkills`, `suggestions`, and `summary`.
