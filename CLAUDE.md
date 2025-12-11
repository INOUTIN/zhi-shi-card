# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Knowledge Card - Children's Literacy Newspaper Generator** (知识卡片 - 儿童识字小报生成器), a web application that generates personalized educational flashcards for Chinese children using the Nano Banana Pro AI model.

## Architecture

The project has been refactored from a modular ES6 structure to a single-file architecture for easier deployment:

- **Current implementation**: Non-modular single file (`script.js`) - can be opened directly in browser
- **Original implementation**: Modular ES6 structure (preserved in `js/` directory as backup)

### Key Components

1. **Service Layer** (all in `script.js`):
   - `ApiService`: Handles Nano Banana Pro API communication
   - `StorageService`: LocalStorage management for persistence
   - `VocabularyManager`: Grade-appropriate vocabulary management
   - `EnhancedPromptBuilder`: AI prompt construction based on selections

2. **UI Management**:
   - `UI` class: Manages user interface state and interactions
   - `CardGenerator`: Orchestrates the card generation process
   - `Polling`: Async task status checking

3. **Global Namespace**: All code is organized under `window.ZhishiApp`

## Development Setup

### Running the Application

**Option 1: Direct File Access (Recommended for quick testing)**
```bash
# Simply double-click index.html or open in browser
open index.html
```

**Option 2: Local HTTP Server**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if http-server installed globally)
http-server -p 8000

# VS Code Live Server plugin
# Right-click index.html → "Open with Live Server"
```

### Configuration

1. **API Key Setup**:
   - Copy `config.js.template` to `config.js` (for modular version)
   - OR edit `CONFIG.API.KEY` directly in `script.js` (for single-file version)
   - Get API key from: https://kie.ai/api-key

2. **Debug Mode**:
   - Set `CONFIG.DEBUG.ENABLED = true` in config
   - Controls console logging verbosity

### File Structure

```
zhishi card-1211/
├── index.html              # Main HTML entry point
├── script.js               # Single-file implementation (main)
├── script-safe.js          # Alternative safe version
├── config.js.template      # Configuration template
├── css/                    # Stylesheets
│   ├── styles.css          # Global styles with CSS variables
│   └── components/         # Component-specific CSS
│       ├── card.css        # Card styling
│       ├── generator.css   # Generator UI
│       └── history.css     # History panel
├── js/                     # Original modular version (backup)
│   ├── main.js
│   ├── config.js
│   ├── services/
│   └── modules/
├── ai-docs/                # API documentation
└── README.md               # User documentation
```

## Key Development Workflows

### Adding New Vocabulary Topics

1. Edit `VocabularyManager.topics` array in script.js
2. Add vocabulary entries to grade-specific objects
3. Update HTML theme selector options

```javascript
// Example structure in VocabularyManager
'小学1年级': {
    '新主题': [
        { chinese: '新词', pinyin: 'xīn cí', english: 'new word',
          difficulty: 1, category: '分类' }
    ]
}
```

### Customizing UI Theme

All colors use CSS variables in `css/styles.css`:

```css
:root {
    --primary-color: #4CAF50;
    --primary-hover: #45a049;
    --secondary-color: #2196F3;
    /* ... */
}
```

### API Integration

The app uses Nano Banana Pro API with:
- **Create Task**: POST to `/jobs/createTask`
- **Query Status**: GET to `/jobs/recordInfo`
- **Authentication**: Bearer token in Authorization header

### Testing Changes

1. For quick tests: Open `index.html` directly
2. For full testing: Use HTTP server to avoid CORS issues
3. Check browser console for errors (especially API key configuration)

## Important Notes

1. **No Build Process**: This is a static site with no bundling, compilation, or dependencies
2. **Dual Architecture**: Both modular (js/) and single-file (script.js) versions exist
3. **LocalStorage Only**: All persistence is client-side; no server-side storage
4. **API Key Required**: App won't generate cards without valid Nano Banana Pro API key
5. **Mobile-First**: Responsive design prioritizes mobile experience

## Common Tasks

### Update API Configuration
Edit the CONFIG object in script.js (line ~10-30) to modify:
- API endpoints
- Polling frequency
- Default image parameters
- Debug settings

### Add New Grade Levels
1. Update grade selector in index.html
2. Add vocabulary data to VocabularyManager
3. Update prompt builder logic if needed

### Modify Card Generation Prompts
Edit `EnhancedPromptBuilder.buildPrompt()` method to customize:
- Prompt structure
- Output format requirements
- Educational content guidelines

## Browser Compatibility

- Chrome 61+ (recommended)
- Firefox 60+
- Safari 10.1+
- Edge 16+

## Security Considerations

- API key is client-side (required for static deployment)
- No server-side processing or data storage
- All content generation happens via external API
- LocalStorage only stores generated card metadata and URLs