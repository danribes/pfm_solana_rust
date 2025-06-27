# Shared Component Wireframes

## Navigation Components

### Main Navigation Bar
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DESKTOP NAVIGATION (1200px+)                                                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [🏠 PFM Logo] Platform Name      [🔍 Global Search...]     [🔔 3] [👤 alice.sol ▼] [🔗 Connected] │
│                                                                                                │
│ 🏠 Dashboard  |  🏘️ Communities  |  🗳️ Voting  |  📊 Results  |  👤 Profile  |  ⚙️ Settings   │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ MOBILE NAVIGATION (<768px)                  │
├─────────────────────────────────────────────┤
│ ☰ [PFM] Platform             [🔔] [👤] [🔗] │
├─────────────────────────────────────────────┤
│ Mobile Menu (Hidden by default):            │
│ ┌─────────────────────────────────────────┐ │
│ │ [✗] Close                               │ │
│ │                                         │ │
│ │ 🏠 Dashboard                            │ │
│ │ 🏘️ Communities                          │ │
│ │ 🗳️ Voting                               │ │
│ │ 📊 Results                              │ │
│ │ 👤 Profile                              │ │
│ │ ⚙️ Settings                             │ │
│ │ ────────────────                        │ │
│ │ 🔗 Wallet: alice.sol                   │ │
│ │ 💰 Balance: 2.45 SOL                   │ │
│ │ 🟢 Connected to Mainnet                │ │
│ │ ────────────────                        │ │
│ │ 🆘 Help & Support                      │ │
│ │ 📋 Documentation                        │ │
│ │ 🚪 Sign Out                            │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ BOTTOM TAB NAVIGATION (Mobile)              │
├─────────────────────────────────────────────┤
│ ┌─────┬─────┬─────┬─────┬─────┐            │
│ │ 🏠  │ 🏘️  │ 🗳️  │ 📊  │ 👤  │            │
│ │Home │Comm │Vote │Data │ Me  │            │
│ └─────┴─────┴─────┴─────┴─────┘            │
└─────────────────────────────────────────────┘
```

### Breadcrumb Navigation
```
┌─────────────────────────────────────────────────────────────────┐
│ BREADCRUMB VARIANTS                                             │
├─────────────────────────────────────────────────────────────────┤
│ Standard Breadcrumbs:                                           │
│ 🏠 Home > 🏘️ Communities > DeFi Traders > 🗳️ Active Votes      │
│                                                                 │
│ With Icons and Separators:                                      │
│ 🏠 Dashboard  /  📊 Analytics  /  📈 Community Reports         │
│                                                                 │
│ Mobile Compact:                                                 │
│ ← DeFi Traders                                                  │
│                                                                 │
│ Mobile Full:                                                    │
│ ← Back to Communities                                           │
│ 🏘️ DeFi Traders Community                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Modal & Dialog Components

