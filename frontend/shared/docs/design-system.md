# PFM Shared Design System Documentation

## Overview
The PFM Shared Design System provides a comprehensive set of design tokens, components, and patterns for building consistent, accessible, and scalable user interfaces across the Admin and Member portals. This system is designed with containerization and Web3 functionality in mind.

## Design Principles

### 1. **Consistency First**
- **Unified Experience**: Same look, feel, and behavior across all portals
- **Predictable Interactions**: Users know what to expect from familiar patterns
- **Brand Coherence**: Consistent brand expression throughout the platform
- **Cross-Portal Navigation**: Seamless transitions between admin and member experiences

### 2. **Container-Native Design**
- **Service-Aware Components**: Components that understand their containerized environment
- **Health Monitoring Integration**: Built-in status indicators for container services
- **Environment Flexibility**: Components adapt to development, staging, and production
- **Performance Optimization**: Designed for container resource constraints

### 3. **Web3-First Approach**
- **Wallet Integration**: Native support for Solana wallet connections
- **Blockchain Status**: Real-time blockchain connection and transaction status
- **Gas Fee Awareness**: Clear cost indicators and optimization suggestions
- **Security Focus**: Built-in security patterns for Web3 interactions

### 4. **Accessibility by Default**
- **WCAG 2.1 AA Compliance**: All components meet accessibility standards
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Semantic markup with proper ARIA labels
- **Inclusive Design**: Supports various abilities, preferences, and contexts

## Design Tokens

### Color System
```typescript
// Primary Colors
const colors = {
  primary: {
    50: '#eff6ff',   // Lightest blue
    100: '#dbeafe',  // Very light blue
    200: '#bfdbfe',  // Light blue
    300: '#93c5fd',  // Medium light blue
    400: '#60a5fa',  // Medium blue
    500: '#3b82f6',  // Base blue (primary)
    600: '#2563eb',  // Dark blue
    700: '#1d4ed8',  // Darker blue
    800: '#1e40af',  // Very dark blue
    900: '#1e3a8a',  // Darkest blue
  },
  
  // Semantic Colors
  success: {
    50: '#ecfdf5',   // Lightest green
    100: '#d1fae5',  // Very light green
    500: '#10b981',  // Base green
    600: '#059669',  // Dark green
    700: '#047857',  // Darker green
  },
  
  warning: {
    50: '#fffbeb',   // Lightest amber
    100: '#fef3c7',  // Very light amber
    500: '#f59e0b',  // Base amber
    600: '#d97706',  // Dark amber
    700: '#b45309',  // Darker amber
  },
  
  error: {
    50: '#fef2f2',   // Lightest red
    100: '#fee2e2',  // Very light red
    500: '#ef4444',  // Base red
    600: '#dc2626',  // Dark red
    700: '#b91c1c',  // Darker red
  },
  
  // Neutral Grays
  gray: {
    50: '#f9fafb',   // Lightest gray (backgrounds)
    100: '#f3f4f6',  // Very light gray
    200: '#e5e7eb',  // Light gray (borders)
    300: '#d1d5db',  // Medium light gray
    400: '#9ca3af',  // Medium gray
    500: '#6b7280',  // Base gray (secondary text)
    600: '#4b5563',  // Dark gray
    700: '#374151',  // Darker gray (primary text)
    800: '#1f2937',  // Very dark gray
    900: '#111827',  // Darkest gray
  },
  
  // Web3 Specific Colors
  blockchain: {
    solana: '#00d4aa',    // Solana brand color
    connected: '#10b981', // Connection success
    pending: '#f59e0b',   // Transaction pending
    failed: '#ef4444',    // Transaction failed
  },
  
  // Container Status Colors
  container: {
    healthy: '#10b981',   // Service healthy
    warning: '#f59e0b',   // Service degraded
    error: '#ef4444',     // Service error
    unknown: '#6b7280',   // Service unknown
  }
};
```

### Typography Scale
```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Monaco', 'Menlo', 'monospace'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px - Captions, small labels
    sm: '0.875rem',   // 14px - Body text, form inputs
    base: '1rem',     // 16px - Default body text
    lg: '1.125rem',   // 18px - Large body text
    xl: '1.25rem',    // 20px - Small headings
    '2xl': '1.5rem',  // 24px - Medium headings
    '3xl': '1.875rem', // 30px - Large headings
    '4xl': '2.25rem', // 36px - Extra large headings
  },
  
  fontWeight: {
    normal: '400',    // Regular text
    medium: '500',    // Medium emphasis
    semibold: '600',  // Strong emphasis
    bold: '700',      // Headings, important text
  },
  
  lineHeight: {
    tight: '1.25',    // 20px for 16px font
    normal: '1.5',    // 24px for 16px font
    relaxed: '1.75',  // 28px for 16px font
  }
};
```

