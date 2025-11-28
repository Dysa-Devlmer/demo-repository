// =============================================================================
// 🚀 CHATBOTDYSA ENTERPRISE+++++ LOAD TEST PROCESSOR
// Advanced Artillery.js Processor with Custom Logic - Fortune 500 Standards
// =============================================================================

const { v4: uuidv4 } = require('uuid');

module.exports = {
  // Custom functions for dynamic data generation
  generateRandomString,
  generateRandomInt,
  generateTimestamp,
  generateUniqueEmail,
  generatePhoneNumber,

  // Pre-request processors
  setCustomHeaders,
  prepareAuthPayload,
  prepareOrderPayload,

  // Post-request processors
  validateResponse,
  extractMetrics,
  logPerformanceMetrics,

  // Error handlers
  handleAuthError,
  handleApiError,

  // Setup and teardown
  setupTest,
  teardownTest
};

/**
 * Generate random string for testing
 */
function generateRandomString(requestParams, context, ee, next) {
  context.vars.randomString = Math.random().toString(36).substring(2, 15);
  return next();
}

/**
 * Generate random integer
 */
function generateRandomInt(requestParams, context, ee, next) {
  const min = 1;
  const max = 10000;
  context.vars.randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
  return next();
}

/**
 * Generate timestamp
 */
function generateTimestamp(requestParams, context, ee, next) {
  context.vars.timestamp = Date.now();
  return next();
}

/**
 * Generate unique email for load testing
 */
function generateUniqueEmail(requestParams, context, ee, next) {
  const uniqueId = uuidv4().substring(0, 8);
  const timestamp = Date.now();
  context.vars.uniqueEmail = `loadtest_${uniqueId}_${timestamp}@chatbotdysa.com`;
  return next();
}

/**
 * Generate realistic phone number
 */
function generatePhoneNumber(requestParams, context, ee, next) {
  const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
  const exchange = Math.floor(Math.random() * 900) + 100; // 100-999
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  context.vars.phoneNumber = `+1${areaCode}${exchange}${number}`;
  return next();
}

/**
 * Set custom headers for Enterprise testing
 */
function setCustomHeaders(requestParams, context, ee, next) {
  // Add enterprise headers for monitoring and tracking
  requestParams.headers = requestParams.headers || {};
  requestParams.headers['X-Load-Test-ID'] = uuidv4();
  requestParams.headers['X-Test-Session'] = context.vars.testSessionId || 'default';
  requestParams.headers['X-Enterprise-Client'] = 'ChatBotDysa-LoadTest';
  requestParams.headers['X-Performance-Test'] = 'true';

  return next();
}

/**
 * Prepare authentication payload with enterprise data
 */
function prepareAuthPayload(requestParams, context, ee, next) {
  if (!context.vars.uniqueEmail) {
    generateUniqueEmail(requestParams, context, ee, () => {});
  }

  requestParams.json = {
    email: context.vars.uniqueEmail,
    password: 'Enterprise123!',
    firstName: `LoadTest_${context.vars.randomString || 'User'}`,
    lastName: `Session_${context.vars.timestamp || Date.now()}`,
    metadata: {
      testType: 'load_test',
      sessionId: context.vars.testSessionId,
      timestamp: new Date().toISOString()
    }
  };

  return next();
}

/**
 * Prepare order payload for testing
 */
function prepareOrderPayload(requestParams, context, ee, next) {
  const orderItems = [
    { id: 1, name: 'Enterprise Burger', price: 15.99, quantity: Math.floor(Math.random() * 3) + 1 },
    { id: 2, name: 'Fortune 500 Fries', price: 8.99, quantity: Math.floor(Math.random() * 2) + 1 },
    { id: 3, name: 'Corporate Cola', price: 3.99, quantity: Math.floor(Math.random() * 3) + 1 }
  ];

  const selectedItems = orderItems.slice(0, Math.floor(Math.random() * orderItems.length) + 1);
  const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  requestParams.json = {
    items: selectedItems,
    customerInfo: {
      name: `LoadTest Customer ${context.vars.randomInt}`,
      email: context.vars.uniqueEmail,
      phone: context.vars.phoneNumber
    },
    total: Math.round(total * 100) / 100,
    orderType: Math.random() > 0.5 ? 'delivery' : 'pickup',
    notes: `Load test order - Session ${context.vars.testSessionId}`,
    metadata: {
      testOrder: true,
      loadTestSession: context.vars.testSessionId,
      timestamp: new Date().toISOString()
    }
  };

  return next();
}

/**
 * Validate response for enterprise standards
 */
function validateResponse(requestParams, response, context, ee, next) {
  // Check response time thresholds
  const responseTime = Date.now() - context.vars.requestStartTime;

  if (responseTime > 1000) {
    ee.emit('counter', 'enterprise.slow_response', 1);
    console.warn(`⚠️  Slow response detected: ${responseTime}ms`);
  }

  if (responseTime > 3000) {
    ee.emit('counter', 'enterprise.very_slow_response', 1);
    console.error(`🚨 Very slow response: ${responseTime}ms`);
  }

  // Check for enterprise headers
  if (!response.headers['x-response-time']) {
    ee.emit('counter', 'enterprise.missing_performance_headers', 1);
  }

  // Validate JSON structure for API responses
  if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
    try {
      const jsonBody = JSON.parse(response.body);
      if (!jsonBody.hasOwnProperty('success') && !jsonBody.hasOwnProperty('data')) {
        ee.emit('counter', 'enterprise.invalid_json_structure', 1);
      }
    } catch (e) {
      ee.emit('counter', 'enterprise.invalid_json', 1);
    }
  }

  return next();
}

