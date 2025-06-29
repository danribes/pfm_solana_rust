// Enhanced Responsive Breakpoints System
// Task 4.6.1 Sub-task 2 - Advanced breakpoint management

export const ENHANCED_BREAKPOINTS = {
  // Mobile breakpoints (320px - 767px)
  mobile: {
    xs: { min: 320, max: 374, label: 'Mobile XS' },      // Very small phones
    sm: { min: 375, max: 414, label: 'Mobile Small' },   // iPhone 6/7/8
    md: { min: 415, max: 480, label: 'Mobile Medium' },  // Large phones
    lg: { min: 481, max: 767, label: 'Mobile Large' }    // Landscape phones
  },
  
  // Tablet breakpoints (768px - 1023px)
  tablet: {
    sm: { min: 768, max: 834, label: 'Tablet Small' },   // iPad Mini
    md: { min: 835, max: 1024, label: 'Tablet Medium' }, // iPad
    lg: { min: 1024, max: 1023, label: 'Tablet Large' }  // iPad Pro 11"
  },
  
  // Desktop breakpoints (1024px - 1439px)
  desktop: {
    sm: { min: 1024, max: 1199, label: 'Desktop Small' }, // Small laptops
    md: { min: 1200, max: 1439, label: 'Desktop Medium' }, // Standard desktops
    lg: { min: 1440, max: 1679, label: 'Desktop Large' }   // Large screens
  },
  
  // Large screen breakpoints (1680px+)
  large: {
    xl: { min: 1680, max: 1919, label: 'Large XL' },      // 1680p screens
    xxl: { min: 1920, max: 2559, label: 'Large XXL' },    // 1080p/1440p
    ultra: { min: 2560, max: 9999, label: 'Ultra Wide' }  // 4K and ultra-wide
  }
} as const;

// Common device specific breakpoints
export const DEVICE_BREAKPOINTS = {
  // Mobile devices
  'iPhone SE': 375,
  'iPhone 12/13/14': 390,
  'iPhone 12/13/14 Pro Max': 428,
  'Samsung Galaxy S20': 360,
  'Google Pixel 5': 393,
  
  // Tablets
  'iPad Mini': 768,
  'iPad': 820,
  'iPad Air': 834,
  'iPad Pro 11"': 834,
  'iPad Pro 12.9"': 1024,
  
  // Desktop
  'MacBook Air': 1440,
  'MacBook Pro 13"': 1440,
  'MacBook Pro 16"': 1728,
  'iMac 24"': 1920,
  'iMac 27"': 2560,
  
  // Common resolutions
  'HD': 1366,
  'Full HD': 1920,
  '1440p': 2560,
  '4K': 3840
} as const;

// Breakpoint utilities with container queries support
export const BREAKPOINT_UTILS = {
  // Generate media queries
  mediaQuery: (minWidth?: number, maxWidth?: number): string => {
    if (minWidth && maxWidth) {
      return `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;
    } else if (minWidth) {
      return `(min-width: ${minWidth}px)`;
    } else if (maxWidth) {
      return `(max-width: ${maxWidth}px)`;
    }
    return '';
  },
  
  // Container queries (modern approach)
  containerQuery: (minWidth?: number, maxWidth?: number): string => {
    if (minWidth && maxWidth) {
      return `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;
    } else if (minWidth) {
      return `(min-width: ${minWidth}px)`;
    } else if (maxWidth) {
      return `(max-width: ${maxWidth}px)`;
    }
    return '';
  },
  
  // Get optimal breakpoint for device
  getOptimalBreakpoint: (width: number): string => {
    // Find the closest device breakpoint
    const deviceEntries = Object.entries(DEVICE_BREAKPOINTS);
    const closest = deviceEntries.reduce((prev, curr) => {
      return Math.abs(curr[1] - width) < Math.abs(prev[1] - width) ? curr : prev;
    });
    
    return closest[0];
  },
  
  // Determine breakpoint category
  getBreakpointCategory: (width: number): {
    category: keyof typeof ENHANCED_BREAKPOINTS;
    subcategory: string;
    label: string;
  } => {
    for (const [category, subcategories] of Object.entries(ENHANCED_BREAKPOINTS)) {
      for (const [subcat, config] of Object.entries(subcategories)) {
        if (width >= config.min && width <= config.max) {
          return {
            category: category as keyof typeof ENHANCED_BREAKPOINTS,
            subcategory: subcat,
            label: config.label
          };
        }
      }
    }
    
    // Default fallback
    return {
      category: 'desktop',
      subcategory: 'md',
      label: 'Desktop Medium'
    };
  }
};

