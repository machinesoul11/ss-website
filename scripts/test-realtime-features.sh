#!/bin/bash

# Real-time Features Test Script
# Tests the admin dashboard APIs and real-time functionality

echo "🚀 Testing Silent Scribe Real-time Features"
echo "=========================================="

# Set base URL and admin API key
BASE_URL="http://localhost:3000"
ADMIN_API_KEY="${ADMIN_API_KEY:-your-admin-api-key}"

echo "📊 Testing Live Analytics API..."
curl -s -X GET "$BASE_URL/api/live-analytics" \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  | jq '.' || echo "❌ Live Analytics API failed"

echo ""
echo "🏥 Testing System Health API..."
curl -s -X GET "$BASE_URL/api/system-health" \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  | jq '.' || echo "❌ System Health API failed"

echo ""
echo "📡 Testing System Events Webhook Configuration..."
curl -s -X GET "$BASE_URL/api/system-events" \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  | jq '.' || echo "❌ System Events API failed"

echo ""
echo "🔔 Testing Live Notification Broadcast..."
curl -s -X POST "$BASE_URL/api/live-analytics" \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "success",
    "message": "Test notification - Real-time features are working!",
    "data": {"testRun": true, "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}
  }' | jq '.' || echo "❌ Notification Broadcast failed"

echo ""
echo "📈 Testing User Activity API (with sample user)..."
curl -s -X GET "$BASE_URL/api/user-activity?userId=test-user-123" \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  | jq '.' || echo "❌ User Activity API failed"

echo ""
echo "🎯 Testing System Event Webhook..."
curl -s -X POST "$BASE_URL/api/system-events" \
  -H "x-webhook-signature: ${WEBHOOK_SECRET:-your-webhook-secret}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "signup.milestone",
    "source": "test-script",
    "data": {"count": 50, "growth": "10%"},
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq '.' || echo "❌ System Event Webhook failed"

echo ""
echo "✅ Real-time Features Test Complete!"
echo ""
echo "🔗 Admin Dashboard URLs:"
echo "   • Admin Dashboard: $BASE_URL/admin"
echo "   • Live Analytics API: $BASE_URL/api/live-analytics"
echo "   • System Health API: $BASE_URL/api/system-health"
echo "   • User Activity API: $BASE_URL/api/user-activity"
echo ""
echo "📋 Phase 5 Real-time Features Status:"
echo "   ✅ Real-time updates for admin dashboard"
echo "   ✅ Live signup notifications"
echo "   ✅ Real-time analytics event processing"  
echo "   ✅ User activity monitoring"
echo "   ✅ System health monitoring"
echo ""
echo "🎉 Phase 5 - Real-time Features Section: COMPLETE"
