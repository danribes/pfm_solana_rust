# Member Dashboard Wireframe

## Main Dashboard Layout

### Desktop Layout (1200px+)
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER                                                                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [PFM Logo] Member Portal         [🔍 Search communities...]     [🔔 3] [👤 alice.sol ▼] [🔗]  │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NAVIGATION                                                                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Dashboard  |  🏘️ Communities  |  🗳️ Voting  |  📊 Results  |  👤 Profile                    │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬─────────────────────────────────────────────────────────────────────────────────┐
│              │ MAIN CONTENT AREA                                                               │
│  QUICK NAV   │                                                                                 │
│              │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ My Activity: │ │                           WELCOME BACK, ALICE                                │ │
│ • 3 Active   │ │                                                                             │ │
│   Votes      │ │ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┐ │ │
│ • 2 New      │ │ │     My      │   Active    │   Voting    │    My       │    Community    │ │ │
│   Communities│ │ │ Communities │   Votes     │ Power Score │ Reputation  │   Contributions │ │ │
│ • 1 Pending  │ │ │             │             │             │             │                 │ │ │
│   Approval   │ │ │      5      │      3      │    8.4/10   │    92/100   │      287        │ │ │
│              │ │ │  📈 +1 new  │  ⏰ 2 end   │  🔥 Top 15% │  ⭐ Expert  │   🏆 Top 10%    │ │ │
│ Trending:    │ │ │             │   today     │             │             │                 │ │ │
│ • DeFi       │ │ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘ │ │
│   Protocols  │ │                                                                             │ │
│ • NFT Gaming │ └─────────────────────────────────────────────────────────────────────────────┘ │
│ • Web3 Social│                                                                                 │
│              │ ┌─────────────────────────────────┬───────────────────────────────────────────┐ │
│ Quick Actions│ │        ACTIVE VOTING            │             MY COMMUNITIES                │ │
│ [🗳️ Vote]    │ ├─────────────────────────────────┼───────────────────────────────────────────┤ │
│ [🏘️ Browse]  │ │                                 │                                           │ │
│ [👥 Invite]   │ │ 🗳️ DeFi Protocol Upgrade        │ 🟢 DeFi Traders                          │ │
│              │ │    Voting ends in 23h 15m       │    247 members • Joined Jan 15           │ │
│ Settings:    │ │    Your vote: ✅ YES             │    Last activity: Voted 2h ago           │ │
│ [🔔 Alerts]  │ │    Current: 67% YES (165 votes) │    [💬 Discuss] [📊 Stats] [⚙️ Settings] │ │
│ [👤 Profile] │ │                                 │                                           │ │
│              │ │ 🗳️ Community Fee Structure      │ 🟢 GameFi Union                          │ │
│              │ │    Voting ends in 2d 8h         │    89 members • Joined Dec 20            │ │
│              │ │    Your vote: ⏳ NOT YET        │    Last activity: Comment 1d ago         │ │
│              │ │    Current: 45% YES (89 votes)  │    [💬 Discuss] [📊 Stats] [⚙️ Settings] │ │
│              │ │                                 │                                           │ │
│              │ │ 🗳️ Governance Token Launch      │ 🟡 NFT Creators Hub                      │ │
│              │ │    Voting ends tomorrow         │    45 members • Pending approval         │ │
│              │ │    Your vote: ❌ NO             │    Applied 3 days ago                    │ │
│              │ │    Current: 78% YES (201 votes) │    [📋 Check Status] [❌ Cancel]         │ │
│              │ │                                 │                                           │ │
│              │ │ [View All Active Votes →]       │ [Discover Communities →]                 │ │
│              │ └─────────────────────────────────┴───────────────────────────────────────────┘ │
│              │                                                                                 │
│              │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│              │ │                              RECENT ACTIVITY                                 │ │
│              │ ├─────────────────────────────────────────────────────────────────────────────┤ │
│              │ │                                                                             │ │
│              │ │ 🗳️ 2h ago - Voted YES on "DeFi Protocol Upgrade" in DeFi Traders           │ │
│              │ │ 💬 1d ago - Commented on "Yield Farming Strategy" discussion                │ │
│              │ │ 👥 3d ago - Applied to join NFT Creators Hub community                      │ │
│              │ │ 🗳️ 1w ago - Voted NO on "Fee Structure Change" in GameFi Union             │ │
│              │ │ 🏆 1w ago - Reached "Expert" reputation level (92/100)                      │ │
│              │ │ 🎉 2w ago - Joined GameFi Union community                                   │ │
│              │ │                                                                             │ │
│              │ │ [View Full Activity History →]                                             │ │
│              │ └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────┤                                                                                 │
               │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
               │ │                            RECOMMENDATIONS                                   │ │
               │ ├─────────────────────────────────────────────────────────────────────────────┤ │
               │ │                                                                             │ │
               │ │ 🎯 Recommended for You:                                                     │ │
               │ │                                                                             │ │
               │ │ 🏘️ Web3 Learning Circle - "Learn DeFi basics with other newcomers"        │ │
               │ │    23 members • Education • Match: 94%    [Join Community] [Learn More]    │ │
               │ │                                                                             │ │
               │ │ 🏘️ Solana Builders DAO - "Build the future of Solana ecosystem"           │ │
               │ │    156 members • Development • Match: 87%  [Join Community] [Learn More]   │ │
               │ │                                                                             │ │
               │ │ 🗳️ Trending Vote: "Should we implement governance staking?"                │ │
               │ │    In Web3 Governance Hub • 234 votes • 89% participation                  │ │
               │ │    [Vote Now] [Join Community First]                                       │ │
               │ │                                                                             │ │
               │ └─────────────────────────────────────────────────────────────────────────────┘ │
               └─────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1024px)
