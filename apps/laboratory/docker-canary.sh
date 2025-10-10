#!/bin/bash
# Not adding `set -e` so that S3 upload happens regardless

pnpm playwright:test:canary
TEST_EXIT_CODE=$?

echo ""
echo "✅ Playwright Test Results (json)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "test-results.json" ]; then
  cat test-results.json
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

echo ""
echo "✅ Upload Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "S3 upload exit code: $S3_EXIT_CODE"
echo "Test exit code: $TEST_EXIT_CODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit $TEST_EXIT_CODE
