# Beta Hub Deployment Package

Version: 2.1.7.0

## Contents

```
beta-hub-deploy/
├── beta-hub.html          # Main beta hub page
├── landing/
│   ├── app-screenshot.svg    # Phone mockup - replace with real screenshot
│   └── hints-screenshot.svg  # Hints mockup - replace with real screenshot
└── README.md
```

## Deployment

1. Copy contents to your web server / GitHub Pages
2. Replace placeholder SVGs in `landing/` with actual PNG screenshots
3. Set `TEST_MODE = false` in the script section before going live

## Screenshot Specs

- **app-screenshot**: 260×520px (or similar phone aspect ratio)
- **hints-screenshot**: 224×448px (or similar phone aspect ratio)

## Configuration

In the `<script>` section near the bottom:

```javascript
const TEST_MODE = true;  // Set to false for production
```

- `true` = Stay on landing page for testing full flow
- `false` = Auto-redirect returning beta users to dashboard