### Spacing System
```typescript
const spacing = {
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px - Base unit
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
};
```

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
};
```

## Component Architecture

### Base Components

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Usage Examples:
<Button variant="primary" size="md">Connect Wallet</Button>
<Button variant="outline" size="sm" icon={<WalletIcon />}>
  alice.sol
</Button>
<Button variant="danger" size="lg" loading>
  Submitting Vote...
</Button>
```

#### Input Component
```typescript
interface InputProps {
  label: string;
  type: 'text' | 'email' | 'password' | 'search' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: ReactNode;
  suffix?: ReactNode;
}

// Usage Examples:
<Input 
  label="Community Name"
  type="text"
  placeholder="Enter community name..."
  value={name}
  onChange={setName}
  required
/>
<Input 
  label="Search Communities"
  type="search"
  icon={<SearchIcon />}
  placeholder="Search by name, topic, or member..."
/>
```

### Web3 Components

#### WalletConnection Component
```typescript
interface WalletConnectionProps {
  variant: 'full' | 'compact' | 'icon';
  showBalance?: boolean;
  showNetwork?: boolean;
  onConnect?: (wallet: WalletAdapter) => void;
  onDisconnect?: () => void;
}

// Container-aware wallet connection
<WalletConnection 
  variant="full"
  showBalance
  showNetwork
  onConnect={(wallet) => {
    // Container health check
    checkServiceHealth();
    handleConnect(wallet);
  }}
/>
```

#### TransactionStatus Component
```typescript
interface TransactionStatusProps {
  status: 'pending' | 'confirmed' | 'failed';
  signature?: string;
  message: string;
  estimatedTime?: number;
  gasEstimate?: number;
}

<TransactionStatus 
  status="pending"
  message="Submitting your vote..."
  estimatedTime={30}
  gasEstimate={0.00025}
/>
```

### Container Components

#### ServiceHealthIndicator
```typescript
interface ServiceHealthProps {
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'error' | 'unknown';
    latency?: number;
    lastCheck: Date;
  }>;
  variant: 'full' | 'compact' | 'minimal';
  autoRefresh?: boolean;
}

<ServiceHealthIndicator 
  services={containerServices}
  variant="compact"
  autoRefresh
/>
```

#### ContainerStatus Component
```typescript
interface ContainerStatusProps {
  environment: 'development' | 'staging' | 'production';
  services: ServiceStatus[];
  showDetails?: boolean;
  onServiceClick?: (service: string) => void;
}

<ContainerStatus 
  environment="development"
  services={services}
  showDetails
  onServiceClick={openServiceDashboard}
/>
```

### Data Visualization Components

#### VoteChart Component
```typescript
interface VoteChartProps {
  data: VoteData[];
  type: 'bar' | 'pie' | 'line';
  realTime?: boolean;
  showPercentages?: boolean;
  showCounts?: boolean;
  height?: number;
}

<VoteChart 
  data={voteResults}
  type="pie"
  realTime
  showPercentages
  showCounts
/>
```

#### ProgressBar Component
```typescript
interface ProgressBarProps {
  value: number;
  max: number;
  variant: 'default' | 'success' | 'warning' | 'error';
  size: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

<ProgressBar 
  value={67}
  max={100}
  variant="success"
  size="lg"
  showLabel
  animated
/>
```

### Layout Components

#### Page Component
```typescript
interface PageProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  loading?: boolean;
}

<Page 
  title="Community Management"
  subtitle="Manage your communities and members"
  actions={<Button>Create Community</Button>}
  breadcrumbs={[
    { label: 'Dashboard', href: '/' },
    { label: 'Communities', href: '/communities' }
  ]}
>
  {children}
</Page>
```

#### Card Component
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

<Card 
  title="Active Votes"
  subtitle="3 votes ending today"
  actions={<Button variant="ghost">View All</Button>}
  shadow="md"
  hover
>
  {votesList}
