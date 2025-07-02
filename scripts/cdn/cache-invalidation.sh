#!/bin/bash
# Task 6.6.4: CDN Integration & Performance Optimization
# CDN Cache Invalidation and Purging Automation

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="/var/log/cdn-cache-invalidation.log"

# CDN Configuration
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"
CLOUDFLARE_API_URL="https://api.cloudflare.com/client/v4"

# Cache invalidation settings
DEFAULT_PATTERNS=("*.html" "/sw.js" "/manifest.json" "/api/public/*")
BATCH_SIZE="${BATCH_SIZE:-30}"  # Cloudflare limit is 30 URLs per request
MAX_RETRIES="${MAX_RETRIES:-3}"
RETRY_DELAY="${RETRY_DELAY:-5}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check configuration
check_config() {
    log "Checking CDN configuration..."
    
    if [[ -z "$CLOUDFLARE_API_TOKEN" ]]; then
        error "CLOUDFLARE_API_TOKEN environment variable is required"
    fi
    
    if [[ -z "$CLOUDFLARE_ZONE_ID" ]]; then
        error "CLOUDFLARE_ZONE_ID environment variable is required"
    fi
    
    # Check if curl is available
    if ! command -v curl >/dev/null 2>&1; then
        error "curl is required but not installed"
    fi
    
    # Check if jq is available
    if ! command -v jq >/dev/null 2>&1; then
        error "jq is required but not installed"
    fi
    
    success "Configuration check passed"
}

# Test API connectivity
test_api_connection() {
    log "Testing Cloudflare API connectivity..."
    
    local response
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        "$CLOUDFLARE_API_URL/zones/$CLOUDFLARE_ZONE_ID" \
        -o /tmp/cf_test_response.json)
    
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        local zone_name
        zone_name=$(jq -r '.result.name' /tmp/cf_test_response.json 2>/dev/null || echo "unknown")
        success "Connected to Cloudflare API - Zone: $zone_name"
        rm -f /tmp/cf_test_response.json
        return 0
    else
        local error_msg
        error_msg=$(jq -r '.errors[0].message // "Unknown error"' /tmp/cf_test_response.json 2>/dev/null || echo "API connection failed")
        error "API connection failed (HTTP $http_code): $error_msg"
        rm -f /tmp/cf_test_response.json
        return 1
    fi
}

