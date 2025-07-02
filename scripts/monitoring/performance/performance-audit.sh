#!/bin/bash
# Task 6.6.4: CDN Integration & Performance Optimization
# Automated Performance Auditing and Reporting

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_FILE="/var/log/performance-audit.log"
REPORT_DIR="${REPORT_DIR:-$PROJECT_ROOT/reports/performance}"

# Audit configuration
TARGET_URL="${TARGET_URL:-https://pfm-community.app}"
LIGHTHOUSE_CONFIG="${LIGHTHOUSE_CONFIG:-mobile}"
PAGES_TO_AUDIT="${PAGES_TO_AUDIT:-/,/admin,/member,/api/communities/public}"
CONCURRENT_AUDITS="${CONCURRENT_AUDITS:-3}"
TIMEOUT="${TIMEOUT:-120}"

# Performance thresholds
PERFORMANCE_THRESHOLD="${PERFORMANCE_THRESHOLD:-90}"
ACCESSIBILITY_THRESHOLD="${ACCESSIBILITY_THRESHOLD:-95}"
SEO_THRESHOLD="${SEO_THRESHOLD:-90}"
BEST_PRACTICES_THRESHOLD="${BEST_PRACTICES_THRESHOLD:-90}"

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
    log "Checking performance audit dependencies..."
    
    local missing_deps=()
    
    # Check for required tools
    command -v lighthouse >/dev/null 2>&1 || missing_deps+=("lighthouse")
    command -v curl >/dev/null 2>&1 || missing_deps+=("curl")
    command -v jq >/dev/null 2>&1 || missing_deps+=("jq")
    command -v bc >/dev/null 2>&1 || missing_deps+=("bc")
    
    # Optional tools
    if ! command -v pagespeed >/dev/null 2>&1; then
        warning "PageSpeed Insights CLI not found - will skip PSI analysis"
    fi
    
    if ! command -v webpagetest >/dev/null 2>&1; then
        warning "WebPageTest CLI not found - will skip WPT analysis"
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error "Missing required dependencies: ${missing_deps[*]}"
        error "Install with: npm install -g lighthouse @lhci/cli"
        exit 1
    fi
    
    success "Dependencies check complete"
}

# Setup report directory
setup_report_directory() {
    log "Setting up report directory: $REPORT_DIR"
    
    mkdir -p "$REPORT_DIR"/{lighthouse,pagespeed,webpagetest,summary}
    mkdir -p "$REPORT_DIR/history"
    
    success "Report directory ready"
}

# Run Lighthouse audit
run_lighthouse_audit() {
    local url="$1"
    local page_name="$2"
    local config="$3"
    
    log "Running Lighthouse audit for $page_name ($url)"
    
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local report_file="$REPORT_DIR/lighthouse/${page_name}_${config}_${timestamp}"
    
    # Lighthouse command with comprehensive flags
    local lighthouse_cmd=(
        lighthouse
        "$url"
        --output=json,html
        --output-path="$report_file"
        --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"
        --timeout="$TIMEOUT"000
        --max-wait-for-load=45000
        --enable-error-reporting
    )
    
    # Add configuration-specific flags
    case "$config" in
        "mobile")
            lighthouse_cmd+=(
                --preset=perf
                --form-factor=mobile
                --throttling-method=devtools
                --throttling.cpuSlowdownMultiplier=4
                --throttling.requestLatencyMs=150
                --throttling.downloadThroughputKbps=1638.4
                --throttling.uploadThroughputKbps=750
            )
            ;;
        "desktop")
            lighthouse_cmd+=(
                --preset=perf
                --form-factor=desktop
                --throttling-method=devtools
                --throttling.cpuSlowdownMultiplier=1
                --throttling.requestLatencyMs=40
                --throttling.downloadThroughputKbps=10485.76
                --throttling.uploadThroughputKbps=10485.76
            )
            ;;
        "3g")
            lighthouse_cmd+=(
                --preset=perf
                --form-factor=mobile
                --throttling-method=simulate
                --throttling.cpuSlowdownMultiplier=4
                --throttling.requestLatencyMs=300
                --throttling.downloadThroughputKbps=1000
                --throttling.uploadThroughputKbps=1000
            )
            ;;
    esac
    
    # Run Lighthouse
    if "${lighthouse_cmd[@]}" 2>/dev/null; then
        local json_report="${report_file}.report.json"
        
        if [[ -f "$json_report" ]]; then
            # Extract key metrics
            local performance accessibility seo best_practices
            performance=$(jq -r '.categories.performance.score * 100' "$json_report" 2>/dev/null || echo "0")
            accessibility=$(jq -r '.categories.accessibility.score * 100' "$json_report" 2>/dev/null || echo "0")
            seo=$(jq -r '.categories.seo.score * 100' "$json_report" 2>/dev/null || echo "0")
            best_practices=$(jq -r '.categories."best-practices".score * 100' "$json_report" 2>/dev/null || echo "0")
            
            # Extract Core Web Vitals
            local lcp fid cls fcp si tti
            lcp=$(jq -r '.audits."largest-contentful-paint".numericValue' "$json_report" 2>/dev/null || echo "0")
            fid=$(jq -r '.audits."max-potential-fid".numericValue' "$json_report" 2>/dev/null || echo "0")
            cls=$(jq -r '.audits."cumulative-layout-shift".numericValue' "$json_report" 2>/dev/null || echo "0")
            fcp=$(jq -r '.audits."first-contentful-paint".numericValue' "$json_report" 2>/dev/null || echo "0")
            si=$(jq -r '.audits."speed-index".numericValue' "$json_report" 2>/dev/null || echo "0")
            tti=$(jq -r '.audits.interactive.numericValue' "$json_report" 2>/dev/null || echo "0")
            
            # Log results
            success "Lighthouse audit completed for $page_name"
            log "  Performance: ${performance}% | Accessibility: ${accessibility}% | SEO: ${seo}% | Best Practices: ${best_practices}%"
            log "  LCP: ${lcp}ms | FID: ${fid}ms | CLS: ${cls} | FCP: ${fcp}ms | SI: ${si}ms | TTI: ${tti}ms"
            
            # Check thresholds
            check_thresholds "$page_name" "$performance" "$accessibility" "$seo" "$best_practices"
            
            # Store results for summary
            echo "$page_name,$config,$performance,$accessibility,$seo,$best_practices,$lcp,$fid,$cls,$fcp,$si,$tti,$timestamp" >> "$REPORT_DIR/summary/lighthouse_results.csv"
            
            return 0
        else
            error "Lighthouse report not generated for $page_name"
            return 1
        fi
    else
        error "Lighthouse audit failed for $page_name"
        return 1
    fi
}

