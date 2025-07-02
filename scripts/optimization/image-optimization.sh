#!/bin/bash
# Task 6.6.4: CDN Integration & Performance Optimization
# Advanced Image Optimization and Format Conversion

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
INPUT_DIR="${INPUT_DIR:-$PROJECT_ROOT/frontend/public/images}"
OUTPUT_DIR="${OUTPUT_DIR:-$PROJECT_ROOT/dist/images}"
LOG_FILE="/var/log/image-optimization.log"

# Image optimization settings
JPEG_QUALITY="${JPEG_QUALITY:-85}"
PNG_QUALITY="${PNG_QUALITY:-85}"
WEBP_QUALITY="${WEBP_QUALITY:-80}"
AVIF_QUALITY="${AVIF_QUALITY:-75}"
RESIZE_WIDTHS="${RESIZE_WIDTHS:-320,640,1024,1920}"
PROGRESSIVE_JPEG="${PROGRESSIVE_JPEG:-true}"
STRIP_METADATA="${STRIP_METADATA:-true}"

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
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check dependencies
check_dependencies() {
    log "Checking image optimization dependencies..."
    
    local missing_deps=()
    
    # Check for required tools
    command -v convert >/dev/null 2>&1 || missing_deps+=("imagemagick")
    command -v identify >/dev/null 2>&1 || missing_deps+=("imagemagick-identify")
    command -v cwebp >/dev/null 2>&1 || missing_deps+=("webp")
    command -v dwebp >/dev/null 2>&1 || missing_deps+=("webp")
    
    # Optional tools
    if ! command -v avifenc >/dev/null 2>&1; then
        warning "avifenc not found - AVIF generation will be skipped"
    fi
    
    if ! command -v oxipng >/dev/null 2>&1; then
        warning "oxipng not found - PNG optimization will use ImageMagick"
    fi
    
    if ! command -v mozjpeg >/dev/null 2>&1; then
        warning "mozjpeg not found - JPEG optimization will use ImageMagick"
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error "Missing required dependencies: ${missing_deps[*]}"
    fi
    
    success "Dependencies check complete"
}

# Setup directories
setup_directories() {
    log "Setting up output directories..."
    
    mkdir -p "$OUTPUT_DIR"/{original,webp,avif,responsive}
    mkdir -p "$OUTPUT_DIR/responsive"/{320,640,1024,1920}
    
    success "Directories created"
}

# Get image information
get_image_info() {
    local image_file="$1"
    local info
    
    info=$(identify -ping -format "%w %h %[type] %[colorspace]" "$image_file" 2>/dev/null) || return 1
    echo "$info"
}

# Optimize JPEG image
optimize_jpeg() {
    local input_file="$1"
    local output_file="$2"
    local quality="$3"
    
    local convert_args=(-quality "$quality")
    
    if [[ "$PROGRESSIVE_JPEG" == "true" ]]; then
        convert_args+=(-interlace Plane)
    fi
    
    if [[ "$STRIP_METADATA" == "true" ]]; then
        convert_args+=(-strip)
    fi
    
    # Use mozjpeg if available, otherwise ImageMagick
    if command -v mozjpeg >/dev/null 2>&1; then
        mozjpeg -quality "$quality" -outfile "$output_file" "$input_file" 2>/dev/null || return 1
    else
        convert "$input_file" "${convert_args[@]}" "$output_file" 2>/dev/null || return 1
    fi
}

# Optimize PNG image
optimize_png() {
    local input_file="$1"
    local output_file="$2"
    
    # Use oxipng if available for better compression
    if command -v oxipng >/dev/null 2>&1; then
        cp "$input_file" "$output_file"
        oxipng -o 6 --strip safe "$output_file" 2>/dev/null || return 1
    else
        local convert_args=(-quality "$PNG_QUALITY")
        
        if [[ "$STRIP_METADATA" == "true" ]]; then
            convert_args+=(-strip)
        fi
        
        convert "$input_file" "${convert_args[@]}" "$output_file" 2>/dev/null || return 1
    fi
}