```
┌─────────────────────────────────────────────────────────────────┐
│ [PFM] Member Portal          [🔍 Search]     [🔔] [👤] [🔗]    │
├─────────────────────────────────────────────────────────────────┤
│ 🏠 Dashboard | 🏘️ Communities | 🗳️ Voting | 📊 Results | 👤   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Welcome Back, Alice                                             │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┬─────────────────────┐ │
│ │     My      │   Active    │   Voting    │    Reputation       │ │
│ │ Communities │   Votes     │   Power     │      Score          │ │
│ │      5      │      3      │   8.4/10    │      92/100         │ │
│ │  📈 +1 new  │  ⏰ 2 end   │  🔥 Top 15% │    ⭐ Expert       │ │
│ └─────────────┴─────────────┴─────────────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Active Voting (3)                          [View All →]        │
├─────────────────────────────────────────────────────────────────┤
│ 🗳️ DeFi Protocol Upgrade                                       │
│ Ends in 23h 15m • Your vote: ✅ YES • 67% YES                │
│ [Change Vote] [Discuss] [Results]                             │
├─────────────────────────────────────────────────────────────────┤
│ 🗳️ Community Fee Structure                                     │
│ Ends in 2d 8h • ⏳ NOT VOTED YET • 45% YES                   │
│ [Vote Now] [Learn More] [Discuss]                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ My Communities (5)                         [Browse More →]     │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🟢 DeFi Traders                                           │ │
│ │ 247 members • Last: Voted 2h ago                         │ │
│ │ [💬 Discuss] [📊 Stats]                                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🟢 GameFi Union                                           │ │
│ │ 89 members • Last: Comment 1d ago                        │ │
│ │ [💬 Discuss] [📊 Stats]                                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────────────────────────┐
│ ☰ [PFM] Member Portal        [🔔 3] [👤]   │
├─────────────────────────────────────────────┤
│ 👋 Welcome back, Alice                      │
│ 🔗 alice.sol • 2.45 SOL • 🟢 Connected     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Quick Overview                              │
├─────────────────────────────────────────────┤
│ ┌─────────────┬─────────────────────────────┐ │
│ │     My      │        Active Votes         │ │
│ │ Communities │                             │ │
│ │      5      │            3                │ │
│ │  📈 +1 new  │       ⏰ 2 end today       │ │
│ └─────────────┴─────────────────────────────┘ │
│ ┌─────────────┬─────────────────────────────┐ │
│ │   Voting    │       Reputation            │ │
│ │   Power     │         Score               │ │
│ │   8.4/10    │        92/100               │ │
│ │  🔥 Top 15% │       ⭐ Expert            │ │
│ └─────────────┴─────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🗳️ Active Votes (3)              [View All] │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 🗳️ DeFi Protocol Upgrade               │ │
│ │ Ends in 23h 15m                        │ │
│ │ Your vote: ✅ YES • 67% YES            │ │
│ │ [View Details] [Change Vote]           │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🗳️ Community Fee Structure             │ │
│ │ Ends in 2d 8h                          │ │
│ │ ⏳ You haven't voted yet               │ │
│ │ [Vote Now] [Learn More]                │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🗳️ Governance Token Launch             │ │
│ │ Ends tomorrow                          │ │
│ │ Your vote: ❌ NO • 78% YES             │ │
│ │ [View Details] [Change Vote]           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🏘️ My Communities (5)         [Browse More] │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 🟢 DeFi Traders                         │ │
│ │ 247 members                            │ │
│ │ Last: Voted 2h ago                     │ │
│ │ [Open] [Discuss]                       │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🟢 GameFi Union                         │ │
│ │ 89 members                             │ │
│ │ Last: Comment 1d ago                   │ │
│ │ [Open] [Discuss]                       │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🟡 NFT Creators Hub                     │ │
│ │ 45 members                             │ │
│ │ Pending approval • Applied 3d ago      │ │
│ │ [Check Status] [Cancel]                │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [+ Join New Community]                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🎯 Recommended for You                      │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 🏘️ Web3 Learning Circle                │ │
│ │ 23 members • Education                  │ │
│ │ Match: 94% ⭐⭐⭐⭐⭐                    │ │
│ │ [Join] [Learn More]                    │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🗳️ Trending: Governance Staking        │ │
│ │ Web3 Governance Hub • 234 votes        │ │
│ │ 89% participation • Ends in 5 days     │ │
│ │ [Join & Vote] [Learn More]             │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

Bottom Navigation:
┌─────────────────────────────────────────────┐
│ 🏠 Home | 🏘️ Browse | 🗳️ Vote | 👤 Profile │
└─────────────────────────────────────────────┘
```