### Standard Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ MODAL OVERLAY (Dark background with modal centered)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ Modal Title                                       [✗] │ │
│     ├─────────────────────────────────────────────────────────┤ │
│     │                                                         │ │
│     │ Modal content area with information, forms,            │ │
│     │ or other interactive elements.                         │ │
│     │                                                         │ │
│     │ This can include text, images, forms, lists,          │ │
│     │ or any other content needed for the specific          │ │
│     │ modal purpose.                                         │ │
│     │                                                         │ │
│     ├─────────────────────────────────────────────────────────┤ │
│     │                    [Cancel] [Confirm Action]           │ │
│     └─────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Confirmation Dialog
```
┌─────────────────────────────────────────────────────────────────┐
│ CONFIRMATION MODAL                                              │
├─────────────────────────────────────────────────────────────────┤
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ ⚠️ Confirm Action                                [✗] │ │
│     ├─────────────────────────────────────────────────────────┤ │
│     │                                                         │ │
│     │ Are you sure you want to delete this community?        │ │
│     │                                                         │ │
│     │ This action cannot be undone. All voting data,         │ │
│     │ member information, and community history will be      │ │
│     │ permanently removed.                                    │ │
│     │                                                         │ │
│     │ Community: "DeFi Traders"                              │ │
│     │ Members: 247 active members                            │ │
│     │ Created: Jan 15, 2024                                  │ │
│     │                                                         │ │
│     │ Type "DELETE" to confirm:                              │ │
│     │ ┌─────────────────────────────────────────────────────┐ │ │
│     │ │ [Confirmation text input]                           │ │ │
│     │ └─────────────────────────────────────────────────────┘ │ │
│     │                                                         │ │
│     ├─────────────────────────────────────────────────────────┤ │
│     │              [Cancel] [🗑️ Delete Community]            │ │
│     └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Loading Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ LOADING MODAL                                                   │
├─────────────────────────────────────────────────────────────────┤
│     ┌─────────────────────────────────────────────────────────┐ │
│     │ Processing Transaction...                               │ │
│     ├─────────────────────────────────────────────────────────┤ │
│     │                                                         │ │
│     │              ⏳ Loading Animation                       │ │
│     │                                                         │ │
│     │ Submitting your vote to the blockchain...              │ │
│     │                                                         │ │
│     │ ████████████████████████████████████████░░░░░░░░░░░ 75% │ │
│     │                                                         │ │
│     │ Step 3 of 4: Confirming transaction                    │ │
│     │ Estimated time remaining: 15 seconds                   │ │
│     │                                                         │ │
│     │ Transaction ID: 5K8j...mN9p                           │ │
│     │ Gas fee: 0.00025 SOL                                  │ │
│     │                                                         │ │
│     │ [View on Explorer] [Cancel] (if cancellable)          │ │
│     └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Notification Components

### Toast Notifications
```
┌─────────────────────────────────────────────────────────────────┐
│ TOAST NOTIFICATIONS (Top-right corner)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                     ┌─────────────────────────────────────────┐ │
│ Success Toast:      │ ✅ Vote submitted successfully!     [✗] │ │
│                     │ Your vote has been recorded on-chain   │ │
│                     │ [View Results] [Undo]                  │ │
│                     └─────────────────────────────────────────┘ │
│                                                                 │
│                     ┌─────────────────────────────────────────┐ │
│ Warning Toast:      │ ⚠️ Service degraded                [✗] │ │
│                     │ Solana RPC is experiencing delays      │ │
│                     │ Transactions may take longer           │ │
│                     │ [Check Status] [Retry]                 │ │
│                     └─────────────────────────────────────────┘ │
│                                                                 │
│                     ┌─────────────────────────────────────────┐ │
│ Error Toast:        │ ❌ Transaction failed              [✗] │ │
│                     │ Insufficient SOL for gas fees          │ │
│                     │ [Add SOL] [Try Again] [Support]        │ │
│                     └─────────────────────────────────────────┘ │
│                                                                 │
│                     ┌─────────────────────────────────────────┐ │
│ Info Toast:         │ ℹ️ New community created           [✗] │ │
│                     │ "Web3 Gaming DAO" is now available     │ │
│                     │ [Join Community] [Learn More]          │ │
│                     └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Banner Notifications
```
┌─────────────────────────────────────────────────────────────────┐
│ BANNER NOTIFICATIONS (Top of page)                             │
├─────────────────────────────────────────────────────────────────┤
│ Maintenance Banner:                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔧 Scheduled Maintenance | System maintenance in 2 hours   │ │
│ │ Some features may be temporarily unavailable          [✗] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Update Banner:                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🆕 New Features Available | Check out voting analytics     │ │
│ │ [Learn More] [Take Tour] [Dismiss]                    [✗] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Warning Banner:                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Network Issue | Blockchain connection unstable          │ │
│ │ Votes may be delayed. Check status page for updates   [✗] │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Loading States

### Skeleton Loading
```
┌─────────────────────────────────────────────────────────────────┐
│ SKELETON LOADING STATES                                         │
├─────────────────────────────────────────────────────────────────┤
│ Community Card Skeleton:                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ████████████████████████████████████████████████████████    │ │
│ │ ████████████████████                                       │ │
│ │                                                             │ │
│ │ [████████████████████████████████████████████████████████] │ │
│ │ [████████████████████████████████████████████████████████] │ │
│ │                                                             │ │
│ │ ████████████████████████ ████████████████ ████████████████ │ │
│ │                                                             │ │
│ │ [██████████████] [██████████████████] [████████████████]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ List Item Skeleton:                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ●●● ████████████████████████████████████████████████████    │ │
│ │     ████████████████████████████████                       │ │
│ │     ████████████████████ ████████████████                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ●●● ████████████████████████████████████████████████████    │ │
│ │     ████████████████████████████████                       │ │
│ │     ████████████████████ ████████████████                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Chart Skeleton:                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ████████████████████████████████████████████████████████    │ │
│ │                                                             │ │
│ │     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │ │
│ │     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │ │
│ │     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │ │
│ │                                                             │ │
│ │ ████████████████████████████████████████████████████████    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Spinner Loading
```
┌─────────────────────────────────────────────────────────────────┐
│ SPINNER VARIANTS                                                │
├─────────────────────────────────────────────────────────────────┤
│ Small Spinner (Inline):                                        │
│ Loading data... ⏳                                             │
│                                                                 │
│ Medium Spinner (Button):                                        │
│ [  ⏳ Loading...  ]                                            │
│                                                                 │
│ Large Spinner (Page):                                           │
│                     ⏳                                          │
│                  Loading                                        │
│              Please wait...                                     │
│                                                                 │
│ Custom Blockchain Spinner:                                      │
│                    ◉───◉                                        │
│                   /     \                                       │
│                  ◉       ◉                                      │
│                   \     /                                       │
│                    ◉───◉                                        │
│            Syncing with blockchain...                           │
└─────────────────────────────────────────────────────────────────┘
```

## Error States

