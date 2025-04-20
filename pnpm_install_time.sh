#!/bin/bash

# Record the start time for pnpm install
start_pnpm=$(date +%s)

# Run pnpm install
pnpm install

# Record the end time for pnpm install
end_pnpm=$(date +%s)

# Calculate the duration for pnpm install
duration_pnpm=$((end_pnpm - start_pnpm))
echo "pnpm install took $duration_pnpm seconds."

# Record the start time for bun build:laboratory
start_build=$(date +%s)

# Run bun build:laboratory
pnpm build:laboratory

# Record the end time for bun build:laboratory
end_build=$(date +%s)

# Calculate the duration for bun build:laboratory
duration_build=$((end_build - start_build))
echo "pnpm build:laboratory took $duration_build seconds."
