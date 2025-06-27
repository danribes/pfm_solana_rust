# Community Management Wireframe

## Community List View

### Desktop Layout
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Communities Management                                                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ← Dashboard                                              [🔍 Search...] [+ New Community] [🔧] │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ FILTERS & ACTIONS                                                                              │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Status: [All ▼] | Members: [Any ▼] | Created: [Anytime ▼] | [Clear Filters] | [📁 Export CSV] │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ COMMUNITY LIST                                                                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Name                    Status      Members   Votes   Last Activity      Actions               │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 DeFi Traders Community  Active     247      12     2 hours ago        [View] [Edit] [⚙️]    │
│    "Community for DeFi trading strategies and news"                                           │
│    Created: Jan 15, 2024 | Admin: alice.sol                                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟡 NFT Creators Hub        Pending     45       3     1 day ago          [View] [Edit] [⚙️]    │
│    "Platform for NFT artists and collectors"                                                  │
│    Created: Feb 3, 2024 | Admin: bob.eth                                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 GameFi Union           Active      89       7     30 minutes ago      [View] [Edit] [⚙️]    │
│    "Gaming and DeFi intersection community"                                                   │
│    Created: Dec 20, 2023 | Admin: charlie.sol                                                │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔴 Archived DAO           Inactive    12       0     2 weeks ago         [View] [Edit] [⚙️]    │
│    "Previously active governance community"                                                   │
│    Created: Nov 5, 2023 | Admin: david.eth                                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟡 Web3 Learning Circle   Review      23       1     3 days ago          [View] [Edit] [⚙️]    │
│    "Educational community for Web3 newcomers"                                                 │
│    Created: Feb 10, 2024 | Admin: eve.sol                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PAGINATION & BULK ACTIONS                                                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ☐ Select All (5 communities)         [Bulk Edit] [Export Selected] [Archive Selected]       │
│                                                      Showing 1-5 of 24  [←] 1 2 3 4 5 [→]   │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Community Detail View

### Main Information Panel
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Communities                                              [Edit] [Settings] [Archive] │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 DeFi Traders Community                                                [Status: Active]     │
│ "A vibrant community for DeFi trading strategies, market analysis, and educational content"   │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────────────┐
│   Created       │   Members       │   Total Votes   │  Participation  │      Growth Rate        │
│                 │                 │                 │                 │                         │
│ Jan 15, 2024    │      247        │       45        │      78%        │     +15% (30 days)     │
│ (45 days ago)   │   +12 this week │  12 active now  │   Above avg     │      📈 Trending       │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ QUICK ACTIONS                                                                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [👥 Manage Members] [🗳️ Create Vote] [📊 View Analytics] [💬 Send Announcement] [⚙️ Settings] │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Tabs Section
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📊 Overview | 👥 Members | 🗳️ Votes | 📈 Analytics | ⚙️ Settings | 💬 Activity               │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│ ┌─────────────────────────────────┬──────────────────────────────────────────────────────────┐ │
│ │        RECENT ACTIVITY          │                COMMUNITY HEALTH                          │ │
│ ├─────────────────────────────────┼──────────────────────────────────────────────────────────┤ │
│ │                                 │                                                          │ │
│ │ 🗳️ Budget Proposal 2024         │  Member Satisfaction: ████████████ 89%                  │ │
│ │    89% participation (2d ago)   │  Activity Level:      ██████████   78%                  │ │
│ │    ✅ Passed with 156 votes     │  Growth Rate:         ███████████  85%                  │ │
│ │                                 │  Retention Rate:      ██████████   82%                  │ │
│ │ 👤 alice.sol joined             │                                                          │ │
│ │    5 hours ago                  │  📊 Overall Health Score: 84/100                       │ │
│ │    Approved automatically       │     🟢 Excellent                                        │ │
│ │                                 │                                                          │ │
│ │ 🗳️ Governance Rule Change       │  📈 Trends (30 days):                                   │ │
│ │    Completed 1 week ago         │  • New members: +12 (+5%)                               │ │
│ │    ✅ Passed with 67% support   │  • Active voters: +8 (+7%)                              │ │
│ │                                 │  • Posts/discussions: +45 (+23%)                        │ │
│ │ 👤 bob.eth promoted to          │                                                          │ │
│ │    Moderator role               │  ⚠️ Alerts:                                              │ │
│ │    By community vote            │  • None - Community performing well                     │ │
│ │                                 │                                                          │ │
│ │ [View All Activity →]           │  [Generate Health Report →]                             │ │
│ └─────────────────────────────────┴──────────────────────────────────────────────────────────┘ │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                               MEMBER DISTRIBUTION                                           │ │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                             │ │
│ │ ┌─────────────────────┬─────────────────────┬───────────────────────────────────────────────┐ │ │
│ │ │     By Role         │    By Activity      │           By Join Date                        │ │ │
│ │ │                     │                     │                                               │ │ │
│ │ │ Admin:       1      │ Highly Active: 45   │  This Week:  12  ████                        │ │ │
│ │ │ Moderators:  3      │ Active:       89    │  This Month: 34  ██████████                  │ │ │
│ │ │ Members:    243     │ Occasional:   67    │  Last Month: 56  ███████████████             │ │ │
│ │ │                     │ Inactive:     46    │  Older:     145  ████████████████████████    │ │ │
│ │ │     ██████          │                     │                                               │ │ │
│ │ │     ███████         │     ██████          │  📊 Growth is accelerating                    │ │ │
│ │ │ ███████████████     │ ███████████████     │     +45% vs last month                       │ │ │
│ │ └─────────────────────┴─────────────────────┴───────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Community Creation Modal

