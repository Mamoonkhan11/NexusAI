# NexusAI README Images

This document provides instructions for adding images to the README.md file.

## Required Images

### 1. Hero Image (`nexusai-hero.png`)
- **Location**: `./nexusai-hero.png` (root directory)
- **Purpose**: Main hero banner at the top of README
- **Recommended Size**: 1200x400px or similar aspect ratio
- **Content**: Should showcase NexusAI branding and Vionys' mission of "Bridging AI Obstacles"
- **Theme**: Visual representation of overcoming AI technology barriers

### 2. Demo Screenshot (`demo-screenshot.png`)
- **Location**: `./demo-screenshot.png` (root directory)
- **Purpose**: Showcase the application interface
- **Recommended Size**: 800x500px
- **Content**: Screenshot of the main chat interface or dashboard

## How to Create/Replace Images

### Option 1: Using Screenshots
1. Run the application locally (`npm run dev`)
2. Take screenshots of key pages:
   - Landing page hero section
   - Chat interface in action
   - Dashboard views
3. Save as PNG files in the root directory

### Option 2: Using Design Tools
1. Use Figma, Canva, or similar tools
2. Create professional graphics:
   - Hero banner with gradient background
   - Interface mockups
   - Feature illustrations

### Option 3: AI-Generated Images
1. Use tools like Midjourney, DALL-E, or Stable Diffusion
2. Generate images that represent:
   - Futuristic AI interface
   - Clean, modern design
   - Technology-focused aesthetics

## Image Optimization

### Recommended Settings:
- **Format**: PNG for screenshots, WebP for graphics
- **Quality**: 80-90% compression
- **Max File Size**: 500KB per image
- **Resolution**: 2x for retina displays

### Tools for Optimization:
- **TinyPNG**: Online compression tool
- **ImageOptim**: Desktop application
- **WebP converters**: Convert to modern formats

## Alt Text Guidelines

Ensure all images have descriptive alt text:
- `<img src="./nexusai-hero.png" alt="NexusAI - Autonomous AI System" />`
- `<img src="./demo-screenshot.png" alt="NexusAI chat interface demo" />`

## File Naming Convention

- Use kebab-case for file names
- Include descriptive keywords
- Keep names consistent with references in README.md

## Hosting Alternatives

If you prefer not to store images in the repository:

### Option 1: GitHub Repository
- Store images in `docs/images/` or `assets/images/`
- Update paths in README.md accordingly

### Option 2: External Hosting
- Use Imgur, Cloudinary, or similar services
- Replace local paths with hosted URLs
- Ensure images load reliably

## Example Commands

```bash
# Create assets directory (optional)
mkdir assets
mkdir assets/images

# Move images to organized location
mv nexusai-hero.png assets/images/
mv demo-screenshot.png assets/images/

# Update README.md paths
# Change: ./nexusai-hero.png
# To: ./assets/images/nexusai-hero.png
```
