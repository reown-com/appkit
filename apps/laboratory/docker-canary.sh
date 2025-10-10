# Not adding `set -e` so that S3 upload happens regardless

pnpm playwright:test:canary
TEST_EXIT_CODE=$?

echo ""
echo "✅ Playwright Test Results (json)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat test-results.json
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

destination="s3://$TEST_RESULTS_BUCKET/web3modal-canary/$(date --iso-8601=seconds)/test-results/"
echo "Uploading test results to $destination"
aws s3 cp ./test-results/ $destination --recursive

echo ""
echo "✅ Exit code"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test exit code: $TEST_EXIT_CODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit $TEST_EXIT_CODE
