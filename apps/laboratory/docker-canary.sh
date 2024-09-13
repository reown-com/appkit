# Not adding `set -e` so that S3 upload happens regardless

pnpm playwright:test:canary

destination="s3://$TEST_RESULTS_BUCKET/appkit-canary/$(date --iso-8601=seconds)/test-results/"
echo "Uploading test results to $destination"
aws s3 cp ./test-results/ $destination --recursive
