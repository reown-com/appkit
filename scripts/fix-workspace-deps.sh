#!/bin/bash
set -e

VERSION=${1:-"1.8.11"}

echo "🔧 Replacing workspace:* with ^$VERSION in all package.json files..."
echo ""

cd /home/laughingwhales/development/sacred-appkit

UPDATED=0

for pkg in packages/*/package.json packages/adapters/*/package.json; do
  if [ -f "$pkg" ]; then
    # Replace workspace:* with actual version
    if grep -q "workspace:\*" "$pkg"; then
      sed -i 's/"workspace:\*"/"^'"$VERSION"'"/g' "$pkg"
      echo "✓ $(dirname $pkg)"
      UPDATED=$((UPDATED + 1))
    fi
  fi
done

echo ""
echo "✅ Updated $UPDATED package.json files"
echo ""
echo "Next steps:"
echo "  1. pnpm install  # Update lockfile"
echo "  2. Create new changeset or bump version manually"
echo "  3. pnpm build:all"
echo "  4. Publish with new version"

