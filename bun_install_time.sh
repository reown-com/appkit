#!/bin/bash

# Record the start time for bun install
start_bun=$(date +%s)

# Run bun install
bun install

# Record the end time for bun install
end_bun=$(date +%s)

# Calculate the duration for bun install
duration_bun=$((end_bun - start_bun))
echo "bun install took $duration_bun seconds."

# Record the start time for bun build:laboratory
start_build=$(date +%s)

# Run bun build:laboratory
bun build:laboratory

# Record the end time for bun build:laboratory
end_build=$(date +%s)

# Calculate the duration for bun build:laboratory
duration_build=$((end_build - start_build))
echo "bun build:laboratory took $duration_build seconds."
