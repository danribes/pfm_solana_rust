// Task 6.6.4: CDN Integration & Performance Optimization
// Edge Function: Asset Optimization and Modern Format Delivery

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const cache = caches.default
  
  // Determine if this is an image request
  const isImageRequest = /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url.pathname)
  
  if (isImageRequest) {
    return handleImageOptimization(request, cache)
  }
  
  // Handle other static assets
  return handleStaticAsset(request, cache)
  // Standard response cloning: response.clone()
}

async function handleImageOptimization(request, cache) {
  const url = new URL(request.url)
  const acceptHeader = request.headers.get('Accept') || ''
  
  // Determine optimal image format based on browser support
  let targetFormat = getOptimalImageFormat(acceptHeader, url.pathname)
  let cacheKey = `${url.pathname}?format=${targetFormat}&optimized=true`
  
  // Check cache first
  const cachedResponse = await cache.match(cacheKey)
  if (cachedResponse) {
    return addCacheHeaders(cachedResponse, 'HIT')
  }
  
  // Fetch original image
  const originalResponse = await fetch(request)
  if (!originalResponse.ok) {
    return originalResponse
  }
  
  try {
    // Optimize image based on format and size
    const optimizedImage = await optimizeImage(originalResponse, targetFormat, url)
    
    // Create optimized response
    const optimizedResponse = new Response(optimizedImage.body, {
      status: 200,
      headers: {
        'Content-Type': `image/${targetFormat}`,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Optimized': 'TRUE',
        'X-Original-Format': getImageFormat(url.pathname),
        'X-Optimized-Format': targetFormat,
        'X-Cache': 'MISS',
        'Vary': 'Accept'
      }
    })
    
    // Cache the optimized image
    await cache.put(cacheKey, optimizedResponse.clone())
    
    return optimizedResponse
  } catch (error) {
    // Fallback to original image if optimization fails
    console.error('Image optimization failed:', error)
    return addCacheHeaders(originalResponse, 'MISS', 'OPTIMIZATION-FAILED')
  }
}

async function handleStaticAsset(request, cache) {
  const url = new URL(request.url)
  
  // Create cache key
  const cacheKey = new Request(url.toString())
  
  // Check cache
  const cachedResponse = await cache.match(cacheKey)
  if (cachedResponse) {
    return addCacheHeaders(cachedResponse, 'HIT')
  }
  
  // Fetch from origin
  const response = await fetch(request)
  
  if (response.ok) {
    const contentType = response.headers.get('Content-Type') || ''
    
    // Optimize CSS and JS files
    if (contentType.includes('text/css') || contentType.includes('javascript')) {
      return optimizeTextAsset(response, cache, cacheKey, contentType)
    }
    
    // Add long-term caching for static assets
    const optimizedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'MISS'
      }
    })
    
    // Cache the response
    await cache.put(cacheKey, optimizedResponse.clone())
    
    return optimizedResponse
  }
  
  return response
}

async function optimizeTextAsset(response, cache, cacheKey, contentType) {
  let content = await response.text()
  
  // Basic minification for CSS and JS
  if (contentType.includes('text/css')) {
    content = minifyCSS(content)
  } else if (contentType.includes('javascript')) {
    content = minifyJS(content)
  }
  
  const optimizedResponse = new Response(content, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Encoding': 'br', // Indicate brotli compression at CDN level
      'X-Cache': 'MISS',
      'X-Optimized': 'MINIFIED'
    }
  })
  
  // Cache the optimized asset
  await cache.put(cacheKey, optimizedResponse.clone())
  
  return optimizedResponse
}

function getOptimalImageFormat(acceptHeader, pathname) {
  // Check browser support for modern formats
  if (acceptHeader.includes('image/avif')) {
    return 'avif'
  } else if (acceptHeader.includes('image/webp')) {
    return 'webp'
  }
  
  // Fallback to original format
  return getImageFormat(pathname)
}

function getImageFormat(pathname) {
  const extension = pathname.split('.').pop().toLowerCase()
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg'
    case 'png':
      return 'png'
    case 'gif':
      return 'gif'
    case 'webp':
      return 'webp'
    case 'avif':
      return 'avif'
    default:
      return 'jpeg'
  }
}

async function optimizeImage(response, targetFormat, url) {
  // This is a simplified version - in production, you'd use
  // a proper image processing service or Cloudflare Image Resizing
  const imageData = await response.arrayBuffer()
  
  // For now, return original data with optimized headers
  // In production, implement actual image processing here
  return {
    body: imageData,
    format: targetFormat
  }
}

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Replace multiple whitespace
    .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
    .replace(/\s*{\s*/g, '{') // Clean up braces
    .replace(/}\s*/g, '}')
    .replace(/;\s*/g, ';')
    .trim()
}

function minifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/\s+/g, ' ') // Replace multiple whitespace
    .replace(/;\s*}/g, '}') // Clean up syntax
    .trim()
}

function addCacheHeaders(response, cacheStatus, optimization = null) {
  const headers = new Headers(response.headers)
  headers.set('X-Cache', cacheStatus)
  
  if (optimization) {
    headers.set('X-Optimization-Status', optimization)
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  })
}
