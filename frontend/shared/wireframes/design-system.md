# Design System Wireframes

## Core Design Tokens

### Color Palette Wireframe
```
┌─────────────────────────────────────────────────────────────────┐
│ PRIMARY COLORS                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Blue Scale (Primary Brand)                                      │
│ ████ ████ ████ ████ ████ ████ ████ ████ ████ ████              │
│  50   100  200  300  400  500  600  700  800  900              │
│                      Base                                       │
├─────────────────────────────────────────────────────────────────┤
│ SEMANTIC COLORS                                                 │
│ Success: ████ ████ ████ (Green - #10B981)                      │
│ Warning: ████ ████ ████ (Amber - #F59E0B)                      │
│ Error:   ████ ████ ████ (Red - #EF4444)                        │
│ Info:    ████ ████ ████ (Cyan - #06B6D4)                       │
├─────────────────────────────────────────────────────────────────┤
│ WEB3 SPECIFIC COLORS                                            │
│ Solana:     ████ (#00D4AA - Brand)                             │
│ Connected:  ████ (#10B981 - Success)                           │
│ Pending:    ████ (#F59E0B - Warning)                           │
│ Failed:     ████ (#EF4444 - Error)                             │
├─────────────────────────────────────────────────────────────────┤
│ CONTAINER STATUS COLORS                                         │
│ Healthy:    ████ (#10B981)                                     │
│ Degraded:   ████ (#F59E0B)                                     │
│ Error:      ████ (#EF4444)                                     │
│ Unknown:    ████ (#6B7280)                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Typography Scale Wireframe
```
┌─────────────────────────────────────────────────────────────────┐
│ TYPOGRAPHY HIERARCHY                                            │
├─────────────────────────────────────────────────────────────────┤
│ Extra Large Heading (36px/Bold)                                │
│ Community Management Dashboard                                  │
│                                                                 │
│ Large Heading (30px/Bold)                                      │
│ Active Voting Sessions                                          │
│                                                                 │
│ Medium Heading (24px/Semibold)                                 │
│ DeFi Protocol Upgrade                                          │
│                                                                 │
│ Small Heading (20px/Semibold)                                  │
│ Voting Results                                                  │
│                                                                 │
│ Large Body (18px/Medium)                                        │
│ Important information and primary content                       │
│                                                                 │
│ Regular Body (16px/Regular)                                     │
│ Standard body text for descriptions and content                 │
│                                                                 │
│ Small Body (14px/Regular)                                       │
│ Secondary information and form labels                           │
│                                                                 │
│ Caption (12px/Medium)                                           │
│ Timestamps, metadata, and small labels                         │
├─────────────────────────────────────────────────────────────────┤
│ FONT FAMILY: Inter (Primary), Monaco (Code)                    │
│ LINE HEIGHT: 1.5 (Normal), 1.25 (Tight), 1.75 (Relaxed)      │
└─────────────────────────────────────────────────────────────────┘
```

## Button Components Wireframe

### Button Variants
```
┌─────────────────────────────────────────────────────────────────┐
│ BUTTON VARIANTS                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Primary:    [  Connect Wallet  ]  (Blue background)            │
│ Secondary:  [  View Details   ]  (Gray background)             │
│ Outline:    [  Learn More     ]  (Border only)                │
│ Ghost:      [  Cancel        ]  (No background)               │
│ Danger:     [  Delete        ]  (Red background)              │
├─────────────────────────────────────────────────────────────────┤
│ BUTTON SIZES                                                    │
│ Extra Small: [XS]  (28px height)                              │
│ Small:       [ SM ]  (32px height)                            │
│ Medium:      [ Medium ]  (40px height)                        │
│ Large:       [  Large  ]  (48px height)                       │
│ Extra Large: [ Extra Large ]  (56px height)                   │
├─────────────────────────────────────────────────────────────────┤
│ BUTTON STATES                                                   │
│ Default:    [  Normal State  ]                                │
│ Hover:      [  Hover State   ]  (Darker/Elevated)            │
│ Active:     [  Active State  ]  (Pressed)                     │
│ Disabled:   [  Disabled     ]  (Grayed out)                   │
│ Loading:    [  ⏳ Loading... ]  (Spinner animation)           │
├─────────────────────────────────────────────────────────────────┤
│ SPECIAL BUTTONS                                                 │
│ Wallet:     [ 🔗 alice.sol ▼ ]  (Wallet connection)          │
│ Icon:       [ 🔔 ]  (Icon only)                               │
│ Full Width: [     Submit Vote     ]  (100% width)            │
│ With Icon:  [ 📊 View Results ]  (Icon + text)               │
└─────────────────────────────────────────────────────────────────┘
```

## Form Components Wireframe

### Input Components
```
┌─────────────────────────────────────────────────────────────────┐
│ FORM INPUTS                                                     │
├─────────────────────────────────────────────────────────────────┤
│ Text Input:                                                     │
│ Community Name *                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Enter community name...                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Search Input:                                                   │
│ Search Communities                                              │
│ ┌─ 🔍 ─────────────────────────────────────────────────────────┐ │
│ │ Search by name, topic, or member...                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Select Dropdown:                                                │
│ Community Category                                              │
│ ┌─────────────────────────────────────────────────────────┬─▼─┐ │
│ │ DeFi & Trading                                         │   │ │
│ └─────────────────────────────────────────────────────────┴───┘ │
│                                                                 │
│ Textarea:                                                       │
│ Community Description                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Describe your community's purpose and goals...             │ │
│ │                                                             │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ 0/500 characters                                               │
├─────────────────────────────────────────────────────────────────┤
│ INPUT STATES                                                    │
│ Default:  ┌─────────────────────┐                              │
│          │ Placeholder text    │                              │
│          └─────────────────────┘                              │
│                                                                 │
│ Focused:  ┌─────────────────────┐  (Blue border)              │
│          │ User typing...      │                              │
│          └─────────────────────┘                              │
│                                                                 │
│ Error:    ┌─────────────────────┐  (Red border)               │
│          │ Invalid input       │                              │
│          └─────────────────────┘                              │
│          ⚠️ This field is required                             │
│                                                                 │
│ Disabled: ┌─────────────────────┐  (Grayed out)               │
│          │ Disabled field      │                              │
│          └─────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## Web3 Component Wireframes

