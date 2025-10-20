#!/bin/bash
# DNS troubleshooting script for register.walletconnect.com
# This script performs comprehensive DNS diagnostics without failing on errors

DOMAIN="register.walletconnect.com"
URL="https://${DOMAIN}"
OUTPUT_FILE="dns-output.txt"

{
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 DNS Troubleshooting Report for ${DOMAIN}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Timestamp: $(date --iso-8601=seconds 2>/dev/null || date)"
  echo ""

  # 1. Check current DNS resolver configuration
  echo "1️⃣  DNS Resolver Configuration"
  echo "────────────────────────────────────────────────────────"
  if [ -f /etc/resolv.conf ]; then
    echo "Contents of /etc/resolv.conf:"
    cat /etc/resolv.conf
  else
    echo "⚠️  /etc/resolv.conf not found"
  fi
  echo ""

  # 2. DNS Resolution using different tools
  echo "2️⃣  DNS Resolution Tests"
  echo "────────────────────────────────────────────────────────"

  # Try dig
  echo "Using dig:"
  if command -v dig &> /dev/null; then
    dig +short ${DOMAIN} || echo "⚠️  dig failed"
    echo ""
    echo "Full dig output with trace:"
    dig ${DOMAIN} +trace || echo "⚠️  dig +trace failed"
  else
    echo "⚠️  dig command not available"
  fi
  echo ""

  # Try nslookup
  echo "Using nslookup:"
  if command -v nslookup &> /dev/null; then
    nslookup ${DOMAIN} || echo "⚠️  nslookup failed"
  else
    echo "⚠️  nslookup command not available"
  fi
  echo ""

  # Try host
  echo "Using host:"
  if command -v host &> /dev/null; then
    host ${DOMAIN} || echo "⚠️  host failed"
  else
    echo "⚠️  host command not available"
  fi
  echo ""

  # 3. Check DNS with public resolvers
  echo "3️⃣  Testing with Public DNS Resolvers"
  echo "────────────────────────────────────────────────────────"
  if command -v dig &> /dev/null; then
    echo "Google DNS (8.8.8.8):"
    dig @8.8.8.8 ${DOMAIN} +short || echo "⚠️  Failed to resolve via Google DNS"
    echo ""
    echo "Cloudflare DNS (1.1.1.1):"
    dig @1.1.1.1 ${DOMAIN} +short || echo "⚠️  Failed to resolve via Cloudflare DNS"
  else
    echo "⚠️  dig not available for public DNS tests"
  fi
  echo ""

  # 4. Test network connectivity to resolved IPs
  echo "4️⃣  Network Connectivity Tests"
  echo "────────────────────────────────────────────────────────"

  # Get IP addresses
  IPS=$(dig +short ${DOMAIN} 2>/dev/null || echo "")

  if [ -n "$IPS" ]; then
    echo "Resolved IP addresses:"
    echo "$IPS"
    echo ""

    # Test ping to first IP
    FIRST_IP=$(echo "$IPS" | head -n1)
    echo "Ping test to ${FIRST_IP}:"
    ping -c 3 -W 2 ${FIRST_IP} 2>&1 || echo "⚠️  Ping failed or timed out"
  else
    echo "⚠️  No IP addresses resolved - cannot perform connectivity tests"
  fi
  echo ""

  # 5. Test HTTPS connectivity
  echo "5️⃣  HTTPS Connectivity Test"
  echo "────────────────────────────────────────────────────────"
  echo "Testing HTTPS connection to ${URL}:"
  if command -v curl &> /dev/null; then
    curl -v --connect-timeout 10 -I ${URL} 2>&1 || echo "⚠️  HTTPS connection failed"
  elif command -v wget &> /dev/null; then
    wget --timeout=10 --spider -v ${URL} 2>&1 || echo "⚠️  HTTPS connection failed"
  else
    echo "⚠️  Neither curl nor wget available for HTTPS test"
  fi
  echo ""

  # 6. Traceroute to destination
  echo "6️⃣  Network Path Analysis"
  echo "────────────────────────────────────────────────────────"
  if [ -n "$IPS" ]; then
    FIRST_IP=$(echo "$IPS" | head -n1)
    echo "Traceroute to ${FIRST_IP}:"
    if command -v traceroute &> /dev/null; then
      traceroute -m 15 -w 2 ${FIRST_IP} 2>&1 || echo "⚠️  Traceroute failed"
    elif command -v tracepath &> /dev/null; then
      tracepath -m 15 ${FIRST_IP} 2>&1 || echo "⚠️  Tracepath failed"
    else
      echo "⚠️  No traceroute tool available"
    fi
  else
    echo "⚠️  Cannot perform traceroute - no IP resolved"
  fi
  echo ""

  # 7. Check if domain is blocked or filtered
  echo "7️⃣  DNS Validation"
  echo "────────────────────────────────────────────────────────"
  if command -v dig &> /dev/null; then
    echo "Checking DNS response codes:"
    dig ${DOMAIN} | grep -E "status:|ANSWER:" || echo "⚠️  Could not extract status"
  fi
  echo ""

  # 8. Summary
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 Summary"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [ -n "$IPS" ]; then
    echo "✅ DNS Resolution: SUCCESS"
    echo "   Resolved IPs: ${IPS}"
  else
    echo "❌ DNS Resolution: FAILED"
    echo "   Possible causes:"
    echo "   - DNS server is unreachable or misconfigured"
    echo "   - Domain does not exist or is not properly configured"
    echo "   - Network/firewall blocking DNS queries"
  fi
  echo ""

  # Test basic connectivity
  if curl -s --connect-timeout 5 -o /dev/null ${URL} 2>/dev/null; then
    echo "✅ HTTPS Connectivity: SUCCESS"
  else
    echo "❌ HTTPS Connectivity: FAILED"
    echo "   Possible causes:"
    echo "   - Firewall/security group blocking outbound HTTPS"
    echo "   - SSL/TLS certificate issues"
    echo "   - Server is down or unreachable"
    echo "   - Network routing problems"
  fi

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

} > "${OUTPUT_FILE}" 2>&1

echo "DNS troubleshooting complete. Results saved to ${OUTPUT_FILE}"
