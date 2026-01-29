# Game Shelf Beta Hub

**Version:** 2.1.3  
**Deploy to:** `gameshelf.co/beta/`

## User Type System

Users are routed based on their `userType` field (server-managed):

| Type | Behavior |
|------|----------|
| `beta` | Welcome modal → Dashboard |
| `standard` | Redirect to main Game Shelf |
| `pending` / none | Show registration view |

**Server-Side Registration:**
- `completeBetaRegistration` Cloud Function handles registration
- Awards coins via transaction (secure)
- Sets `userType: 'beta'`
- Legacy users (have `earlyAccess.joinedAt` but no `userType`) auto-migrated

## Views

### Landing Page
- Hero with app screenshot
- Feature highlights  
- Game categories supported
- GS Originals showcase
- "Join the Beta" CTA

### Registration View (Pending Users)
- Shows user's Google avatar/name
- Beta perks explanation
- "Complete Beta Registration" button
- Calls Cloud Function (not direct writes)

### Dashboard (Beta Users)
1. **Your Stats** - Games played, surveys completed, streak, coins
2. **Quick Actions** - Launch Game Shelf, Start a Battle
3. **GS Original Games** - Links with play status
4. **Daily Survey** - 5 rotating questions per day
5. **Game-Specific Surveys** - Triggered when user plays a GS game
6. **Open Feedback** - Free-form text input
7. **Leaderboard** - Top 10 beta testers by engagement
8. **Active Contests** - Battle Royale Week, Feedback Champion

## Firebase Structure

```
users/{odometerId}/
  userType: 'pending' | 'beta' | 'standard'
  earlyAccess/
    joinedAt: timestamp
    source: 'beta-hub' | 'referral'
    referredBy: odometerId (optional)
    initialCoinsGranted: 20
    surveyResponses/
      {questionId}: { answer, date, timestamp }
    surveyStreak: number
  shelf/wallet/coins: number

beta/
  feedback/
    {timestamp}: { userId, displayName, feedback, date }
```

## Required Cloud Functions

Deploy these before Beta Hub will work:

- `completeBetaRegistration` - Handles registration
- `getUserType` - Gets user's type for routing

## Deployment

1. Deploy Cloud Functions first
2. Upload index.html to `/beta/` folder

Single HTML file (not a PWA).