// CSS custom properties for breakpoints
export const CSS_BREAKPOINT_VARS = {
  // Mobile
  '--bp-mobile-xs': '320px',
  '--bp-mobile-sm': '375px', 
  '--bp-mobile-md': '414px',
  '--bp-mobile-lg': '480px',
  
  // Tablet
  '--bp-tablet-sm': '768px',
  '--bp-tablet-md': '834px',
  '--bp-tablet-lg': '1024px',
  
  // Desktop
  '--bp-desktop-sm': '1024px',
  '--bp-desktop-md': '1200px',
  '--bp-desktop-lg': '1440px',
  
  // Large
  '--bp-large-xl': '1680px',
  '--bp-large-xxl': '1920px',
  '--bp-large-ultra': '2560px'
} as const;

// Responsive spacing scale
export const RESPONSIVE_SPACING = {
  mobile: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem'      // 32px
  },
  tablet: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1.25rem',  // 20px
    lg: '2rem',     // 32px
    xl: '3rem'      // 48px
  },
  desktop: {
    xs: '0.75rem',  // 12px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2.5rem',   // 40px
    xl: '4rem'      // 64px
  },
  large: {
    xs: '1rem',     // 16px
    sm: '1.5rem',   // 24px
    md: '2rem',     // 32px
    lg: '3rem',     // 48px
    xl: '5rem'      // 80px
  }
} as const;

// Typography scale for different breakpoints
export const RESPONSIVE_TYPOGRAPHY = {
  mobile: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem' // 30px
  },
  tablet: {
    xs: '0.875rem',  // 14px
    sm: '1rem',      // 16px
    base: '1.125rem', // 18px
    lg: '1.25rem',   // 20px
    xl: '1.5rem',    // 24px
    '2xl': '1.875rem', // 30px
    '3xl': '2.25rem'  // 36px
  },
  desktop: {
    xs: '1rem',      // 16px
    sm: '1.125rem',  // 18px
    base: '1.25rem', // 20px
    lg: '1.5rem',    // 24px
    xl: '1.875rem',  // 30px
    '2xl': '2.25rem', // 36px
    '3xl': '3rem'     // 48px
  },
  large: {
    xs: '1.125rem',  // 18px
    sm: '1.25rem',   // 20px
    base: '1.5rem',  // 24px
    lg: '1.875rem',  // 30px
    xl: '2.25rem',   // 36px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  }
} as const;

// Responsive grid configuration
export const RESPONSIVE_GRID = {
  mobile: {
    columns: 4,
    gutter: '1rem',
    margin: '1rem'
  },
  tablet: {
    columns: 8,
    gutter: '1.5rem',
    margin: '2rem'
  },
  desktop: {
    columns: 12,
    gutter: '2rem',
    margin: '3rem'
  },
  large: {
    columns: 12,
    gutter: '2.5rem',
    margin: '4rem'
  }
} as const;

export type EnhancedBreakpointCategory = keyof typeof ENHANCED_BREAKPOINTS;
export type ResponsiveSpacingSize = keyof typeof RESPONSIVE_SPACING.mobile;
export type ResponsiveTypographySize = keyof typeof RESPONSIVE_TYPOGRAPHY.mobile;