### Step 1: Basic Information
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Create New Community                                                               [✗]  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                Step 1 of 4: Basic Information                           │
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 25% │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ Community Name: *                                                                       │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ DeFi Innovation Hub                                                                 │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│ ⚠️ Name must be unique (checking availability...)                                       │
│                                                                                         │
│ Description: *                                                                          │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ A community focused on innovative DeFi protocols, yield farming strategies,        │ │
│ │ and cutting-edge financial technology discussions. Join us to explore the          │ │
│ │ future of decentralized finance.                                                   │ │
│ │                                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│ Characters: 234/500                                                                     │
│                                                                                         │
│ Category: *                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ DeFi & Trading ▼                                                                   │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
│ Community Image:                                                                        │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [📁 Upload Image] or [🔗 Enter URL]                                                │ │
│ │ Recommended: 512x512px, max 2MB (JPG, PNG, WebP)                                  │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ☐ Make community discoverable in public directory                                   │ │
│ │ ☐ Allow members to invite others                                                    │ │
│ │ ☐ Enable community announcements                                                    │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                    [Cancel] [Next: Settings →]                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Step 2: Governance Settings
```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Create New Community                                                               [✗]  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                              Step 2 of 4: Governance Settings                           │
│ ████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 50% │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ Membership Approval:                                                                    │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ◉ Manual approval required (recommended)                                           │ │
│ │ ○ Automatic approval for all requests                                              │ │
│ │ ○ Token-gated (require specific token ownership)                                   │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
│ Voting Duration:                                                                        │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Default: [7] days     Range: 1-30 days                                            │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
│ Minimum Participation:                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Quorum: [50]% of members must vote for proposal to be valid                       │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
│ Voting Power:                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ◉ Equal voting power (1 member = 1 vote)                                          │ │
│ │ ○ Token-weighted voting (votes based on token holdings)                           │ │
│ │ ○ Reputation-based (votes based on community activity)                            │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
│ Proposal Creation:                                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ◉ Any member can create proposals                                                  │ │
│ │ ○ Only moderators and admins                                                       │ │
│ │ ○ Members with minimum [10]% support can create proposals                         │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                 [← Back] [Cancel] [Next: Roles →]                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Community Settings Panel

### General Settings Tab
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Community Settings: DeFi Traders Community                                                    │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ General | Governance | Members | Integrations | Advanced                                       │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                               BASIC INFORMATION                                             │ │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                             │ │
│ │ Community Name:                                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ DeFi Traders Community                                                                  │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                                             │ │
│ │ Description:                                                                                │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ A vibrant community for DeFi trading strategies, market analysis, and                  │ │ │
│ │ │ educational content. Join experienced traders and newcomers alike.                     │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                                             │ │
│ │ Category: [DeFi & Trading ▼]     Visibility: [Public ▼]                                   │ │
│ │                                                                                             │ │
│ │ Community Avatar:                                                                           │ │
│ │ ┌───────────────┬─────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ [   Avatar   ]│ [📁 Upload New] [🔗 Use URL] [🗑️ Remove]                               │ │ │
│ │ │ [   Image    ]│ Current: defi-logo.png (uploaded Jan 15, 2024)                        │ │ │
│ │ │   512x512    │ Recommended: 512x512px, max 2MB                                       │ │ │
│ │ └───────────────┴─────────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                COMMUNITY FEATURES                                           │ │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                             │ │
│ │ ☑️ Allow member invitations          ☑️ Enable community announcements                      │ │
│ │ ☑️ Public directory listing          ☐ Require email verification                          │ │
│ │ ☑️ Member directory visible          ☑️ Allow profile customization                        │ │
│ │ ☐ Disable new member applications    ☐ Enable community chat                              │ │
│ │                                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                 NOTIFICATION SETTINGS                                       │ │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                             │ │
│ │ Admin Notifications:                                                                        │ │
│ │ ☑️ New member applications           ☑️ Community milestones                               │ │
│ │ ☑️ Voting activity                   ☐ Weekly activity reports                             │ │
│ │ ☑️ Member violations                 ☑️ System alerts                                       │ │
│ │                                                                                             │ │
│ │ Member Notifications (Default):                                                             │ │
│ │ ☑️ New votes                         ☐ Daily digest                                        │ │
│ │ ☑️ Community announcements           ☑️ Direct mentions                                     │ │
│ │ ☐ All community activity            ☐ Weekly summary                                       │ │
│ │                                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                     [Save Changes] [Cancel]                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Mobile Community Management

### Mobile List View
```
┌─────────────────────────────────────────────┐
│ ☰ Communities                   [🔍] [+]   │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 🟢 DeFi Traders Community              │ │
│ │ 247 members • 12 active votes          │ │
│ │ Last activity: 2 hours ago             │ │
│ │                         [View] [⚙️]    │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🟡 NFT Creators Hub                     │ │
│ │ 45 members • 3 active votes            │ │
│ │ Last activity: 1 day ago               │ │
│ │                         [View] [⚙️]    │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🟢 GameFi Union                         │ │
│ │ 89 members • 7 active votes            │ │
│ │ Last activity: 30 min ago              │ │
│ │                         [View] [⚙️]    │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Load More Communities...]                  │
└─────────────────────────────────────────────┘
```

### Mobile Detail View
```
┌─────────────────────────────────────────────┐
│ ← DeFi Traders                       [⚙️]  │
├─────────────────────────────────────────────┤
│ 🟢 Active • 247 members                    │
│ 12 active votes • 78% participation        │
├─────────────────────────────────────────────┤
│ [👥 Members] [🗳️ Votes] [📊 Analytics]     │
├─────────────────────────────────────────────┤
│ Recent Activity:                            │
│                                             │
│ 🗳️ Budget Proposal 2024                    │
│ 89% participation • 2 days ago             │
│                                             │
│ 👤 alice.sol joined                         │
│ 5 hours ago                                 │
│                                             │
│ 🗳️ Governance Change                        │
│ Completed • 1 week ago                      │
│                                             │
│ [View All Activity]                         │
├─────────────────────────────────────────────┤
│ [+ Create Vote] [💬 Announce] [📊 Report] │
└─────────────────────────────────────────────┘
```

## Accessibility & Interaction Notes

### Keyboard Navigation
- **Tab Order**: Community list → Filters → Action buttons → Pagination
- **Arrow Keys**: Navigate through community list items
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and dropdowns

### Screen Reader Support
- **List Structure**: Proper list markup for community list
- **Status Announcements**: Read status changes aloud
- **Progress Indicators**: Announce creation step progress
- **Error Messages**: Immediate announcement of validation errors

### Interactive Elements
- **Hover States**: Subtle background color change on community rows
- **Loading States**: Skeleton animation while data loads
- **Error States**: Clear error messages with retry options
- **Success Feedback**: Toast notifications for successful actions

### Performance Optimizations
- **Virtual Scrolling**: For large community lists
- **Image Lazy Loading**: Load community avatars as needed
- **Pagination**: Server-side pagination for better performance
- **Search Debouncing**: Reduce API calls during search typing

This community management wireframe provides a comprehensive interface for administrators to efficiently manage communities, from creation to ongoing administration, with strong accessibility and mobile support. 