## Notification Center

### Notification Panel (Desktop)
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔔 Notifications (3 new)                              [⚙️] [✗] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🔴 NEW                                                          │
│ 🗳️ Voting deadline reminder                                    │
│ "DeFi Protocol Upgrade" voting ends in 2 hours                 │
│ DeFi Traders • 2 min ago                                       │
│ [Vote Now] [Dismiss] [Snooze 1h]                              │
├─────────────────────────────────────────────────────────────────┤
│ 🔴 NEW                                                          │
│ 👥 Community invitation                                         │
│ You've been invited to join "Solana Builders DAO"              │
│ Invited by bob.sol • 15 min ago                                │
│ [Accept] [Decline] [View Community]                            │
├─────────────────────────────────────────────────────────────────┤
│ 🔴 NEW                                                          │
│ ✅ Application approved                                         │
│ Welcome to NFT Creators Hub! You're now a member               │
│ NFT Creators Hub • 1 hour ago                                  │
│ [Join Discussion] [View Community] [Dismiss]                   │
├─────────────────────────────────────────────────────────────────┤
│ 🗳️ Voting results available                                    │
│ "Community Fee Structure" voting completed - Result: REJECTED  │
│ GameFi Union • 3 hours ago                                     │
│ [View Results] [Discussion] [Dismiss]                          │
├─────────────────────────────────────────────────────────────────┤
│ 📊 Weekly summary ready                                        │
│ Your activity report for Feb 12-18 is now available            │
│ PFM Platform • 1 day ago                                       │
│ [View Report] [Download] [Dismiss]                             │
├─────────────────────────────────────────────────────────────────┤
│                            [View All Notifications]            │
│                         [Mark All as Read]                     │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Notification View
```
┌─────────────────────────────────────────────┐
│ ← Notifications (3 new)                    │
├─────────────────────────────────────────────┤
│ 🔴 🗳️ Voting deadline reminder             │
│ "DeFi Protocol Upgrade" ends in 2h         │
│ DeFi Traders • 2 min ago                   │
│ [Vote Now] [Dismiss]                       │
├─────────────────────────────────────────────┤
│ 🔴 👥 Community invitation                  │
│ Invited to "Solana Builders DAO"           │
│ From bob.sol • 15 min ago                  │
│ [Accept] [Decline]                         │
├─────────────────────────────────────────────┤
│ 🔴 ✅ Application approved                  │
│ Welcome to NFT Creators Hub!               │
│ 1 hour ago                                 │
│ [Join Discussion] [Dismiss]                │
├─────────────────────────────────────────────┤
│ 🗳️ Voting results: REJECTED                │
│ "Community Fee Structure"                  │
│ GameFi Union • 3 hours ago                 │
│ [View Results] [Dismiss]                   │
└─────────────────────────────────────────────┘
```

