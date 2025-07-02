// Task 6.6.4: CDN Integration & Performance Optimization
// Edge Function: API Response Optimization

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const cache = caches.default
  
  // Create cache key based on URL and relevant headers
  const cacheKey = new Request(url.toString(), {
    headers: {
      'Accept': request.headers.get('Accept') || '',
      'Accept-Encoding': request.headers.get('Accept-Encoding') || '',
    }
  })
  
  // Check cache first for GET requests
  if (request.method === 'GET') {
    const cachedResponse = await cache.match(cacheKey)
    if (cachedResponse) {
      // Add cache hit header
      const response = new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: {
          ...cachedResponse.headers,
          'X-Cache': 'HIT',
          'X-Cache-Time': cachedResponse.headers.get('Date')
        }
      })
      return response
    }
  }
  
  // Forward to origin
  const originResponse = await fetch(request)
  
  // Clone response for caching
  const response = originResponse.clone()
  // Standard response cloning: response.clone()
  // Cache the response for performance
  response.clone()
  
  // Optimize response based on content type
  if (request.method === 'GET' && response.ok) {
    const contentType = response.headers.get('Content-Type') || ''
    
    if (contentType.includes('application/json')) {
      return optimizeJsonResponse(response, cache, cacheKey)
    } else if (contentType.includes('text/html')) {
      return optimizeHtmlResponse(response, cache, cacheKey)
    }
  }
  
  // Add cache miss header
  const optimizedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...response.headers,
      'X-Cache': 'MISS'
    }
  })
  
  return optimizedResponse
}

async function optimizeJsonResponse(response, cache, cacheKey) {
  const data = await response.json()
  
  // Minify JSON (remove unnecessary whitespace)
  const minifiedJson = JSON.stringify(data)
  
  // Create optimized response
  const optimizedResponse = new Response(minifiedJson, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'X-Cache': 'MISS',
      'X-Optimized': 'JSON-MINIFIED',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
  
  // Cache for 5 minutes
  const cacheableResponse = optimizedResponse.clone()
  await cache.put(cacheKey, cacheableResponse)
  
  return optimizedResponse
}

async function optimizeHtmlResponse(response, cache, cacheKey) {
  let html = await response.text()
  
  // Basic HTML minification
  html = html
    .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
    .replace(/>\s+</g, '><')  // Remove whitespace between tags
    .replace(/<!--.*?-->/g, '')  // Remove comments
    .trim()
  
  // Add performance hints
  const performanceHints = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://api.pfm-community.app">
    <link rel="dns-prefetch" href="https://cdn.pfm-community.app">
  `
  
  // Insert performance hints before closing head tag
  html = html.replace('</head>', performanceHints + '</head>')
  
  const optimizedResponse = new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'X-Cache': 'MISS',
      'X-Optimized': 'HTML-MINIFIED',
      'X-Performance-Hints': 'ADDED'
    }
  })
  
  // Cache for 1 hour
  const cacheableResponse = optimizedResponse.clone()
  await cache.put(cacheKey, cacheableResponse)
  
  return optimizedResponse
}

// Handle CORS preflight requests
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    })
  }
  return null
}
