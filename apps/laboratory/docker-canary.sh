#!/bin/bash
# Not adding `set -e` so that S3 upload happens regardless

pnpm playwright:test:canary
TEST_EXIT_CODE=$?

echo ""
echo "✅ Playwright Test Results (json)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "test-results.json" ]; then
  echo "Failed tests:"
  jq -r '.suites[].specs[] | select(.ok == false) | . as $spec | .tests[] | "[\(.projectName)] › \($spec.file):\($spec.line):\($spec.column) › \($spec.title)\nError: \(.results[] | select(.status == "failed") | .error.message)\n"' test-results.json || echo "No failures found"
  cat test-results.json

  cp test-results.json ./test-results/
else

  echo "test-results.json not found"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

destination="s3://$TEST_RESULTS_BUCKET/web3modal-canary/$(date --iso-8601=seconds)/test-results/"
echo "Uploading test results to $destination"
aws s3 cp ./test-results/ $destination --recursive
S3_EXIT_CODE=$?
echo "S3 upload command completed with exit code: $S3_EXIT_CODE"

if [ $S3_EXIT_CODE -eq 0 ]; then
  echo ""
  echo "📥 To download these test results locally:"
  echo "aws s3 cp $destination ./test-results/ --recursive"
  echo ""
fi

echo ""
echo "✅ Upload Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "S3 upload exit code: $S3_EXIT_CODE"
echo "Test exit code: $TEST_EXIT_CODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
# Kill the playwright:start process
pkill -f "playwright:start" || true

exit $TEST_EXIT_CODE