</Card>
```

## Responsive Design Patterns

### Mobile-First Approach
All components are designed mobile-first with progressive enhancement:

```typescript
// Component styling approach
const styles = {
  // Mobile (default)
  base: 'px-4 py-2 text-sm',
  
  // Tablet and up
  md: 'md:px-6 md:py-3 md:text-base',
  
  // Desktop and up
  lg: 'lg:px-8 lg:py-4 lg:text-lg',
};
```

### Touch-Friendly Interactions
- **Minimum Touch Target**: 44px × 44px
- **Generous Spacing**: 8px minimum between interactive elements
- **Swipe Gestures**: Support for common mobile gestures
- **Haptic Feedback**: Visual feedback for touch interactions

### Adaptive Navigation
```typescript
// Navigation adapts to screen size
<Navigation 
  variant={isMobile ? 'bottom-tabs' : 'sidebar'}
  items={navigationItems}
  currentPath={pathname}
/>
```

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: 4.5:1 minimum for normal text, 3:1 for large text
- **Focus Management**: Clear focus indicators and logical tab order
- **Semantic HTML**: Proper use of headings, landmarks, and form labels
- **Alternative Text**: Descriptive alt text for all meaningful images

### Keyboard Navigation
```typescript
// All components support keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      handleActivate();
      break;
    case 'Escape':
      handleClose();
      break;
    case 'ArrowDown':
      focusNext();
      break;
    case 'ArrowUp':
      focusPrevious();
      break;
  }
};
```

### Screen Reader Support
```typescript
// Proper ARIA labels and descriptions
<Button 
  aria-label="Connect wallet to join community"
  aria-describedby="wallet-help-text"
>
  Connect Wallet
</Button>
<div id="wallet-help-text" className="sr-only">
  Connect your Solana wallet to participate in community voting
</div>
```

## Container Integration Features

### Service Discovery
```typescript
// Components can discover and connect to container services
const useServiceDiscovery = () => {
  const [services, setServices] = useState({});
  
  useEffect(() => {
    const discoverServices = async () => {
      const backend = await fetch('/api/services/backend/health');
      const solana = await fetch('/api/services/solana/health');
      
      setServices({
        backend: backend.ok ? 'healthy' : 'error',
        solana: solana.ok ? 'healthy' : 'error'
      });
    };
    
    discoverServices();
    const interval = setInterval(discoverServices, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return services;
};
```

### Environment Awareness
```typescript
// Components adapt behavior based on container environment
const useContainerEnvironment = () => {
  const [environment, setEnvironment] = useState('development');
  
  useEffect(() => {
    // Detect container environment
    const isContainer = process.env.NEXT_PUBLIC_CONTAINER_MODE === 'true';
    const env = process.env.NODE_ENV || 'development';
    
    setEnvironment(isContainer ? `${env}-container` : env);
  }, []);
  
  return {
    environment,
    isContainer: environment.includes('container'),
    isDevelopment: environment.includes('development'),
    isProduction: environment.includes('production')
  };
};
```

### Performance Monitoring
```typescript
// Components can report performance metrics
const usePerformanceMonitoring = (componentName: string) => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes(componentName)) {
          // Report to container monitoring
          reportMetric('component.render.duration', entry.duration);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    return () => observer.disconnect();
  }, [componentName]);
};
```

## Testing Strategy

### Component Testing
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct variant styles', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600');
  });
  
  it('supports keyboard navigation', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });
  
  it('meets accessibility standards', async () => {
    const { container } = render(<Button>Accessible button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Visual Regression Testing
```typescript
// Storybook stories for visual testing
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: { autodocs: true },
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } }
  }
};

export const AllVariants = () => (
  <div className="space-y-4">
    <Button variant="primary">Primary Button</Button>
    <Button variant="secondary">Secondary Button</Button>
    <Button variant="outline">Outline Button</Button>
    <Button variant="ghost">Ghost Button</Button>
    <Button variant="danger">Danger Button</Button>
  </div>
);
```

## Implementation Guidelines

### Development Workflow
1. **Design Tokens First**: Update tokens in Style Dictionary
2. **Component Development**: Build components with Storybook
3. **Testing**: Write tests alongside component development
4. **Documentation**: Update documentation and examples
5. **Integration**: Test in both admin and member portals

### Container Development
1. **Service Health**: Components should handle service unavailability gracefully
2. **Performance**: Monitor and optimize for container resource constraints
3. **Networking**: Use container-aware service discovery
4. **Monitoring**: Integrate with container monitoring and alerting

### Quality Assurance
- **Accessibility Audits**: Regular automated and manual accessibility testing
- **Performance Testing**: Component performance benchmarking
- **Cross-Browser Testing**: Ensure compatibility across modern browsers
- **Container Testing**: Test in actual containerized environments

This shared design system provides the foundation for building consistent, accessible, and high-performance user interfaces across the entire PFM platform while maintaining full compatibility with the containerized development environment. 