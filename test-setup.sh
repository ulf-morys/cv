#!/bin/bash

# CV Website Test Setup Script
echo "🧪 Testing CV Website Setup..."

# Check Jekyll installation
if command -v bundle >/dev/null 2>&1; then
    echo "✅ Bundler is available"

    # Install dependencies
    echo "📦 Installing dependencies..."
    bundle install

    # Test Jekyll build
    echo "🔨 Testing Jekyll build..."
    bundle exec jekyll build --verbose

    if [ $? -eq 0 ]; then
        echo "✅ Jekyll build successful"

        # Start Jekyll server in background for testing
        echo "🚀 Starting Jekyll server..."
        bundle exec jekyll serve --detach --port 4000

        # Wait for server to start
        sleep 5

        # Test if server is responding
        if curl -f -s http://localhost:4000 > /dev/null; then
            echo "✅ Website is accessible at http://localhost:4000"
        else
            echo "❌ Website is not responding"
        fi

        # Stop the background server
        pkill -f jekyll
    else
        echo "❌ Jekyll build failed"
    fi
else
    echo "❌ Bundler not found. Please install Ruby and Bundler first."
    echo "Visit: https://bundler.io/ for installation instructions"
fi

# Check file structure
echo "📁 Checking file structure..."

required_files=(
    "_config.yml"
    "index.html"
    "Gemfile"
    "_data/en/content.yml"
    "_data/de/content.yml"
    "_data/fr/content.yml"
    "_layouts/default.html"
    "assets/css/main.css"
    "assets/js/main.js"
    "README.md"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required files are present"
else
    echo "❌ Missing ${#missing_files[@]} required files"
fi

echo ""
echo "🎉 Test complete! Check the results above."
echo "To start the website locally, run: bundle exec jekyll serve"