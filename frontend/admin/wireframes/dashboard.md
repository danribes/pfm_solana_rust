# Admin Dashboard Wireframe

## Main Dashboard Layout

### Desktop Layout (1200px+)
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PFM Logo] Admin Portal          [🔍 Global Search...]        [🔔 3] [👤 Admin] [🔗 Wallet] │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NAVIGATION                                                                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Dashboard  |  🏘️ Communities  |  👥 Members  |  📊 Analytics  |  ⚙️ Settings             │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬─────────────────────────────────────────────────────────────────────────────────┐
│              │ MAIN CONTENT AREA                                                               │
│  SIDEBAR     │                                                                                 │
│              │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ Quick Nav:   │ │                        DASHBOARD OVERVIEW                                   │ │
│ • Overview   │ │                                                                             │ │
│ • Pending    │ │ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┐ │ │
│ • Reports    │ │ │    Total    │   Active    │   Pending   │   Today's   │   System        │ │ │
│ • Settings   │ │ │ Communities │  Members    │ Approvals   │   Votes     │   Health        │ │ │
│              │ │ │             │             │             │             │                 │ │ │
│ Recent:      │ │ │     24      │   1,247     │     12      │      8      │   🟢 Healthy   │ │ │
│ • Community  │ │ │  ↗️ +15%    │   ↗️ +5%    │   ⚠️ urgent │   ↗️ +20%   │   98% uptime    │ │ │
│   "DeFi..."  │ │ │             │             │             │             │                 │ │ │
│ • 5 pending  │ │ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘ │ │
│   approvals  │ │                                                                             │ │
│              │ └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────┤                                                                                 │
               │ ┌─────────────────────────────────┬───────────────────────────────────────────┐ │
               │ │        RECENT ACTIVITY          │            QUICK ACTIONS                  │ │
               │ ├─────────────────────────────────┼───────────────────────────────────────────┤ │
               │ │                                 │                                           │ │
               │ │ 🏘️ New community "DeFi Traders" │ ┌─────────────────────────────────────────┐ │ │
               │ │    Created 2 hours ago          │ │        [+ Create Community]            │ │ │
               │ │                                 │ └─────────────────────────────────────────┘ │ │
               │ │ 👥 5 new member applications    │ ┌─────────────────────────────────────────┐ │ │
               │ │    Requires review              │ │     [📋 Review Member Approvals]       │ │ │
               │ │                                 │ └─────────────────────────────────────────┘ │ │
               │ │ 🗳️ Vote "Budget 2024" completed│ ┌─────────────────────────────────────────┐ │ │
               │ │    89% participation            │ │       [📊 Generate Analytics Report]    │ │ │
               │ │                                 │ └─────────────────────────────────────────┘ │ │
               │ │ 👤 alice.sol promoted to        │ ┌─────────────────────────────────────────┐ │ │
               │ │    Moderator role               │ │         [⚙️ System Settings]           │ │ │
               │ │                                 │ └─────────────────────────────────────────┘ │ │
               │ │                                 │                                           │ │
               │ │ [View All Activity →]           │ [View All Actions →]                     │ │
               │ └─────────────────────────────────┴───────────────────────────────────────────┘ │
               │                                                                                 │
               │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
               │ │                           PERFORMANCE METRICS                               │ │
               │ ├─────────────────────────────────────────────────────────────────────────────┤ │
               │ │                                                                             │ │
               │ │ ┌─────────────────────────────┬─────────────────────────────────────────────┐ │ │
               │ │ │     Community Growth        │        Member Engagement Trends           │ │ │
               │ │ │                             │                                           │ │ │
               │ │ │  30 │                      │  100%│                                     │ │ │
               │ │ │     │ ▄▄▄                  │      │ ████                                │ │ │
               │ │ │  20 │ ███ ▄▄               │   75%│ ████ ▄▄▄                          │ │ │
               │ │ │     │ ███ ███              │      │ ████ ███ ▄▄                       │ │ │
               │ │ │  10 │ ███ ███ ▄▄▄         │   50%│ ████ ███ ███                      │ │ │
               │ │ │     │ ███ ███ ███         │      │ ████ ███ ███ ▄▄                   │ │ │
               │ │ │   0 └─Jan─Feb─Mar─Apr      │   25%│ ████ ███ ███ ███                  │ │ │
               │ │ │                             │    0%└─Jan─Feb─Mar─Apr                   │ │ │
               │ │ └─────────────────────────────┴─────────────────────────────────────────────┘ │ │
               │ │                                                                             │ │
               │ │ ┌─────────────────────────────┬─────────────────────────────────────────────┐ │ │
               │ │ │    Voting Participation     │         Revenue Trends                    │ │ │
               │ │ │                             │                                           │ │ │
               │ │ │       Active: 78%          │  $15K│                                     │ │ │
               │ │ │     ████████████████        │      │     ▄▄▄                           │ │ │
               │ │ │                             │ $10K │   ▄▄███▄▄▄                        │ │ │
               │ │ │     Inactive: 22%          │      │ ▄▄███████████                      │ │ │
               │ │ │     ██████                  │  $5K │ █████████████▄▄                   │ │ │
               │ │ │                             │      │ ███████████████                   │ │ │
               │ │ │                             │   $0 └─Jan─Feb─Mar─Apr                   │ │ │
               │ │ └─────────────────────────────┴─────────────────────────────────────────────┘ │ │
               │ └─────────────────────────────────────────────────────────────────────────────┘ │
               └─────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────────────────────────┐