# Purge cache by URLs
purge_urls() {
    local urls=("$@")
    
    if [[ ${#urls[@]} -eq 0 ]]; then
        warning "No URLs provided for purging"
        return 0
    fi
    
    log "Purging ${#urls[@]} URLs from cache..."
    
    # Split URLs into batches
    local batch=()
    local batch_count=0
    
    for url in "${urls[@]}"; do
        batch+=("\"$url\"")
        
        if [[ ${#batch[@]} -eq $BATCH_SIZE ]]; then
            purge_batch "${batch[@]}"
            ((batch_count++))
            batch=()
        fi
    done
    
    # Purge remaining URLs in final batch
    if [[ ${#batch[@]} -gt 0 ]]; then
        purge_batch "${batch[@]}"
        ((batch_count++))
    fi
    
    success "Completed purging $batch_count batches"
}

# Purge a batch of URLs
purge_batch() {
    local urls=("$@")
    local attempt=0
    
    log "Purging batch of ${#urls[@]} URLs..."
    
    while [[ $attempt -lt $MAX_RETRIES ]]; do
        ((attempt++))
        
        # Build JSON payload
        local json_urls
        json_urls=$(IFS=','; echo "${urls[*]}")
        local payload="{\"files\": [$json_urls]}"
        
        # Make API request
        local response
        response=$(curl -s -w "%{http_code}" \
            -X POST \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$payload" \
            "$CLOUDFLARE_API_URL/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
            -o /tmp/cf_purge_response.json)
        
        local http_code="${response: -3}"
        
        if [[ "$http_code" == "200" ]]; then
            local success_status
            success_status=$(jq -r '.success' /tmp/cf_purge_response.json 2>/dev/null || echo "false")
            
            if [[ "$success_status" == "true" ]]; then
                local purge_id
                purge_id=$(jq -r '.result.id // "unknown"' /tmp/cf_purge_response.json 2>/dev/null)
                success "Batch purged successfully (ID: $purge_id)"
                rm -f /tmp/cf_purge_response.json
                return 0
            else
                local error_msg
                error_msg=$(jq -r '.errors[0].message // "Unknown error"' /tmp/cf_purge_response.json 2>/dev/null)
                warning "Purge failed (attempt $attempt/$MAX_RETRIES): $error_msg"
            fi
        else
            warning "HTTP error $http_code (attempt $attempt/$MAX_RETRIES)"
        fi
        
        if [[ $attempt -lt $MAX_RETRIES ]]; then
            log "Retrying in $RETRY_DELAY seconds..."
            sleep $RETRY_DELAY
        fi
    done
    
    error "Failed to purge batch after $MAX_RETRIES attempts"
    rm -f /tmp/cf_purge_response.json
    return 1
}

# Purge everything
purge_all() {
    log "Purging all cache..."
    
    local payload='{"purge_everything": true}'
    local response
    
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$CLOUDFLARE_API_URL/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -o /tmp/cf_purge_all_response.json)
    
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        local success_status
        success_status=$(jq -r '.success' /tmp/cf_purge_all_response.json 2>/dev/null || echo "false")
        
        if [[ "$success_status" == "true" ]]; then
            local purge_id
            purge_id=$(jq -r '.result.id // "unknown"' /tmp/cf_purge_all_response.json 2>/dev/null)
            success "All cache purged successfully (ID: $purge_id)"
            rm -f /tmp/cf_purge_all_response.json
            return 0
        else
            local error_msg
            error_msg=$(jq -r '.errors[0].message // "Unknown error"' /tmp/cf_purge_all_response.json 2>/dev/null)
            error "Purge all failed: $error_msg"
        fi
    else
        error "HTTP error $http_code during purge all"
    fi
    
    rm -f /tmp/cf_purge_all_response.json
    return 1
}

# Purge by tags
purge_tags() {
    local tags=("$@")
    
    if [[ ${#tags[@]} -eq 0 ]]; then
        warning "No tags provided for purging"
        return 0
    fi
    
    log "Purging cache by tags: ${tags[*]}"
    
    # Build JSON payload
    local json_tags
    json_tags=$(printf '"%s",' "${tags[@]}")
    json_tags="[${json_tags%,}]"  # Remove trailing comma and wrap in brackets
    local payload="{\"tags\": $json_tags}"
    
    local response
    response=$(curl -s -w "%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$CLOUDFLARE_API_URL/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -o /tmp/cf_purge_tags_response.json)
    
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        local success_status
        success_status=$(jq -r '.success' /tmp/cf_purge_tags_response.json 2>/dev/null || echo "false")
        
        if [[ "$success_status" == "true" ]]; then
            local purge_id
            purge_id=$(jq -r '.result.id // "unknown"' /tmp/cf_purge_tags_response.json 2>/dev/null)
            success "Tags purged successfully (ID: $purge_id)"
            rm -f /tmp/cf_purge_tags_response.json
            return 0
        else
            local error_msg
            error_msg=$(jq -r '.errors[0].message // "Unknown error"' /tmp/cf_purge_tags_response.json 2>/dev/null)
            error "Tag purge failed: $error_msg"
        fi
    else
        error "HTTP error $http_code during tag purge"
    fi
    
    rm -f /tmp/cf_purge_tags_response.json
    return 1
}

# Get cache analytics
get_cache_analytics() {
    log "Fetching cache analytics..."
    
    local since_date
    since_date=$(date -u -d '24 hours ago' '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -j -v-24H '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null)
    
    local response
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        "$CLOUDFLARE_API_URL/zones/$CLOUDFLARE_ZONE_ID/analytics/colos?since=$since_date" \
        -o /tmp/cf_analytics_response.json)
    
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        local success_status
        success_status=$(jq -r '.success' /tmp/cf_analytics_response.json 2>/dev/null || echo "false")
        
        if [[ "$success_status" == "true" ]]; then
            # Extract key metrics
            local cached_requests cached_bandwidth hit_ratio
            cached_requests=$(jq -r '.result[0].cached.requests // 0' /tmp/cf_analytics_response.json 2>/dev/null)
            cached_bandwidth=$(jq -r '.result[0].cached.bandwidth // 0' /tmp/cf_analytics_response.json 2>/dev/null)
            
            # Calculate hit ratio
            local total_requests uncached_requests
            total_requests=$(jq -r '(.result[0].cached.requests // 0) + (.result[0].uncached.requests // 0)' /tmp/cf_analytics_response.json 2>/dev/null)
            
            if [[ $total_requests -gt 0 ]]; then
                hit_ratio=$(echo "scale=2; $cached_requests * 100 / $total_requests" | bc 2>/dev/null || echo "0")
            else
                hit_ratio="0"
            fi
            
            success "Cache Analytics (24h):"
            log "  Cached Requests: $cached_requests"
            log "  Cached Bandwidth: $(format_bytes $cached_bandwidth)"
            log "  Cache Hit Ratio: ${hit_ratio}%"
        else
            warning "Failed to fetch analytics"
        fi
    else
        warning "HTTP error $http_code when fetching analytics"
    fi
    
    rm -f /tmp/cf_analytics_response.json
}

# Format bytes for display
format_bytes() {
    local bytes=$1
    if [[ $bytes -gt 1073741824 ]]; then
        echo "$(( bytes / 1073741824 ))GB"
    elif [[ $bytes -gt 1048576 ]]; then
        echo "$(( bytes / 1048576 ))MB"
    elif [[ $bytes -gt 1024 ]]; then
        echo "$(( bytes / 1024 ))KB"
    else
        echo "${bytes}B"
    fi
}

# Main function
main() {
    check_config
    test_api_connection
    
    case "${1:-default}" in
        "urls")
            shift
            if [[ $# -eq 0 ]]; then
                error "No URLs provided. Usage: $0 urls <url1> [url2] ..."
            fi
            purge_urls "$@"
            ;;
        "patterns")
            shift
            if [[ $# -eq 0 ]]; then
                log "No patterns provided, using default patterns"
                purge_urls "${DEFAULT_PATTERNS[@]}"
            else
                purge_urls "$@"
            fi
            ;;
        "tags")
            shift
            if [[ $# -eq 0 ]]; then
                error "No tags provided. Usage: $0 tags <tag1> [tag2] ..."
            fi
            purge_tags "$@"
            ;;
        "all"|"everything")
            purge_all
            ;;
        "analytics")
            get_cache_analytics
            ;;
        "default")
            log "Running default cache invalidation..."
            purge_urls "${DEFAULT_PATTERNS[@]}"
            ;;
        "help"|"--help")
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  urls <url1> [url2] ...     Purge specific URLs"
            echo "  patterns [pattern1] ...    Purge by patterns (default: *.html, /sw.js, /manifest.json, /api/public/*)"
            echo "  tags <tag1> [tag2] ...     Purge by cache tags"
            echo "  all|everything             Purge all cache"
            echo "  analytics                  Show cache analytics"
            echo "  default                    Run default purge (patterns)"
            echo "  help                       Show this help"
            echo ""
            echo "Environment variables:"
            echo "  CLOUDFLARE_API_TOKEN       Cloudflare API token (required)"
            echo "  CLOUDFLARE_ZONE_ID         Cloudflare zone ID (required)"
            echo "  BATCH_SIZE                 URLs per batch (default: 30)"
            echo "  MAX_RETRIES                Max retry attempts (default: 3)"
            echo "  RETRY_DELAY                Delay between retries in seconds (default: 5)"
            exit 0
            ;;
        *)
            error "Unknown command: $1. Use --help for usage information."
            ;;
    esac
}

# Run main function with all arguments
main "$@"
