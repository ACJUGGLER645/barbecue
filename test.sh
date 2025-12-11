#!/bin/bash

echo "🔥 Dev Barbecue - Test Script"
echo "=============================="
echo ""

# Colors
GREEN='\033[0.32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Backend Health Check
echo -e "${BLUE}[1/5]${NC} Testing Backend Health..."
response=$(curl -s http://localhost:5000/api/health)
if [[ $response == *"ok"* ]]; then
    echo -e "${GREEN}✓${NC} Backend is running"
else
    echo -e "${RED}✗${NC} Backend is not responding"
    echo "Make sure to run: cd backend && python app.py"
    exit 1
fi

# Test 2: Login
echo -e "${BLUE}[2/5]${NC} Testing Login..."
login_response=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rafaguzmanrodri@gmail.com","password":"admin"}')

if [[ $login_response == *"access_token"* ]]; then
    echo -e "${GREEN}✓${NC} Login successful"
    token=$(echo $login_response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}✗${NC} Login failed"
    echo "Response: $login_response"
    exit 1
fi

# Test 3: Get Current User
echo -e "${BLUE}[3/5]${NC} Testing Get Current User..."
user_response=$(curl -s http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $token")

if [[ $user_response == *"email"* ]]; then
    echo -e "${GREEN}✓${NC} User data retrieved"
else
    echo -e "${RED}✗${NC} Failed to get user data"
    exit 1
fi

# Test 4: Get Users (Admin)
echo -e "${BLUE}[4/5]${NC} Testing Admin - Get Users..."
users_response=$(curl -s http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer $token")

if [[ $users_response == *"users"* ]]; then
    echo -e "${GREEN}✓${NC} Users list retrieved"
else
    echo -e "${RED}✗${NC} Failed to get users"
    exit 1
fi

# Test 5: Frontend Check
echo -e "${BLUE}[5/5]${NC} Checking Frontend..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is running"
else
    echo -e "${RED}✗${NC} Frontend is not running"
    echo "Make sure to run: cd frontend && npm run dev"
fi

echo ""
echo -e "${GREEN}=============================="
echo "All tests passed! ✓"
echo "==============================${NC}"
echo ""
echo "Access the app:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5000"
echo ""
echo "Login credentials:"
echo "  Email:    rafaguzmanrodri@gmail.com"
echo "  Password: admin"
