#!/bin/bash
# Task 6.6.4: CDN Integration & Performance Optimization
# CDN Cache Warming and Preloading System

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="/var/log/cdn-cache-warming.log"

# Cache warming settings
BASE_URL="${BASE_URL:-https://pfm-community.app}"
CONCURRENT_REQUESTS="${CONCURRENT_REQUESTS:-10}"
REQUEST_DELAY="${REQUEST_DELAY:-100}"  # milliseconds
TIMEOUT="${TIMEOUT:-30}"
USER_AGENT="${USER_AGENT:-PFM-CacheWarming/1.0}"
MAX_RETRIES="${MAX_RETRIES:-3}"

# Popular URLs to warm
POPULAR_PAGES=(
    "/"
    "/admin"
    "/member"
    "/about"
    "/privacy"
    "/terms"
    "/api/communities/public"
    "/api/stats/summary"
)

CRITICAL_ASSETS=(
    "/assets/css/main.css"
    "/assets/js/app.js"
    "/assets/js/vendor.js"
    "/assets/images/logo.png"
    "/manifest.json"
    "/sw.js"
)

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

# Check dependencies
check_dependencies() {
    log "Checking dependencies for cache warming..."
    
    if ! command -v curl >/dev/null 2>&1; then
        error "curl is required but not installed"
    fi
    
    if ! command -v xargs >/dev/null 2>&1; then
        error "xargs is required but not installed"
    fi
    
    success "Dependencies check passed"
}

# Test connectivity to base URL
test_connectivity() {
    log "Testing connectivity to $BASE_URL..."
    
    local response
    response=$(curl -s -w "%{http_code}" -I "$BASE_URL" -o /dev/null --max-time "$TIMEOUT" --user-agent "$USER_AGENT") || {
        error "Failed to connect to $BASE_URL"
    }
    
    if [[ "$response" =~ ^[23] ]]; then
        success "Successfully connected to $BASE_URL"
    else
        error "Received HTTP $response from $BASE_URL"
    fi
}

