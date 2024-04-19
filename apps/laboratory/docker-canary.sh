#!/usr/env/bin

npm run playwright:canary:test
aws s3 cp ./test-results/ s3://$S3_BUCKET/web3modal-canary/$(date --iso-8601=seconds)/test-results/ --recursive