# Check performance thresholds
check_thresholds() {
    local page_name="$1"
    local performance="$2"
    local accessibility="$3"
    local seo="$4"
    local best_practices="$5"
    
    local issues=()
    
    if (( $(echo "$performance < $PERFORMANCE_THRESHOLD" | bc -l) )); then
        issues+=("Performance: ${performance}% < ${PERFORMANCE_THRESHOLD}%")
    fi
    
    if (( $(echo "$accessibility < $ACCESSIBILITY_THRESHOLD" | bc -l) )); then
        issues+=("Accessibility: ${accessibility}% < ${ACCESSIBILITY_THRESHOLD}%")
    fi
    
    if (( $(echo "$seo < $SEO_THRESHOLD" | bc -l) )); then
        issues+=("SEO: ${seo}% < ${SEO_THRESHOLD}%")
    fi
    
    if (( $(echo "$best_practices < $BEST_PRACTICES_THRESHOLD" | bc -l) )); then
        issues+=("Best Practices: ${best_practices}% < ${BEST_PRACTICES_THRESHOLD}%")
    fi
    
    if [[ ${#issues[@]} -gt 0 ]]; then
        warning "Threshold violations for $page_name:"
        for issue in "${issues[@]}"; do
            warning "  $issue"
        done
    else
        success "All thresholds met for $page_name"
    fi
}

# Run PageSpeed Insights audit
run_pagespeed_audit() {
    local url="$1"
    local page_name="$2"
    
    if ! command -v pagespeed >/dev/null 2>&1; then
        return 0
    fi
    
    log "Running PageSpeed Insights audit for $page_name"
    
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local report_file="$REPORT_DIR/pagespeed/${page_name}_${timestamp}.json"
    
    # Run both mobile and desktop audits
    for strategy in mobile desktop; do
        local strategy_report="${report_file%.json}_${strategy}.json"
        
        if pagespeed url "$url" --strategy="$strategy" --format=json > "$strategy_report" 2>/dev/null; then
            local score
            score=$(jq -r '.lighthouseResult.categories.performance.score * 100' "$strategy_report" 2>/dev/null || echo "0")
            
            success "PageSpeed Insights ($strategy) for $page_name: ${score}%"
        else
            warning "PageSpeed Insights ($strategy) failed for $page_name"
        fi
    done
}

# Run Core Web Vitals check
check_core_web_vitals() {
    local url="$1"
    local page_name="$2"
    
    log "Checking Core Web Vitals for $page_name"
    
    # Use Chrome DevTools Protocol to get real metrics
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local report_file="$REPORT_DIR/webvitals/${page_name}_${timestamp}.json"
    
    # Create a simple script to collect CWV
    cat > /tmp/cwv_check.js << 'EOJS'
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Emulate mobile device
    await page.emulate({
        name: 'Custom Mobile',
        userAgent: 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 X Build/MRA58N) AppleWebKit/537.36',
        viewport: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true }
    });
    
    // Navigate to the page
    await page.goto(process.argv[2], { waitUntil: 'networkidle0' });
    
    // Wait for any delayed content
    await page.waitForTimeout(3000);
    
    // Get Core Web Vitals
    const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
            const metrics = {};
            
            // LCP
            if ('PerformanceObserver' in window) {
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    if (entries.length > 0) {
                        metrics.lcp = entries[entries.length - 1].startTime;
                    }
                }).observe({ entryTypes: ['largest-contentful-paint'] });
                
                // CLS
                let clsValue = 0;
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    metrics.cls = clsValue;
                }).observe({ entryTypes: ['layout-shift'] });
            }
            
            // FCP
            const paintEntries = performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
                metrics.fcp = fcpEntry.startTime;
            }
            
            // Navigation timing
            const navEntry = performance.getEntriesByType('navigation')[0];
            if (navEntry) {
                metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
                metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
                metrics.loadComplete = navEntry.loadEventEnd - navEntry.loadEventStart;
            }
            
            setTimeout(() => resolve(metrics), 2000);
        });
    });
    
    console.log(JSON.stringify(metrics, null, 2));
    
    await browser.close();
})();
EOJS

    # Run the script if puppeteer is available
    if command -v node >/dev/null 2>&1 && node -e "require('puppeteer')" 2>/dev/null; then
        if node /tmp/cwv_check.js "$url" > "$report_file" 2>/dev/null; then
            local lcp fcp cls ttfb
            lcp=$(jq -r '.lcp // 0' "$report_file" 2>/dev/null)
            fcp=$(jq -r '.fcp // 0' "$report_file" 2>/dev/null)
            cls=$(jq -r '.cls // 0' "$report_file" 2>/dev/null)
            ttfb=$(jq -r '.ttfb // 0' "$report_file" 2>/dev/null)
            
            success "Core Web Vitals for $page_name: LCP=${lcp}ms, FCP=${fcp}ms, CLS=${cls}, TTFB=${ttfb}ms"
        else
            warning "Core Web Vitals check failed for $page_name"
        fi
    else
        log "Puppeteer not available, skipping direct CWV measurement"
    fi
    
    rm -f /tmp/cwv_check.js
}

