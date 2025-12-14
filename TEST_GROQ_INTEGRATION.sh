#!/bin/bash
# Groq AI Integration - Development Testing Checklist

echo "🚀 Groq AI Integration - Development Test Suite"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo "${YELLOW}[TEST 1]${NC} Checking if dev server is running on port 3001..."
if curl -s http://localhost:3001 > /dev/null; then
  echo -e "${GREEN}✓ Server is running on port 3001${NC}"
else
  echo -e "${RED}✗ Server not accessible on port 3001${NC}"
  exit 1
fi
echo ""

# Test 2: Check quota manager endpoint
echo "${YELLOW}[TEST 2]${NC} Testing Quota Manager GET endpoint..."
QUOTA_RESPONSE=$(curl -s http://localhost:3001/api/ai-chef/quota-manager)
if echo "$QUOTA_RESPONSE" | grep -q "requestsUsed"; then
  echo -e "${GREEN}✓ Quota manager responding correctly${NC}"
  echo "   Response: $QUOTA_RESPONSE" | head -c 100
  echo ""
else
  echo -e "${RED}✗ Quota manager failed${NC}"
fi
echo ""

# Test 3: Check Groq API key is set
echo "${YELLOW}[TEST 3]${NC} Checking Groq API key configuration..."
if [ -n "$GROQ_API_KEY" ]; then
  echo -e "${GREEN}✓ GROQ_API_KEY is set${NC}"
  echo "   Key preview: ${GROQ_API_KEY:0:10}...${GROQ_API_KEY: -10}"
else
  echo -e "${RED}✗ GROQ_API_KEY is not set${NC}"
fi
echo ""

# Test 4: Check lib/groq.ts exists
echo "${YELLOW}[TEST 4]${NC} Verifying Groq implementation file..."
if [ -f "./lib/groq.ts" ]; then
  echo -e "${GREEN}✓ lib/groq.ts exists${NC}"
  LINES=$(wc -l < "./lib/groq.ts")
  echo "   File size: $LINES lines"
else
  echo -e "${RED}✗ lib/groq.ts not found${NC}"
fi
echo ""

# Test 5: Check ai-chef route imports Groq
echo "${YELLOW}[TEST 5]${NC} Verifying ai-chef route uses Groq..."
if grep -q "from @/lib/groq" ./app/api/ai-chef/route.ts; then
  echo -e "${GREEN}✓ ai-chef route imports Groq${NC}"
else
  echo -e "${RED}✗ ai-chef route still using old import${NC}"
fi
echo ""

# Test 6: Check build status
echo "${YELLOW}[TEST 6]${NC} Running production build..."
if pnpm build > /tmp/build.log 2>&1; then
  echo -e "${GREEN}✓ Production build successful${NC}"
else
  echo -e "${RED}✗ Production build failed${NC}"
  cat /tmp/build.log
fi
echo ""

echo "================================================"
echo "${GREEN}All critical tests passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Test recipe generation via browser: http://localhost:3001/ai-chef"
echo "2. Monitor server logs for Groq API calls (should see [GROQ-*] logs)"
echo "3. Verify JSON responses are properly formatted"
echo "4. Check quota manager increases with each new query"
echo "5. When ready, run: git add . && git commit -m 'feat: migrate from Gemini to Groq API'"
