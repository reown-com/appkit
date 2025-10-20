#!/bin/bash
set -e

OTP=$1

if [ -z "$OTP" ]; then
  cat << 'EOF'
📦 Consolidated Publishing Script

Usage: ./scripts/publish-packages.sh <otp-code>

Features:
  ✅ Auto-checks which packages need publishing
  ✅ Uses pnpm (resolves workspace:* to actual versions)  
  ✅ Sequential publishing (avoids OTP rate limits)
  ✅ Fully resumable

Example: ./scripts/publish-packages.sh 123456
EOF
  exit 1
fi

cd /home/laughingwhales/development/sacred-appkit

echo "🔍 Finding packages to publish..."
echo ""

# Get current version
VERSION=$(cat packages/appkit/package.json | grep '"version"' | head -1 | cut -d'"' -f4)

# Check each package
PENDING=()
PUBLISHED_COUNT=0

for pkg in packages/*/package.json packages/adapters/*/package.json; do
  PKG_NAME=$(cat "$pkg" | grep '"name"' | head -1 | cut -d'"' -f4)
  
  if npm view "$PKG_NAME@$VERSION" version &>/dev/null; then
    PUBLISHED_COUNT=$((PUBLISHED_COUNT + 1))
  else
    PENDING+=("$(dirname $pkg)")
    echo "📦 $PKG_NAME - needs publishing"
  fi
done

echo ""
echo "📊 Status:"
echo "   ✅ Already published: $PUBLISHED_COUNT / 25"
echo "   📦 To publish: ${#PENDING[@]}"
echo ""

if [ ${#PENDING[@]} -eq 0 ]; then
  echo "🎉 All packages already published!"
  exit 0
fi

echo "🚀 Publishing ${#PENDING[@]} packages sequentially..."
echo "   (Using pnpm to auto-resolve workspace:* deps)"
echo ""

SUCCESS=0
for pkg_dir in "${PENDING[@]}"; do
  PKG_NAME=$(cat "$pkg_dir/package.json" | grep '"name"' | head -1 | cut -d'"' -f4)
  
  echo "📦 Publishing $PKG_NAME..."
  cd "$pkg_dir"
  
  # Use pnpm publish which resolves workspace:*
  unset CI GITHUB_ACTIONS
  if pnpm publish --access public --no-git-checks --otp="$OTP" 2>&1 | grep -E "^\+|Published|error" | head -3; then
    echo "   ✅ Success!"
    SUCCESS=$((SUCCESS + 1))
    sleep 2  # Avoid rate limiting
  else
    echo ""
    echo "❌ Failed at $PKG_NAME"
    echo ""
    echo "Progress: $SUCCESS / ${#PENDING[@]} published"
    echo ""
    echo "To resume: bash scripts/publish-packages.sh <new-otp>"
    exit 1
  fi
  
  cd /home/laughingwhales/development/sacred-appkit
done

echo ""
echo "🎉 SUCCESS! Published $SUCCESS packages!"