### Error Boundaries
```
┌─────────────────────────────────────────────────────────────────┐
│ ERROR STATE COMPONENTS                                          │
├─────────────────────────────────────────────────────────────────┤
│ General Error:                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        😕                                   │ │
│ │              Something went wrong                           │ │
│ │                                                             │ │
│ │ We're sorry, but something unexpected happened.            │ │
│ │ Please try refreshing the page or contact support          │ │
│ │ if the problem persists.                                   │ │
│ │                                                             │ │
│ │ Error ID: ERR_001_20240315_143022                          │ │
│ │                                                             │ │
│ │ [🔄 Refresh Page] [📧 Report Issue] [🏠 Go Home]          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Network Error:                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        📡                                   │ │
│ │               Connection Lost                               │ │
│ │                                                             │ │
│ │ Unable to connect to PFM services.                        │ │
│ │ Please check your internet connection and try again.       │ │
│ │                                                             │ │
│ │ Status: Attempting to reconnect... (Attempt 3 of 5)       │ │
│ │                                                             │ │
│ │ [🔄 Retry Now] [📊 Status Page] [💬 Support]              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Blockchain Error:                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        ⛓️                                   │ │
│ │              Blockchain Issue                               │ │
│ │                                                             │ │
│ │ Unable to connect to Solana network.                       │ │
│ │ Voting and wallet functions may be limited.                │ │
│ │                                                             │ │
│ │ Network: Mainnet | Status: Degraded                        │ │
│ │ Last successful connection: 2 minutes ago                   │ │
│ │                                                             │ │
│ │ [🔄 Retry Connection] [🌐 Check Network] [📖 Learn More]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Empty States
```
┌─────────────────────────────────────────────────────────────────┐
│ EMPTY STATE COMPONENTS                                          │
├─────────────────────────────────────────────────────────────────┤
│ No Communities:                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        🏘️                                   │ │
│ │              No Communities Yet                             │ │
│ │                                                             │ │
│ │ You haven't joined any communities yet.                    │ │
│ │ Discover and join communities that match your interests.    │ │
│ │                                                             │ │
│ │ [🔍 Browse Communities] [➕ Create Community]              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ No Votes:                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        🗳️                                   │ │
│ │               No Active Votes                               │ │
│ │                                                             │ │
│ │ There are no active votes in your communities.             │ │
│ │ Check back later or join more communities to participate.   │ │
│ │                                                             │ │
│ │ [🏘️ Browse Communities] [📊 View Past Results]            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Search No Results:                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        🔍                                   │ │
│ │             No Results Found                                │ │
│ │                                                             │ │
│ │ No communities found for "DeFi Gaming NFT"                 │ │
│ │                                                             │ │
│ │ Try:                                                        │ │
│ │ • Different keywords                                        │ │
│ │ • Broader search terms                                      │ │
│ │ • Browse by category                                        │ │
│ │                                                             │ │
│ │ [🔄 Clear Search] [🏘️ Browse All] [💡 Suggestions]        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Container-Specific Components

### Service Status Widget
```
┌─────────────────────────────────────────────────────────────────┐
│ CONTAINER SERVICE MONITORING                                    │
├─────────────────────────────────────────────────────────────────┤
│ Floating Status Indicator:                                      │
│                                                                 │
│                                               ┌───────────────┐ │
│                                               │ 🟢 All Online │ │
│                                               │ 45ms avg      │ │
│                                               └───────────────┘ │
│                                                                 │
│ Expanded Status Panel:                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🐳 Container Services                               [✗] │ │
│ │ Last updated: 30 seconds ago                               │ │
│ │ ┌─────────────────┬─────────┬─────────┬─────────────────┐   │ │
│ │ │ Service         │ Status  │ Latency │ Last Check      │   │ │
│ │ ├─────────────────┼─────────┼─────────┼─────────────────┤   │ │
│ │ │ 🟢 Backend API  │ Healthy │ 45ms    │ 30s ago         │   │ │
│ │ │ 🟢 Database     │ Healthy │ 12ms    │ 30s ago         │   │ │
│ │ │ 🟢 Redis Cache  │ Healthy │ 8ms     │ 30s ago         │   │ │
│ │ │ 🟡 Solana RPC   │ Slow    │ 180ms   │ 45s ago         │   │ │
│ │ └─────────────────┴─────────┴─────────┴─────────────────┘   │ │
│ │                                                             │ │
│ │ Container Environment: Development                          │ │
│ │ Host: pfm-dev-container                                    │ │
│ │ Network: pfm-network                                       │ │
│ │                                                             │ │
│ │ [🔄 Refresh] [📊 Metrics] [🔧 Configure]                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Indicator
```
┌─────────────────────────────────────────────────────────────────┐
│ ENVIRONMENT INDICATORS                                          │
├─────────────────────────────────────────────────────────────────┤
│ Development Mode Banner:                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🧪 Development Environment | Container: pfm-dev        [✗] │ │
│ │ Hot reload enabled • Debug mode • Local Solana validator  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Staging Mode Banner:                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🚧 Staging Environment | Test data • Do not use real SOL │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Production Indicator (Subtle):                                  │
│ Footer: Environment: Production | Version: 1.2.3 | 🟢         │
└─────────────────────────────────────────────────────────────────┘
```

These shared component wireframes provide a comprehensive foundation for building consistent, accessible, and container-aware interfaces across both admin and member portals. 