# Generate WebP version
generate_webp() {
    local input_file="$1"
    local output_file="$2"
    local quality="$3"
    
    cwebp -q "$quality" -m 6 -pass 10 -mt "$input_file" -o "$output_file" 2>/dev/null || return 1
}

# Generate AVIF version
generate_avif() {
    local input_file="$1"
    local output_file="$2"
    local quality="$3"
    
    if command -v avifenc >/dev/null 2>&1; then
        avifenc -q "$quality" -s 6 "$input_file" "$output_file" 2>/dev/null || return 1
    else
        return 1
    fi
}

# Generate responsive sizes
generate_responsive_versions() {
    local input_file="$1"
    local base_name="$2"
    local extension="$3"
    
    local info original_width original_height
    info=$(get_image_info "$input_file") || return 1
    read -r original_width original_height _ _ <<< "$info"
    
    IFS=',' read -ra widths <<< "$RESIZE_WIDTHS"
    
    for width in "${widths[@]}"; do
        # Skip if target width is larger than original
        if [[ $width -gt $original_width ]]; then
            continue
        fi
        
        local output_dir="$OUTPUT_DIR/responsive/$width"
        local output_file="$output_dir/${base_name}${extension}"
        
        log "Generating ${width}px version: $(basename "$output_file")"
        
        # Calculate proportional height
        local height=$((original_height * width / original_width))
        
        # Resize image
        convert "$input_file" -resize "${width}x${height}" "$output_file" 2>/dev/null || {
            warning "Failed to generate ${width}px version of $(basename "$input_file")"
            continue
        }
        
        # Generate WebP and AVIF versions for responsive sizes
        local webp_file="$output_dir/${base_name}.webp"
        local avif_file="$output_dir/${base_name}.avif"
        
        generate_webp "$output_file" "$webp_file" "$WEBP_QUALITY" || true
        generate_avif "$output_file" "$avif_file" "$AVIF_QUALITY" || true
    done
}

# Process single image
process_image() {
    local input_file="$1"
    local base_name output_ext
    
    base_name=$(basename "$input_file" | sed 's/\.[^.]*$//')
    
    local info original_size optimized_size webp_size avif_size
    info=$(get_image_info "$input_file") || {
        warning "Could not get info for $(basename "$input_file")"
        return 1
    }
    
    original_size=$(stat -f%z "$input_file" 2>/dev/null || stat -c%s "$input_file" 2>/dev/null || echo "0")
    
    log "Processing: $(basename "$input_file") ($(format_bytes $original_size))"
    
    # Determine file type and optimize accordingly
    case "${input_file,,}" in
        *.jpg|*.jpeg)
            output_ext=".jpg"
            local optimized_file="$OUTPUT_DIR/original/${base_name}${output_ext}"
            
            if optimize_jpeg "$input_file" "$optimized_file" "$JPEG_QUALITY"; then
                optimized_size=$(stat -f%z "$optimized_file" 2>/dev/null || stat -c%s "$optimized_file" 2>/dev/null || echo "0")
                local savings=$((original_size - optimized_size))
                log "JPEG optimized: saved $(format_bytes $savings)"
            else
                warning "Failed to optimize JPEG: $(basename "$input_file")"
                cp "$input_file" "$optimized_file"
            fi
            ;;
            
        *.png)
            output_ext=".png"
            local optimized_file="$OUTPUT_DIR/original/${base_name}${output_ext}"
            
            if optimize_png "$input_file" "$optimized_file"; then
                optimized_size=$(stat -f%z "$optimized_file" 2>/dev/null || stat -c%s "$optimized_file" 2>/dev/null || echo "0")
                local savings=$((original_size - optimized_size))
                log "PNG optimized: saved $(format_bytes $savings)"
            else
                warning "Failed to optimize PNG: $(basename "$input_file")"
                cp "$input_file" "$optimized_file"
            fi
            ;;
            
        *.gif)
            output_ext=".gif"
            local optimized_file="$OUTPUT_DIR/original/${base_name}${output_ext}"
            
            # GIF optimization is limited, just copy and strip metadata
            convert "$input_file" -strip "$optimized_file" 2>/dev/null || {
                warning "Failed to optimize GIF: $(basename "$input_file")"
                cp "$input_file" "$optimized_file"
            }
            ;;
            
        *)
            warning "Unsupported image format: $(basename "$input_file")"
            return 1
            ;;
    esac
    
    # Generate WebP version
    local webp_file="$OUTPUT_DIR/webp/${base_name}.webp"
    if generate_webp "$input_file" "$webp_file" "$WEBP_QUALITY"; then
        webp_size=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file" 2>/dev/null || echo "0")
        local webp_savings=$((original_size - webp_size))
        log "WebP generated: saved $(format_bytes $webp_savings)"
    else
        warning "Failed to generate WebP for $(basename "$input_file")"
    fi
    
    # Generate AVIF version
    local avif_file="$OUTPUT_DIR/avif/${base_name}.avif"
    if generate_avif "$input_file" "$avif_file" "$AVIF_QUALITY"; then
        avif_size=$(stat -f%z "$avif_file" 2>/dev/null || stat -c%s "$avif_file" 2>/dev/null || echo "0")
        local avif_savings=$((original_size - avif_size))
        log "AVIF generated: saved $(format_bytes $avif_savings)"
    else
        log "AVIF generation skipped for $(basename "$input_file") (tool not available)"
    fi
    
    # Generate responsive versions
    generate_responsive_versions "$input_file" "$base_name" "$output_ext"
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

