#!/bin/bash

# Silent Scribe - Vercel Deployment Preparation Script
echo "🚀 Preparing Silent Scribe for Vercel deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Running TypeScript type check..."
npm run type-check

# Run linting
echo "🧹 Running ESLint..."
npm run lint

# Run formatting check
echo "💄 Checking code formatting..."
npm run format:check

# Clean up any resource forks (macOS specific)
echo "🧽 Cleaning up resource forks..."
npm run cleanup

# Run build to ensure everything works
echo "🔨 Testing production build..."
npm run build

# Check for common issues
echo "🔍 Checking for common deployment issues..."

# Check environment variables
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    echo "⚠️  Warning: No environment file found. Make sure to configure environment variables in Vercel."
fi

# Check for required files
REQUIRED_FILES=("next.config.ts" "vercel.json" "tsconfig.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Required file $file is missing."
        exit 1
    fi
done

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Vercel"
echo "3. Configure environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "Environment variables to configure in Vercel:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY" 
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- SENDGRID_API_KEY"
echo "- NEXT_PUBLIC_PLAUSIBLE_DOMAIN"
