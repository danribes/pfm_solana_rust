#!/bin/bash
# Task 6.6.4: CDN Integration & Performance Optimization
# Asset Optimization Pipeline for Production Builds

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BUILD_DIR="${BUILD_DIR:-$PROJECT_ROOT/dist}"
ASSETS_DIR="${BUILD_DIR}/assets"
LOG_FILE="/var/log/asset-optimization.log"

# Asset optimization settings
IMAGE_QUALITY="${IMAGE_QUALITY:-85}"
WEBP_QUALITY="${WEBP_QUALITY:-80}"
AVIF_QUALITY="${AVIF_QUALITY:-75}"
JS_MINIFY="${JS_MINIFY:-true}"
CSS_MINIFY="${CSS_MINIFY:-true}"
GZIP_COMPRESSION="${GZIP_COMPRESSION:-true}"
BROTLI_COMPRESSION="${BROTLI_COMPRESSION:-true}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check dependencies
check_dependencies() {
    log "Checking required dependencies..."
    
    local missing_deps=()
    
    # Check for image optimization tools
    command -v convert >/dev/null 2>&1 || missing_deps+=("imagemagick")
    command -v cwebp >/dev/null 2>&1 || missing_deps+=("webp")
    command -v avifenc >/dev/null 2>&1 || missing_deps+=("libavif-tools")
    
    # Check for compression tools
    command -v gzip >/dev/null 2>&1 || missing_deps+=("gzip")
    command -v brotli >/dev/null 2>&1 || missing_deps+=("brotli")
    
    # Check for minification tools
    command -v terser >/dev/null 2>&1 || missing_deps+=("terser")
    command -v cleancss >/dev/null 2>&1 || missing_deps+=("clean-css-cli")
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error "Missing dependencies: ${missing_deps[*]}. Please install them first."
    fi
    
    success "All dependencies available"
}

# Create directory structure
setup_directories() {
    log "Setting up optimization directories..."
    
    mkdir -p "$BUILD_DIR"/{images,css,js,fonts,optimized}
    mkdir -p "$BUILD_DIR/optimized"/{webp,avif,compressed}
    
    success "Directories created"
}

# Optimize images
optimize_images() {
    log "Starting image optimization..."
    
    local image_count=0
    local optimized_count=0
    local total_savings=0
    
    # Find all images
    local image_files
    mapfile -t image_files < <(find "$BUILD_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" \) 2>/dev/null || true)
    
    if [[ ${#image_files[@]} -eq 0 ]]; then
        warning "No images found for optimization"
        return 0
    fi
    
    log "Found ${#image_files[@]} images to optimize"
    
    for image_file in "${image_files[@]}"; do
        ((image_count++))
        
        local original_size
        original_size=$(stat -f%z "$image_file" 2>/dev/null || stat -c%s "$image_file" 2>/dev/null || echo "0")
        
        log "Optimizing image: $(basename "$image_file")"
        
        # Optimize original format
        if optimize_single_image "$image_file"; then
            ((optimized_count++))
            
            local new_size
            new_size=$(stat -f%z "$image_file" 2>/dev/null || stat -c%s "$image_file" 2>/dev/null || echo "0")
            local savings=$((original_size - new_size))
            total_savings=$((total_savings + savings))
        fi
        
        # Generate WebP version
        generate_webp "$image_file"
        
        # Generate AVIF version (if tools available)
        if command -v avifenc >/dev/null 2>&1; then
            generate_avif "$image_file"
        fi
    done
    
    log "Image optimization complete: $optimized_count/$image_count images optimized"
    log "Total space saved: $(format_bytes $total_savings)"
}

# Optimize single image
optimize_single_image() {
    local image_file="$1"
    local temp_file="${image_file}.tmp"
    
    case "${image_file,,}" in
        *.jpg|*.jpeg)
            convert "$image_file" -quality "$IMAGE_QUALITY" -strip "$temp_file" 2>/dev/null || return 1
            ;;
        *.png)
            convert "$image_file" -quality "$IMAGE_QUALITY" -strip "$temp_file" 2>/dev/null || return 1
            ;;
        *.gif)
            convert "$image_file" -coalesce -strip "$temp_file" 2>/dev/null || return 1
            ;;
        *)
            return 1
            ;;
    esac
    
    if [[ -f "$temp_file" ]]; then
        mv "$temp_file" "$image_file"
        return 0
    fi
    
    return 1
}