# Generate optimization report
generate_optimization_report() {
    log "Generating image optimization report..."
    
    local report_file="$OUTPUT_DIR/optimization-report.json"
    local total_original_size=0
    local total_optimized_size=0
    local image_count=0
    
    # Calculate totals
    if [[ -d "$OUTPUT_DIR/original" ]]; then
        while IFS= read -r -d '' file; do
            ((image_count++))
            local size
            size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
            total_optimized_size=$((total_optimized_size + size))
        done < <(find "$OUTPUT_DIR/original" -type f -print0 2>/dev/null)
    fi
    
    # Calculate original size from input directory
    if [[ -d "$INPUT_DIR" ]]; then
        while IFS= read -r -d '' file; do
            local size
            size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
            total_original_size=$((total_original_size + size))
        done < <(find "$INPUT_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" \) -print0 2>/dev/null)
    fi
    
    local total_savings=$((total_original_size - total_optimized_size))
    local savings_percent=0
    if [[ $total_original_size -gt 0 ]]; then
        savings_percent=$((total_savings * 100 / total_original_size))
    fi
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "optimization_summary": {
    "total_images_processed": $image_count,
    "original_total_size": $total_original_size,
    "optimized_total_size": $total_optimized_size,
    "total_savings": $total_savings,
    "savings_percentage": $savings_percent,
    "original_size_formatted": "$(format_bytes $total_original_size)",
    "optimized_size_formatted": "$(format_bytes $total_optimized_size)",
    "savings_formatted": "$(format_bytes $total_savings)"
  },
  "optimization_settings": {
    "jpeg_quality": $JPEG_QUALITY,
    "png_quality": $PNG_QUALITY,
    "webp_quality": $WEBP_QUALITY,
    "avif_quality": $AVIF_QUALITY,
    "progressive_jpeg": $PROGRESSIVE_JPEG,
    "strip_metadata": $STRIP_METADATA,
    "responsive_widths": "$RESIZE_WIDTHS"
  },
  "formats_generated": {
    "webp": true,
    "avif": $(command -v avifenc >/dev/null 2>&1 && echo "true" || echo "false"),
    "responsive_sizes": true
  }
}