# Warm single URL
warm_url() {
    local url="$1"
    local attempt=0
    local full_url="$BASE_URL$url"
    
    # Handle absolute URLs
    if [[ "$url" =~ ^https?:// ]]; then
        full_url="$url"
    fi
    
    while [[ $attempt -lt $MAX_RETRIES ]]; do
        ((attempt++))
        
        local start_time end_time duration response_code cache_status
        start_time=$(date +%s%3N)
        
        response_code=$(curl -s -w "%{http_code}" \
            --max-time "$TIMEOUT" \
            --user-agent "$USER_AGENT" \
            -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" \
            -H "Accept-Encoding: gzip, deflate, br" \
            -H "Accept-Language: en-US,en;q=0.5" \
            -H "Cache-Control: no-cache" \
            -H "Pragma: no-cache" \
            "$full_url" \
            -o /dev/null 2>/dev/null) || response_code="000"
        
        end_time=$(date +%s%3N)
        duration=$((end_time - start_time))
        
        if [[ "$response_code" =~ ^[23] ]]; then
            # Get cache status if available
            cache_status=$(curl -s -I "$full_url" --max-time "$TIMEOUT" --user-agent "$USER_AGENT" 2>/dev/null | grep -i "x-cache" | cut -d: -f2 | tr -d ' \r' || echo "UNKNOWN")
            
            success "Warmed: $url (${duration}ms, HTTP $response_code, Cache: ${cache_status:-UNKNOWN})"
            return 0
        else
            warning "Failed to warm $url (attempt $attempt/$MAX_RETRIES): HTTP $response_code"
            
            if [[ $attempt -lt $MAX_RETRIES ]]; then
                sleep 1
            fi
        fi
    done
    
    error "Failed to warm $url after $MAX_RETRIES attempts"
    return 1
}

# Warm URLs concurrently
warm_urls_concurrent() {
    local urls=("$@")
    
    if [[ ${#urls[@]} -eq 0 ]]; then
        warning "No URLs provided for warming"
        return 0
    fi
    
    log "Warming ${#urls[@]} URLs with $CONCURRENT_REQUESTS concurrent requests..."
    
    # Create temporary file with URLs
    local temp_file
    temp_file=$(mktemp)
    
    for url in "${urls[@]}"; do
        echo "$url" >> "$temp_file"
    done
    
    # Process URLs in parallel
    if [[ "$REQUEST_DELAY" -gt 0 ]]; then
        # Add delay between requests
        cat "$temp_file" | xargs -I {} -P "$CONCURRENT_REQUESTS" bash -c "
            warm_url '{}' 
            sleep $(echo \"scale=3; $REQUEST_DELAY / 1000\" | bc 2>/dev/null || echo \"0.1\")
        "
    else
        # No delay
        cat "$temp_file" | xargs -I {} -P "$CONCURRENT_REQUESTS" bash -c "warm_url '{}'"
    fi
    
    rm -f "$temp_file"
}

# Export function for xargs
export -f warm_url log success warning error

# Discover URLs from sitemap
discover_sitemap_urls() {
    local sitemap_url="$BASE_URL/sitemap.xml"
    
    log "Discovering URLs from sitemap: $sitemap_url"
    
    local urls
    urls=$(curl -s --max-time "$TIMEOUT" "$sitemap_url" 2>/dev/null | \
           grep -o '<loc>[^<]*</loc>' | \
           sed 's|<loc>||g; s|</loc>||g' || true)
    
    if [[ -n "$urls" ]]; then
        local url_count
        url_count=$(echo "$urls" | wc -l)
        log "Found $url_count URLs in sitemap"
        echo "$urls"
    else
        warning "No URLs found in sitemap or sitemap not available"
    fi
}

# Discover URLs from robots.txt
discover_robots_urls() {
    local robots_url="$BASE_URL/robots.txt"
    
    log "Checking robots.txt for additional sitemaps: $robots_url"
    
    local sitemap_urls
    sitemap_urls=$(curl -s --max-time "$TIMEOUT" "$robots_url" 2>/dev/null | \
                   grep -i "sitemap:" | \
                   awk '{print $2}' || true)
    
    if [[ -n "$sitemap_urls" ]]; then
        while IFS= read -r sitemap_url; do
            log "Processing sitemap from robots.txt: $sitemap_url"
            discover_sitemap_urls_from_url "$sitemap_url"
        done <<< "$sitemap_urls"
    else
        log "No additional sitemaps found in robots.txt"
    fi
}

# Discover URLs from specific sitemap URL
discover_sitemap_urls_from_url() {
    local sitemap_url="$1"
    
    local urls
    urls=$(curl -s --max-time "$TIMEOUT" "$sitemap_url" 2>/dev/null | \
           grep -o '<loc>[^<]*</loc>' | \
           sed 's|<loc>||g; s|</loc>||g' || true)
    
    if [[ -n "$urls" ]]; then
        echo "$urls"
    fi
}

# Generate cache warming report
generate_warming_report() {
    log "Generating cache warming report..."
    
    local report_file="/tmp/cache-warming-report.json"
    local timestamp
    timestamp=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    
    # Test a few URLs to check cache status
    local sample_urls=("/" "/admin" "/api/communities/public")
    local cache_hits=0
    local total_samples=${#sample_urls[@]}
    
    for url in "${sample_urls[@]}"; do
        local cache_status
        cache_status=$(curl -s -I "$BASE_URL$url" --max-time "$TIMEOUT" --user-agent "$USER_AGENT" 2>/dev/null | \
                      grep -i "x-cache" | cut -d: -f2 | tr -d ' \r' | tr '[:lower:]' '[:upper:]' || echo "UNKNOWN")
        
        if [[ "$cache_status" == "HIT"* ]]; then
            ((cache_hits++))
        fi
    done
    
    local cache_hit_rate=0
    if [[ $total_samples -gt 0 ]]; then
        cache_hit_rate=$(echo "scale=2; $cache_hits * 100 / $total_samples" | bc 2>/dev/null || echo "0")
    fi
    
    cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "cache_warming_summary": {
    "base_url": "$BASE_URL",
    "popular_pages_warmed": ${#POPULAR_PAGES[@]},
    "critical_assets_warmed": ${#CRITICAL_ASSETS[@]},
    "cache_hit_rate_sample": "$cache_hit_rate%",
    "sample_size": $total_samples,
    "concurrent_requests": $CONCURRENT_REQUESTS,
    "request_delay_ms": $REQUEST_DELAY
  },
  "warming_settings": {
    "max_retries": $MAX_RETRIES,
    "timeout_seconds": $TIMEOUT,
    "user_agent": "$USER_AGENT"
  }
}
    success "Cache warming report generated: $report_file"
    cat "$report_file"
}

# Warm by category
warm_popular_pages() {
    log "Warming popular pages..."
    warm_urls_concurrent "${POPULAR_PAGES[@]}"
    success "Popular pages warming completed"
}

warm_critical_assets() {
    log "Warming critical assets..."
    warm_urls_concurrent "${CRITICAL_ASSETS[@]}"
    success "Critical assets warming completed"
}

warm_sitemap_urls() {
    log "Warming URLs from sitemap..."
    
    local sitemap_urls
    mapfile -t sitemap_urls < <(discover_sitemap_urls)
    
    if [[ ${#sitemap_urls[@]} -gt 0 ]]; then
        # Convert absolute URLs to relative paths
        local relative_urls=()
        for url in "${sitemap_urls[@]}"; do
            if [[ "$url" =~ ^https?:// ]]; then
                # Extract path from absolute URL
                local path
                path=$(echo "$url" | sed "s|^[^/]*//[^/]*||")
                relative_urls+=("$path")
            else
                relative_urls+=("$url")
            fi
        done
        
        warm_urls_concurrent "${relative_urls[@]}"
        success "Sitemap URLs warming completed"
    else
        warning "No sitemap URLs found to warm"
    fi
}

# Monitor warming progress
monitor_warming() {
    local urls=("$@")
    local total=${#urls[@]}
    local completed=0
    
    log "Monitoring warming progress for $total URLs..."
    
    for url in "${urls[@]}"; do
        warm_url "$url" && ((completed++)) || true
        
        local progress
        progress=$(echo "scale=1; $completed * 100 / $total" | bc 2>/dev/null || echo "0")
        log "Progress: $completed/$total URLs warmed (${progress}%)"
    done
    
    success "Warming monitoring completed: $completed/$total URLs successful"
}

# Main function
main() {
    check_dependencies
    test_connectivity
    
    case "${1:-all}" in
        "popular"|"pages")
            warm_popular_pages
            ;;
        "assets"|"critical")
            warm_critical_assets
            ;;
        "sitemap")
            warm_sitemap_urls
            ;;
        "urls")
            shift
            if [[ $# -eq 0 ]]; then
                error "No URLs provided. Usage: $0 urls <url1> [url2] ..."
            fi
            warm_urls_concurrent "$@"
            ;;
        "monitor")
            shift
            if [[ $# -eq 0 ]]; then
                # Monitor default URLs
                monitor_warming "${POPULAR_PAGES[@]}" "${CRITICAL_ASSETS[@]}"
            else
                monitor_warming "$@"
            fi
            ;;
        "report")
            generate_warming_report
            ;;
        "all")
            log "Running comprehensive cache warming..."
            warm_popular_pages
            warm_critical_assets
            warm_sitemap_urls
            generate_warming_report
            ;;
        "help"|"--help")
            echo "Usage: $0 [command] [options]"
            echo ""
            echo "Commands:"
            echo "  popular|pages              Warm popular pages"
            echo "  assets|critical            Warm critical assets"
            echo "  sitemap                    Warm URLs from sitemap"
            echo "  urls <url1> [url2] ...     Warm specific URLs"
            echo "  monitor [urls]             Monitor warming progress"
            echo "  report                     Generate warming report"
            echo "  all                        Warm all categories (default)"
            echo "  help                       Show this help"
            echo ""
            echo "Environment variables:"
            echo "  BASE_URL                   Base URL for warming (default: https://pfm-community.app)"
            echo "  CONCURRENT_REQUESTS        Number of concurrent requests (default: 10)"
            echo "  REQUEST_DELAY              Delay between requests in ms (default: 100)"
            echo "  TIMEOUT                    Request timeout in seconds (default: 30)"
            echo "  MAX_RETRIES                Max retry attempts (default: 3)"
            exit 0
            ;;
        *)
            error "Unknown command: $1. Use --help for usage information."
            ;;
    esac
}

# Run main function with all arguments
main "$@"