# Generate comprehensive report
generate_summary_report() {
    log "Generating performance audit summary report..."
    
    local timestamp
    timestamp=$(date +%Y%m%d_%H%M%S)
    local summary_file="$REPORT_DIR/summary/performance_audit_${timestamp}.json"
    local csv_file="$REPORT_DIR/summary/lighthouse_results.csv"
    
    if [[ ! -f "$csv_file" ]]; then
        warning "No Lighthouse results found for summary"
        return 1
    fi
    
    # Calculate averages and generate summary
    local total_pages avg_performance avg_accessibility avg_seo avg_best_practices
    total_pages=$(tail -n +2 "$csv_file" | wc -l)
    
    if [[ $total_pages -gt 0 ]]; then
        avg_performance=$(tail -n +2 "$csv_file" | cut -d, -f3 | awk '{sum+=$1} END {print sum/NR}')
        avg_accessibility=$(tail -n +2 "$csv_file" | cut -d, -f4 | awk '{sum+=$1} END {print sum/NR}')
        avg_seo=$(tail -n +2 "$csv_file" | cut -d, -f5 | awk '{sum+=$1} END {print sum/NR}')
        avg_best_practices=$(tail -n +2 "$csv_file" | cut -d, -f6 | awk '{sum+=$1} END {print sum/NR}')
        
        # Generate JSON summary
        cat > "$summary_file" << EOF
{
  "audit_summary": {
    "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
    "total_pages_audited": $total_pages,
    "target_url": "$TARGET_URL",
    "lighthouse_config": "$LIGHTHOUSE_CONFIG",
    "average_scores": {
      "performance": $avg_performance,
      "accessibility": $avg_accessibility,
      "seo": $avg_seo,
      "best_practices": $avg_best_practices
    },
    "thresholds": {
      "performance": $PERFORMANCE_THRESHOLD,
      "accessibility": $ACCESSIBILITY_THRESHOLD,
      "seo": $SEO_THRESHOLD,
      "best_practices": $BEST_PRACTICES_THRESHOLD
    },
    "threshold_compliance": {
      "performance": $(echo "$avg_performance >= $PERFORMANCE_THRESHOLD" | bc -l),
      "accessibility": $(echo "$avg_accessibility >= $ACCESSIBILITY_THRESHOLD" | bc -l),
      "seo": $(echo "$avg_seo >= $SEO_THRESHOLD" | bc -l),
      "best_practices": $(echo "$avg_best_practices >= $BEST_PRACTICES_THRESHOLD" | bc -l)
    }
  },
  "recommendations": []
}