### Wallet Connection Component
```
┌─────────────────────────────────────────────────────────────────┐
│ WALLET CONNECTION VARIANTS                                      │
├─────────────────────────────────────────────────────────────────┤
│ Full Connection Widget:                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔗 Wallet Connected                                         │ │
│ │ alice.sol                                                   │ │
│ │ 4vJ9...bkLKi                                               │ │
│ │ 💰 2.45 SOL  |  🏆 1,247 PFM  |  🟢 Mainnet              │ │
│ │ [Disconnect] [Portfolio] [Settings]                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Compact Widget:                                                 │
│ ┌─────────────────────────────────────┐                        │
│ │ 🔗 alice.sol  💰 2.45 SOL  🟢     │                        │
│ └─────────────────────────────────────┘                        │
│                                                                 │
│ Connection Button:                                              │
│ [  🔗 Connect Wallet  ]                                        │
│                                                                 │
│ Disconnected State:                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Wallet Not Connected                                     │ │
│ │ Connect your wallet to participate in voting               │ │
│ │ [Connect Wallet] [Learn More]                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Transaction Status Component
```
┌─────────────────────────────────────────────────────────────────┐
│ TRANSACTION STATUS VARIANTS                                     │
├─────────────────────────────────────────────────────────────────┤
│ Pending Transaction:                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⏳ Transaction Pending                                      │ │
│ │ Submitting your vote to the blockchain...                  │ │
│ │ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░ 67%            │ │
│ │ Estimated time: 30 seconds                                 │ │
│ │ Gas fee: ~0.00025 SOL (~$0.01)                            │ │
│ │ Tx: 5K8j...mN9p [View on Explorer]                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Success Transaction:                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✅ Transaction Confirmed                                    │ │
│ │ Your vote has been successfully recorded!                   │ │
│ │ Block: 234,567,891 | Confirmations: 32                    │ │
│ │ Total time: 2.3 seconds                                    │ │
│ │ [View Results] [Close]                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Failed Transaction:                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ❌ Transaction Failed                                       │ │
│ │ Unable to submit vote. Please try again.                   │ │
│ │ Error: Insufficient SOL for transaction fee               │ │
│ │ [Retry] [Add SOL] [Contact Support]                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Container Component Wireframes