/**
 * Extract custom metrics for enterprise monitoring
 */
function extractMetrics(requestParams, response, context, ee, next) {
  // Extract custom metrics from response headers
  const serverResponseTime = response.headers['x-response-time'];
  const databaseTime = response.headers['x-database-time'];
  const cacheHit = response.headers['x-cache-status'];

  if (serverResponseTime) {
    ee.emit('histogram', 'enterprise.server_response_time', parseFloat(serverResponseTime));
  }

  if (databaseTime) {
    ee.emit('histogram', 'enterprise.database_time', parseFloat(databaseTime));
  }

  if (cacheHit === 'hit') {
    ee.emit('counter', 'enterprise.cache_hits', 1);
  } else if (cacheHit === 'miss') {
    ee.emit('counter', 'enterprise.cache_misses', 1);
  }

  // Track authentication success/failure
  if (requestParams.url && requestParams.url.includes('/auth/')) {
    if (response.statusCode === 200 || response.statusCode === 201) {
      ee.emit('counter', 'enterprise.auth_success', 1);
    } else {
      ee.emit('counter', 'enterprise.auth_failure', 1);
    }
  }

  return next();
}

/**
 * Log performance metrics
 */
function logPerformanceMetrics(requestParams, response, context, ee, next) {
  const responseTime = Date.now() - (context.vars.requestStartTime || Date.now());
  const endpoint = requestParams.url || 'unknown';
  const method = requestParams.method || 'GET';
  const statusCode = response.statusCode;

  // Log to custom metrics collector
  const logEntry = {
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    statusCode,
    responseTime,
    testSession: context.vars.testSessionId,
    userId: context.vars.userId || 'anonymous'
  };

  // Emit custom event for monitoring systems
  ee.emit('customEvent', 'enterprise.request_completed', logEntry);

  return next();
}

/**
 * Handle authentication errors
 */
function handleAuthError(requestParams, response, context, ee, next) {
  if (response.statusCode === 401 || response.statusCode === 403) {
    console.warn(`🔐 Auth error on ${requestParams.url}: ${response.statusCode}`);
    ee.emit('counter', 'enterprise.auth_errors', 1);

    // Try to extract error details
    try {
      const errorBody = JSON.parse(response.body);
      if (errorBody.message) {
        ee.emit('counter', `enterprise.auth_error.${errorBody.message.replace(/\s+/g, '_')}`, 1);
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  return next();
}

/**
 * Handle general API errors
 */
function handleApiError(requestParams, response, context, ee, next) {
  if (response.statusCode >= 400) {
    const endpoint = requestParams.url.replace(/\d+/g, ':id'); // Normalize dynamic URLs
    ee.emit('counter', `enterprise.api_errors.${response.statusCode}`, 1);
    ee.emit('counter', `enterprise.endpoint_errors.${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`, 1);

    console.error(`🚨 API Error: ${requestParams.method} ${requestParams.url} -> ${response.statusCode}`);
  }

  return next();
}

/**
 * Setup test session
 */
function setupTest(context, ee, next) {
  // Initialize test session
  context.vars.testSessionId = `loadtest_${uuidv4().substring(0, 8)}_${Date.now()}`;
  context.vars.requestStartTime = Date.now();

  console.log(`🚀 Starting load test session: ${context.vars.testSessionId}`);

  // Emit test start event
  ee.emit('customEvent', 'enterprise.test_session_start', {
    sessionId: context.vars.testSessionId,
    timestamp: new Date().toISOString()
  });

  return next();
}

/**
 * Teardown test session
 */
function teardownTest(context, ee, next) {
  const sessionDuration = Date.now() - context.vars.requestStartTime;

  console.log(`✅ Completed load test session: ${context.vars.testSessionId} (${sessionDuration}ms)`);

  // Emit test completion event
  ee.emit('customEvent', 'enterprise.test_session_complete', {
    sessionId: context.vars.testSessionId,
    duration: sessionDuration,
    timestamp: new Date().toISOString()
  });

  return next();
}

// =============================================================================
// ENTERPRISE LOAD TEST PROCESSOR FEATURES
// =============================================================================
//
// This processor provides:
//
// 1. DYNAMIC DATA GENERATION:
//    - Unique emails, phone numbers, and user data
//    - Realistic order payloads with random items
//    - Session tracking and test correlation
//
// 2. ENTERPRISE HEADERS:
//    - Custom tracking headers for monitoring
//    - Performance test identification
//    - Session correlation across requests
//
// 3. RESPONSE VALIDATION:
//    - Response time thresholds (1s warning, 3s error)
//    - JSON structure validation
//    - Required header validation
//
// 4. CUSTOM METRICS:
//    - Server response time tracking
//    - Database performance metrics
//    - Cache hit/miss ratios
//    - Authentication success rates
//
// 5. ERROR HANDLING:
//    - Specialized auth error handling
//    - API error categorization
//    - Endpoint-specific error tracking
//
// 6. SESSION MANAGEMENT:
//    - Test session initialization
//    - Performance tracking
//    - Cleanup and reporting
//
// =============================================================================