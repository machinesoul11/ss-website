# Resource Fork Cleanup Script

This script automatically monitors and removes macOS resource fork files (`._ ` files) and other metadata files that can interfere with your Next.js build process.

## Features

- **Silent Background Operation**: Runs quietly without cluttering your terminal
- **Comprehensive Monitoring**: Watches all directories in your project
- **Immediate Cleanup**: Removes `._ ` files as soon as they're created
- **Next.js Optimized**: Prioritizes cleaning in critical directories like `src/`, `public/`, `.next/`, etc.
- **Build-Safe**: Avoids interfering with your development workflow

## Usage

### Run the cleanup script:

```bash
# Run silently in background (recommended)
npm run cleanup

# Run with verbose output (for debugging)
npm run cleanup:verbose
```

### Run directly:

```bash
# Silent mode (default)
node scripts/cleanup-resource-forks.js

# Verbose mode
node scripts/cleanup-resource-forks.js --verbose
```

## What it cleans

The script removes these types of files:

- `._ *` files (resource forks)
- `.DS_Store` files
- `.AppleDouble` files
- `.LSOverride` files

## Performance

- Uses `fswatch` on macOS for optimal performance (install with `brew install fswatch`)
- Falls back to Node.js `fs.watch` if `fswatch` is not available
- Periodic cleanup every 30 seconds as backup
- Immediate cleanup when files are detected

## Background Operation

The script is designed to run silently in the background without interfering with your development work. It will:

1. Perform an initial cleanup of existing files
2. Monitor for new resource fork files
3. Remove them immediately when detected
4. Continue running until manually stopped (Ctrl+C)

## Stopping the Script

Press `Ctrl+C` to stop the background cleanup process.

## Integration with Development

You can run this script alongside your development server:

```bash
# Terminal 1: Start the cleanup script
npm run cleanup

# Terminal 2: Start your development server
npm run dev
```

The script will continuously clean up resource fork files while you work, ensuring they don't interfere with your build process.