│ HEADER (Collapsed)                          │
├─────────────────────────────────────────────┤
│ ☰ [PFM] Admin           [🔔] [👤] [🔗]     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ STATS CARDS (Stacked)                      │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │        Total Communities                │ │
│ │             24                          │ │
│ │          ↗️ +15%                        │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │         Active Members                  │ │
│ │            1,247                        │ │
│ │           ↗️ +5%                        │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │       Pending Approvals                 │ │
│ │             12                          │ │
│ │         ⚠️ urgent                       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ QUICK ACTIONS                               │
├─────────────────────────────────────────────┤
│ [+ Create Community]                        │
│ [📋 Review Approvals]                       │
│ [📊 Analytics]                              │
│ [⚙️ Settings]                               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ RECENT ACTIVITY                             │
├─────────────────────────────────────────────┤
│ 🏘️ New community "DeFi..."                │
│ 👥 5 new applications                       │
│ 🗳️ Vote completed                          │
│ [View All →]                                │
└─────────────────────────────────────────────┘
```

## Interactive Elements

### Stats Cards
- **Hover Effect**: Subtle shadow and color change
- **Click Action**: Navigate to relevant detail page
- **Loading State**: Skeleton animation while data loads
- **Error State**: Error message with retry button

### Activity Feed
- **Real-time Updates**: WebSocket connection for live updates
- **Infinite Scroll**: Load more activities as user scrolls
- **Action Buttons**: Quick action buttons on each item
- **Filtering**: Filter by activity type, date range

### Charts
- **Interactive Tooltips**: Show detailed data on hover
- **Zoom/Pan**: Allow users to zoom into specific time periods
- **Export Options**: Download chart as image or data as CSV
- **Responsive Design**: Adjust chart size based on screen size

### Search Bar
- **Autocomplete**: Suggest communities, members as user types
- **Recent Searches**: Show recent search history
- **Advanced Filters**: Expandable filter options
- **Keyboard Shortcuts**: Cmd/Ctrl+K to focus search

## Color Coding System

### Status Indicators
- 🟢 **Green**: Active, Healthy, Approved
- 🟡 **Yellow**: Pending, Warning, Review Required
- 🔴 **Red**: Inactive, Error, Rejected
- 🔵 **Blue**: Information, Neutral, Processing

### Priority Levels
- **High**: Red background, urgent icon
- **Medium**: Yellow background, attention icon
- **Low**: Gray background, info icon
- **Normal**: White background, no special indicator

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical tab sequence through all interactive elements
- **Skip Links**: "Skip to main content" link for screen readers
- **Focus Indicators**: Clear visual focus indicators
- **Keyboard Shortcuts**: Documented shortcuts for power users

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Landmarks**: Proper heading hierarchy and page structure
- **Live Regions**: Announce dynamic content changes
- **Alternative Text**: Descriptive alt text for charts and images

### Visual Accessibility
- **High Contrast**: Support for high contrast mode
- **Color Independence**: Don't rely solely on color for information
- **Font Scaling**: Support for user font size preferences
- **Motion Reduction**: Respect prefers-reduced-motion

## Performance Considerations

### Data Loading
- **Progressive Loading**: Load above-the-fold content first
- **Skeleton Screens**: Show content structure while loading
- **Error Boundaries**: Graceful handling of component errors
- **Retry Logic**: Automatic retry for failed data fetches

### Optimization
- **Image Optimization**: WebP format with fallbacks
- **Code Splitting**: Split bundle by route and feature
- **Caching Strategy**: Appropriate cache headers and SWR
- **Bundle Analysis**: Monitor and optimize bundle size

This dashboard wireframe provides a comprehensive overview of the admin portal's main interface, focusing on usability, accessibility, and performance while maintaining a clean, professional design that supports efficient community management workflows. 