## Wallet Integration Widget

### Wallet Connection Panel
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔗 Wallet Connection                                       [✗] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Connected Wallet:                                               │
│ 👤 alice.sol                                                   │
│ 📍 4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi                 │
│                                                                 │
│ Balance Overview:                                               │
│ 💰 2.45 SOL ($89.23 USD)                                       │
│ 🏆 Governance Tokens: 1,247 PFM                                │
│ 🎭 NFTs: 12 collections                                        │
│                                                                 │
│ Network Status:                                                 │
│ 🟢 Solana Mainnet • Block: 234,567,890                        │
│ ⚡ Transaction Fee: ~0.00025 SOL                               │
│ 📡 RPC Latency: 120ms                                          │
│                                                                 │
│ Recent Transactions:                                            │
│ 🗳️ Vote submission • 2h ago • -0.00025 SOL                    │
│ 🏘️ Community join • 1d ago • -0.0005 SOL                      │
│ 💰 Token reward • 3d ago • +15 PFM                            │
│                                                                 │
│ [View Full Portfolio] [Transaction History] [Disconnect]       │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Wallet Widget
```
┌─────────────────────────────────────────────┐
│ 🔗 alice.sol                               │
│ 💰 2.45 SOL • 🏆 1,247 PFM                │
│ 🟢 Mainnet • Fee: ~0.00025 SOL            │
│ [Portfolio] [History] [Settings]           │
└─────────────────────────────────────────────┘
```

## Container Health Monitoring

### Service Status Widget
```
┌─────────────────────────────────────────────┐
│ 🐳 Container Services                       │
├─────────────────────────────────────────────┤
│ 🟢 Backend API          45ms               │
│ 🟢 Solana RPC          120ms               │
│ 🟢 Database            12ms                │
│ 🟢 Redis Cache          8ms                │
│                                             │
│ All services operational                    │
│ [View Details] [Refresh]                   │
└─────────────────────────────────────────────┘
```

## Progressive Web App Features

### Install Prompt
```
┌─────────────────────────────────────────────┐
│ 📱 Install PFM Member App                   │
├─────────────────────────────────────────────┤
│ Get faster access and offline support      │
│                                             │
│ ✅ Instant loading                          │
│ ✅ Offline voting (sync when online)       │
│ ✅ Push notifications                       │
│ ✅ Native app experience                    │
│                                             │
│ [Install App] [Not Now]                    │
└─────────────────────────────────────────────┘
```

### Offline Mode Indicator
```
┌─────────────────────────────────────────────┐
│ 📶 You're offline                           │
│ Some features may be limited               │
│ Changes will sync when you're back online  │
│ [View Cached Data] [Retry Connection]      │
└─────────────────────────────────────────────┘
```

## Accessibility Features

### Screen Reader Navigation
- **Landmarks**: Main navigation, content areas, sidebars properly labeled
- **Headings**: Hierarchical heading structure (h1-h6)
- **Lists**: Proper list markup for communities, votes, activities
- **Forms**: Descriptive labels and error messages
- **Images**: Alt text for all meaningful images and icons

### Keyboard Navigation
- **Tab Order**: Logical flow through all interactive elements
- **Skip Links**: "Skip to main content" and "Skip to navigation"
- **Focus Indicators**: Clear visual focus indicators
- **Shortcuts**: Alt+1 (Dashboard), Alt+2 (Communities), Alt+3 (Voting)

### Voice Control Support
- Voice commands for common actions: "Vote yes", "Join community", "Show notifications"
- Voice navigation: "Go to dashboard", "Open voting", "Show my communities"

This member dashboard wireframe provides a comprehensive, accessible, and engaging interface that encourages community participation while maintaining excellent usability across all devices and environments. 