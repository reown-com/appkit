#!/bin/sh

echo "Checking for potentially vulnerable packages..."
echo "------------------------------------------------"

check_package() {
    package=$1
    vulnerable_version=$2
    
    echo "Package: $package"
    echo "Vulnerable version: $vulnerable_version"
    
    # Use npm ls to find installed versions
    installed_versions=$(npm ls $package --all --depth=Infinity 2>/dev/null | grep -E "($package@[^ ]+)" | sed -E "s/^.*($package@[^ ]+).*$/\1/" | cut -d "@" -f2 | sort -u)
    
    if [ -z "$installed_versions" ]; then
        echo "Installed version: Not found"
    else
        echo "Installed version(s):"
        echo "$installed_versions" | sed 's/^/  - /'
    fi
    
    echo "------------------------------------------------"
}

check_package "backslash" "0.2.1"
check_package "chalk" "5.6.1"
check_package "chalk-template" "1.1.1"
check_package "color-convert" "3.1.1"
check_package "color-name" "2.0.1"
check_package "color-string" "2.1.1"
check_package "wrap-ansi" "9.0.1"
check_package "supports-hyperlinks" "4.1.1"
check_package "strip-ansi" "7.1.1"
check_package "slice-ansi" "7.1.1"
check_package "simple-swizzle" "0.2.3"
check_package "is-arrayish" "0.3.3"
check_package "error-ex" "1.3.3"
check_package "ansi-regex" "6.2.1"
check_package "ansi-styles" "6.2.2"
check_package "supports-color" "10.2.1"
check_package "debug" "4.4.2"
