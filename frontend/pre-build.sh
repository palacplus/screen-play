#!/bin/bash

# Generate build information
BUILD_NUMBER=${GITHUB_RUN_NUMBER:-$(date +%s)}
COMMIT_HASH=${GITHUB_SHA:-$(node -p "require('./package.json').commitHash" || echo "unknown")}
BUILD_DATE=$(date -u +"%Y-%m-%d")
VERSION=$(node -p "require('./package.json').version")

# Create or update .env.local with build information
echo "# Auto-generated build information" > .env.local
echo "REACT_APP_VERSION=$VERSION" >> .env.local
echo "REACT_APP_BUILD_NUMBER=$BUILD_NUMBER" >> .env.local
echo "REACT_APP_COMMIT_HASH=$COMMIT_HASH" >> .env.local
echo "REACT_APP_BUILD_DATE=$BUILD_DATE" >> .env.local

echo "Build information generated:"
echo "  Version: $VERSION"
echo "  Build Number: $BUILD_NUMBER"
echo "  Commit Hash: $COMMIT_HASH"
echo "  Build Date: $BUILD_DATE"
