#! /bin/bash

# This script generates a .npmrc file for the current project.
rm .npmrc
echo @rerock:registry=https://npm.pkg.github.com  >> .npmrc
echo //npm.pkg.github.com/:_authToken=$GITHUB_TOKEN >> .npmrc
echo 'GENERATED_NPMRC'