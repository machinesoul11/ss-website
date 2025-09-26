#!/bin/bash

# Silent Scribe API Testing Script
# Make sure your development server is running: npm run dev

BASE_URL="http://localhost:3000"
API_KEY="your_admin_api_key"  # Replace with your actual admin API key

echo "🧪 Testing Silent Scribe Beta Signup API"
echo "========================================"

# Test 1: Beta Signup
echo ""
echo "📝 Test 1: Beta Signup"
echo "----------------------"

curl -X POST "$BASE_URL/api/beta-signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "githubUsername": "testuser",
    "currentTools": ["grammarly", "notion", "vale"],
    "documentationPlatforms": ["github", "confluence"],
    "painPoints": "Current tools are slow, don'\''t understand code syntax, and have privacy concerns. We need something that works offline and integrates with our development workflow.",
    "teamSize": "small_team",
    "useCaseDescription": "We'\''re a startup building developer tools and need better documentation assistance that respects our privacy while understanding technical content.",
    "signupSource": "test_script",
    "privacyConsent": true,
    "marketingOptIn": true,
    "researchOptIn": true
  }' | jq '.'

# Test 2: Duplicate Email (should fail)
echo ""
echo "🔄 Test 2: Duplicate Email (should return 409)"
echo "----------------------------------------------"

curl -X POST "$BASE_URL/api/beta-signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "currentTools": ["grammarly"],
    "documentationPlatforms": ["github"],
    "painPoints": "Testing duplicate email",
    "useCaseDescription": "This should fail",
    "privacyConsent": true,
    "marketingOptIn": true,
    "researchOptIn": true
  }' | jq '.'

# Test 3: Invalid Data (should fail validation)
echo ""
echo "❌ Test 3: Invalid Data (should return 400)"
echo "-------------------------------------------"

curl -X POST "$BASE_URL/api/beta-signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "currentTools": [],
    "documentationPlatforms": [],
    "painPoints": "short",
    "useCaseDescription": "short",
    "privacyConsent": false
  }' | jq '.'

# Test 4: Analytics Event
echo ""
echo "📊 Test 4: Analytics Event"
echo "--------------------------"

curl -X POST "$BASE_URL/api/analytics" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "page_view",
    "properties": {
      "page": "/beta",
      "source": "test_script"
    },
    "visitorId": "visitor_test_'$(date +%s)'",
    "sessionId": "session_test_'$(date +%s)'"
  }' | jq '.'

# Test 5: Campaign Management (requires admin key)
if [ "$API_KEY" != "your_admin_api_key" ]; then
  echo ""
  echo "📧 Test 5: Email Campaign (Admin endpoint)"
  echo "------------------------------------------"
  
  curl -X POST "$BASE_URL/api/email-campaigns" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d '{
      "type": "development_update",
      "subject": "Test Development Update - $(date)",
      "content": "This is a test development update sent via API. We'\''re making great progress on the Silent Scribe writing assistant!",
      "segmentFilter": "recent_signups"
    }' | jq '.'
else
  echo ""
  echo "⏭️  Test 5: Skipped (update API_KEY in script)"
  echo "----------------------------------------------"
fi

# Test 6: Analytics Dashboard (requires admin key)
if [ "$API_KEY" != "your_admin_api_key" ]; then
  echo ""
  echo "📈 Test 6: Analytics Dashboard (Admin endpoint)"
  echo "----------------------------------------------"
  
  curl -X GET "$BASE_URL/api/analytics?days=7" \
    -H "Authorization: Bearer $API_KEY" | jq '.'
else
  echo ""
  echo "⏭️  Test 6: Skipped (update API_KEY in script)"
  echo "----------------------------------------------"
fi



# Test 7: Feedback Submission
echo ""
echo "💬 Test 7: Feedback Submission"
echo "------------------------------"

curl -X POST "$BASE_URL/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "feedbackType": "feature_request",
    "freeFormFeedback": "It would be great to have real-time collaboration features similar to Google Docs but with privacy guarantees.",
    "rating": 4
  }' | jq '.'

# Test 8: User Preferences Update
echo ""
echo "⚙️  Test 8: User Preferences Update"
echo "----------------------------------"

curl -X PUT "$BASE_URL/api/user-preferences" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "communicationFrequency": "weekly",
    "technicalBackground": "intermediate",
    "areasOfInterest": ["VS Code extensions", "documentation tools", "privacy tools"],
    "timezone": "America/New_York"
  }' | jq '.'

# Test 9: Get User Preferences
echo ""
echo "📋 Test 9: Get User Preferences"
echo "-------------------------------"

curl -X GET "$BASE_URL/api/user-preferences?email=test@example.com" | jq '.'

echo ""
echo "✅ API testing complete!"
echo ""
echo "💡 Tips:"
echo "   - Check your browser network tab for detailed responses"
echo "   - Update API_KEY in this script to test admin endpoints"
echo "   - Verify email delivery in your SendGrid dashboard"
echo "   - Check Supabase tables for data persistence"
echo "   - All tables now use proper foreign key relationships"