### Service Health Indicator
```
┌─────────────────────────────────────────────────────────────────┐
│ CONTAINER SERVICE STATUS                                        │
├─────────────────────────────────────────────────────────────────┤
│ Full Health Dashboard:                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🐳 Container Services Status                                │ │
│ │ ┌─────────────────┬─────────────┬─────────────┬───────────┐ │ │
│ │ │ Service         │ Status      │ Latency     │ Updated   │ │ │
│ │ ├─────────────────┼─────────────┼─────────────┼───────────┤ │ │
│ │ │ 🟢 Backend API  │ Healthy     │ 45ms        │ 1m ago    │ │ │
│ │ │ 🟢 Database     │ Healthy     │ 12ms        │ 1m ago    │ │ │
│ │ │ 🟢 Redis Cache  │ Healthy     │ 8ms         │ 1m ago    │ │ │
│ │ │ 🟡 Solana RPC   │ Degraded    │ 180ms       │ 30s ago   │ │ │
│ │ └─────────────────┴─────────────┴─────────────┴───────────┘ │ │
│ │ [Refresh] [View Logs] [Configure Alerts]                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Compact Indicator:                                              │
│ ┌─────────────────────────────────────┐                        │
│ │ 🟢 All Services Online              │                        │
│ │ API: 45ms | Blockchain: 120ms       │                        │
│ │ [Details ▼]                         │                        │
│ └─────────────────────────────────────┘                        │
│                                                                 │
│ Minimal Status:                                                 │
│ 🟢 3/4 Services Healthy                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Visualization Wireframes

### Chart Components
```
┌─────────────────────────────────────────────────────────────────┐
│ VOTING RESULTS CHARTS                                           │
├─────────────────────────────────────────────────────────────────┤
│ Pie Chart (Vote Distribution):                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │        Vote Results: DeFi Protocol Upgrade                 │ │
│ │                                                             │ │
│ │         ████████████████████████████████                   │ │
│ │       ██████████████████████████████████████               │ │
│ │     ████████████████████████████████████████████           │ │
│ │   ██████████████████████████████████████████████████       │ │
│ │  ████████████████████████████████████████████████████      │ │
│ │ ███████████████████████████■■■■■■■■■■■■■■■■■■■■■■■■■■■■      │ │
│ │ ██████████████████████████■■■■■■■■■■■■■■■■■■■■■■■■■■■■■      │ │
│ │ ██████████████████████████■■■■■■■■■■■■■■■■■■■■■■■■■■■■■      │ │
│ │  ████████████████████████■■■■■■■■■■■■■■■■■■■■■■■■■■■■■      │ │
│ │    ██████████████████████■■■■■■■■■■■■■■■■■■■■■■■■■■■        │ │
│ │      ████████████████████■■■■■■■■■■■■■■■■■■■■■■■            │ │
│ │                                                             │ │
│ │ ████ YES (69% - 170 votes)  ■■■■ NO (31% - 77 votes)      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Bar Chart (Community Activity):                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │     Monthly Community Participation                         │ │
│ │                                                             │ │
│ │ 100%│                                                       │ │
│ │     │     ████                                              │ │
│ │  75%│   ██████                                              │ │
│ │     │ ████████ ████                                         │ │
│ │  50%│ ████████ ████ ████                                    │ │
│ │     │ ████████ ████ ████ ████                               │ │
│ │  25%│ ████████ ████ ████ ████ ████                          │ │
│ │     │ ████████ ████ ████ ████ ████ ████                     │ │
│ │   0%└─Jan──Feb──Mar──Apr──May──Jun──                        │ │
│ │                                                             │ │
│ │ Average: 73% | Trend: ↗️ +5% | Peak: May (89%)            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Progress Indicators
```
┌─────────────────────────────────────────────────────────────────┐
│ PROGRESS INDICATORS                                             │
├─────────────────────────────────────────────────────────────────┤
│ Voting Progress:                                                │
│ Participation: 89% (223/250 members)                           │
│ ████████████████████████████████████████████████████████░░░░░░  │
│                                                                 │
│ Loading Progress:                                               │
│ Loading community data... 67%                                  │
│ ████████████████████████████████████████████████░░░░░░░░░░░░░░  │
│                                                                 │
│ Step Progress:                                                  │
│ ● Connect Wallet → ● Set Preferences → ◯ Join Community        │
│ Step 2 of 3                                                    │
│                                                                 │
│ Circular Progress:                                              │
│        ██████████                                              │
│      ██████████████                                            │
│    ████████████████                                            │
│   ██████████████████                                           │
│  ████████████████████    87%                                   │
│  ████████████████████                                          │
│   ██████████████████                                           │
│    ████████████████                                            │
│      ██████████████                                            │
│        ██████████                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Layout Component Wireframes

### Page Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ [Logo] Page Title            [🔍 Search] [🔔] [👤] [🔗]        │
├─────────────────────────────────────────────────────────────────┤
│ NAVIGATION                                                      │
│ 🏠 Dashboard | 🏘️ Communities | 🗳️ Voting | 📊 Results | 👤   │
├─────────────────────────────────────────────────────────────────┤
│ BREADCRUMBS                                                     │
│ Dashboard > Communities > DeFi Traders                         │
├─────────────────────────────────────────────────────────────────┤
│ PAGE CONTENT                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                    MAIN CONTENT AREA                        │ │
│ │                                                             │ │
│ │                  [Page content here]                       │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER                                                          │
│ © 2024 PFM | Privacy | Terms | Support | Status: 🟢           │
└─────────────────────────────────────────────────────────────────┘
```

### Card Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ CARD COMPONENTS                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Basic Card:                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Card Title                               [Action Button]    │ │
│ │ Card subtitle or description                                │ │
│ │                                                             │ │
│ │ Card content area with main information                     │ │
│ │ and interactive elements                                    │ │
│ │                                                             │ │
│ │ [Secondary Action] [Primary Action]                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Stats Card:                                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📊 Community Growth                              ↗️ +15%    │ │
│ │                                                             │ │
│ │            247                                              │ │
│ │         Total Members                                       │ │
│ │                                                             │ │
│ │    ████████████████████████████████████████████████████     │ │
│ │ Jan ████████████████████████████████████████████████████ Dec │ │
│ │                                                             │ │
│ │ +23 new members this month                                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

This design system wireframe provides the foundation for consistent, accessible, and container-aware components across both admin and member portals. 