# Generate WebP version
generate_webp() {
    local image_file="$1"
    local webp_file="${image_file%.*}.webp"
    local webp_dir="$(dirname "$image_file")"
    
    if [[ ! -f "$webp_file" ]]; then
        cwebp -q "$WEBP_QUALITY" "$image_file" -o "$webp_file" >/dev/null 2>&1 || {
            warning "Failed to generate WebP for $(basename "$image_file")"
            return 1
        }
        log "Generated WebP: $(basename "$webp_file")"
    fi
}

# Generate AVIF version
generate_avif() {
    local image_file="$1"
    local avif_file="${image_file%.*}.avif"
    
    if [[ ! -f "$avif_file" ]]; then
        avifenc -q "$AVIF_QUALITY" "$image_file" "$avif_file" >/dev/null 2>&1 || {
            warning "Failed to generate AVIF for $(basename "$image_file")"
            return 1
        }
        log "Generated AVIF: $(basename "$avif_file")"
    fi
}

# Optimize CSS files
optimize_css() {
    log "Starting CSS optimization..."
    
    local css_files
    mapfile -t css_files < <(find "$BUILD_DIR" -name "*.css" -not -path "*/node_modules/*" 2>/dev/null || true)
    
    if [[ ${#css_files[@]} -eq 0 ]]; then
        warning "No CSS files found for optimization"
        return 0
    fi
    
    log "Found ${#css_files[@]} CSS files to optimize"
    
    for css_file in "${css_files[@]}"; do
        if [[ "$CSS_MINIFY" == "true" ]]; then
            log "Minifying CSS: $(basename "$css_file")"
            
            local original_size
            original_size=$(stat -f%z "$css_file" 2>/dev/null || stat -c%s "$css_file" 2>/dev/null || echo "0")
            
            cleancss -o "${css_file}.min" "$css_file" 2>/dev/null || {
                warning "Failed to minify $(basename "$css_file")"
                continue
            }
            
            # Replace original with minified version
            mv "${css_file}.min" "$css_file"
            
            local new_size
            new_size=$(stat -f%z "$css_file" 2>/dev/null || stat -c%s "$css_file" 2>/dev/null || echo "0")
            local savings=$((original_size - new_size))
            
            log "CSS minified: $(basename "$css_file") - saved $(format_bytes $savings)"
        fi
        
        # Generate compressed versions
        compress_file "$css_file"
    done
    
    success "CSS optimization complete"
}

# Optimize JavaScript files
optimize_js() {
    log "Starting JavaScript optimization..."
    
    local js_files
    mapfile -t js_files < <(find "$BUILD_DIR" -name "*.js" -not -path "*/node_modules/*" -not -name "*.min.js" 2>/dev/null || true)
    
    if [[ ${#js_files[@]} -eq 0 ]]; then
        warning "No JavaScript files found for optimization"
        return 0
    fi
    
    log "Found ${#js_files[@]} JavaScript files to optimize"
    
    for js_file in "${js_files[@]}"; do
        if [[ "$JS_MINIFY" == "true" ]]; then
            log "Minifying JavaScript: $(basename "$js_file")"
            
            local original_size
            original_size=$(stat -f%z "$js_file" 2>/dev/null || stat -c%s "$js_file" 2>/dev/null || echo "0")
            
            terser "$js_file" -o "${js_file}.min" --compress --mangle 2>/dev/null || {
                warning "Failed to minify $(basename "$js_file")"
                continue
            }
            
            # Replace original with minified version
            mv "${js_file}.min" "$js_file"
            
            local new_size
            new_size=$(stat -f%z "$js_file" 2>/dev/null || stat -c%s "$js_file" 2>/dev/null || echo "0")
            local savings=$((original_size - new_size))
            
            log "JavaScript minified: $(basename "$js_file") - saved $(format_bytes $savings)"
        fi
        
        # Generate compressed versions
        compress_file "$js_file"
    done
    
    success "JavaScript optimization complete"
}

# Compress files (gzip and brotli)
compress_file() {
    local file="$1"
    
    # Generate gzip version
    if [[ "$GZIP_COMPRESSION" == "true" ]]; then
        gzip -9 -c "$file" > "${file}.gz" 2>/dev/null || {
            warning "Failed to gzip $(basename "$file")"
        }
    fi
    
    # Generate brotli version
    if [[ "$BROTLI_COMPRESSION" == "true" ]]; then
        brotli -q 11 -o "${file}.br" "$file" 2>/dev/null || {
            warning "Failed to brotli compress $(basename "$file")"
        }
    fi
}

# Generate asset manifest
generate_asset_manifest() {
    log "Generating asset manifest..."
    
    local manifest_file="$BUILD_DIR/asset-manifest.json"
    
    cat > "$manifest_file" << EOF
{
  "generated": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "version": "${ASSET_VERSION:-$(date +%s)}",
  "assets": {
