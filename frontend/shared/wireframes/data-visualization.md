# Data Visualization Component Wireframes

## Chart Components

### Voting Results Charts
```
┌─────────────────────────────────────────────────────────────────┐
│ PIE CHART - VOTE DISTRIBUTION                                   │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ DeFi Protocol Upgrade Results                         [⚙️] │ │
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
│ │ Legend:                                                     │ │
│ │ ████ YES (69% - 170 votes)  ■■■■ NO (31% - 77 votes)      │ │
│ │                                                             │ │
│ │ Total Votes: 247 | Participation: 100%                    │ │
│ │ [📊 View Details] [📤 Export] [🔄 Refresh]                │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ BAR CHART - COMMUNITY PARTICIPATION                             │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Monthly Voting Participation                          [⚙️] │ │
│ │                                                             │ │
│ │ 100%│                                                       │ │
│ │     │                   ████                                │ │
│ │  75%│              ████ ████                                │ │
│ │     │         ████ ████ ████ ████                           │ │
│ │  50%│    ████ ████ ████ ████ ████                           │ │
│ │     │    ████ ████ ████ ████ ████ ████                      │ │
│ │  25%│ ████ ████ ████ ████ ████ ████ ████                   │ │
│ │     │ ████ ████ ████ ████ ████ ████ ████ ████               │ │
│ │   0%└─Jan──Feb──Mar──Apr──May──Jun──Jul──Aug─               │ │
│ │                                                             │ │
│ │ Average: 73% | Trend: ↗️ +5% | Peak: June (94%)           │ │
│ │ [📈 View Trends] [📋 Export Data] [⚙️ Configure]          │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LINE CHART - COMMUNITY GROWTH                                   │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Community Membership Growth                           [⚙️] │ │
│ │                                                             │ │
│ │ 300│                                                        │ │
│ │    │                                            ●●●         │ │
│ │ 250│                                      ●●●●●●●●●         │ │
│ │    │                               ●●●●●●●●●●●●●●●         │ │
│ │ 200│                         ●●●●●●●●●●●●●●●●●●●●●         │ │
│ │    │                   ●●●●●●●●●●●●●●●●●●●●●●●●●●●         │ │
│ │ 150│            ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●         │ │
│ │    │      ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●         │ │
│ │ 100│●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●         │ │
│ │    │                                                        │ │
│ │  50└─Jan──Feb──Mar──Apr──May──Jun──Jul──Aug──Sep─           │ │
│ │                                                             │ │
│ │ Growth Rate: +15% monthly | New Members: 47 this month     │ │
│ │ [📊 Breakdown] [🎯 Projections] [📤 Share]                │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DONUT CHART - VOTING POWER DISTRIBUTION                         │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Community Voting Power by Member Tier                [⚙️] │ │
│ │                                                             │ │
│ │              ████████████████████████████                   │ │
│ │            ██████████████████████████████████               │ │
│ │          ██████████████████████████████████████             │ │
│ │         ████████████████████████████████████████            │ │
│ │        ████████████████         ███████████████████         │ │
│ │       ███████████████████       ████████████████████        │ │
│ │       ███████████████████       ████████████████████        │ │
│ │       ███████████████████       ████████████████████        │ │
│ │        ████████████████         ███████████████████         │ │
│ │         ████████████████████████████████████████            │ │
│ │          ██████████████████████████████████████             │ │
│ │            ██████████████████████████████████               │ │
│ │              ████████████████████████████                   │ │
│ │                                                             │ │
│ │         Total Voting Power: 2,847 points                   │ │
│ │                                                             │ │
│ │ Legend:                                                     │ │
│ │ ████ Expert (45%) ■■■■ Advanced (30%) ░░░░ Standard (25%) │ │
│ │                                                             │ │
│ │ [👥 View Members] [⚙️ Adjust Tiers] [📊 Analysis]         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Real-Time Analytics Widgets

### Live Voting Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ REAL-TIME VOTING WIDGET                                         │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔴 LIVE: DeFi Protocol Upgrade               [📊] [⚙️]   │ │
│ │ Ends in: 2h 15m 32s                                        │ │
│ │                                                             │ │
│ │ Current Results:                                            │ │
│ │ YES ████████████████████████████████████████████ 67% (165) │ │
│ │ NO  ████████████████████████░░░░░░░░░░░░░░░░░░░░ 33% (82)  │ │
│ │                                                             │ │
│ │ Live Stats:                                                 │ │
│ │ • Participation: 247/247 (100%)                           │ │
│ │ • Last vote: 23 seconds ago by @bob.eth                   │ │
│ │ • Voting rate: 12 votes/hour                              │ │
│ │ • Trend: Steady YES majority                              │ │
│ │                                                             │ │
│ │ Recent Activity:                                            │ │
│ │ 23s ago: @bob.eth voted YES                               │ │
│ │ 1m ago:  @alice.sol voted YES                             │ │
│ │ 2m ago:  @charlie.sol voted NO                            │ │
│ │                                                             │ │
│ │ [🔄 Auto-refresh: ON] [📊 Full View] [🔔 Alerts]         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Performance Metrics Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ PLATFORM PERFORMANCE METRICS                                   │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ System Health Dashboard                               [⚙️] │ │
│ │                                                             │ │
│ │ ┌─────────────────┬─────────────────┬─────────────────────┐ │ │
│ │ │   Response      │   Throughput    │   Error Rate        │ │ │
│ │ │     Time        │                 │                     │ │ │
│ │ │                 │                 │                     │ │ │
│ │ │     45ms        │   1,247 req/s   │      0.02%          │ │ │
│ │ │ ████████████████│ ████████████████│ ██░░░░░░░░░░░░░░░░  │ │ │
│ │ │   Excellent     │   Very High     │   Excellent         │ │ │
│ │ └─────────────────┴─────────────────┴─────────────────────┘ │ │
│ │                                                             │ │
│ │ Service Status:                                             │ │
│ │ ┌─────────────┬─────────┬──────────┬───────────────────┐   │ │
│ │ │ Service     │ Status  │ Latency  │ Uptime            │   │ │
│ │ ├─────────────┼─────────┼──────────┼───────────────────┤   │ │
│ │ │ 🟢 API      │ Healthy │ 45ms     │ 99.9% (30 days)   │   │ │
│ │ │ 🟢 Database │ Healthy │ 12ms     │ 99.8% (30 days)   │   │ │
│ │ │ 🟢 Cache    │ Healthy │ 8ms      │ 99.9% (30 days)   │   │ │
│ │ │ 🟡 Solana   │ Slow    │ 180ms    │ 98.5% (30 days)   │   │ │
│ │ └─────────────┴─────────┴──────────┴───────────────────┘   │ │
│ │                                                             │ │
│ │ [📊 Detailed Metrics] [🚨 Alerts] [📋 Reports]            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Progress Indicators

### Multi-Step Progress
```
┌─────────────────────────────────────────────────────────────────┐
│ PROGRESS INDICATORS                                             │
├─────────────────────────────────────────────────────────────────┤
│ Linear Step Progress:                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Create Community (Step 2 of 4)                             │ │
│ │                                                             │ │
│ │ ●─────●─────◯─────◯                                        │ │
│ │ Basic   Info   Review Create                               │ │
│ │ Info                                                        │ │
│ │                                                             │ │
│ │ ████████████████████████████████████████████████░░░░░░░░░░  │ │
│ │ 50% Complete                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Voting Progress:                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Community Participation Goal                                │ │
│ │                                                             │ │
│ │ Current: 189/250 members voted                              │ │
│ │ ████████████████████████████████████████████████████░░░░░░  │ │
│ │ 76% participation (Target: 75% ✅)                         │ │
│ │                                                             │ │
│ │ Quorum reached! Voting continues until deadline.           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Circular Progress:                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Transaction Confirmation                                    │ │
│ │                                                             │ │
│ │         ████████████████████████████████████████████        │ │
│ │       ████████████████████████████████████████████████      │ │
│ │     ████████████████████████████████████████████████████    │ │
│ │    ██████████████████████████████████████████████████████   │ │
│ │   ████████████████████████████████████████████████████████  │ │
│ │  ████████████████████                ██████████████████████ │ │
│ │  ████████████████████      87%       ██████████████████████ │ │
│ │  ████████████████████                ██████████████████████ │ │
│ │   ████████████████████████████████████████████████████████  │ │
│ │    ██████████████████████████████████████████████████████   │ │
│ │     ████████████████████████████████████████████████████    │ │
│ │       ████████████████████████████████████████████████      │ │
│ │         ████████████████████████████████████████████        │ │
│ │                                                             │ │
│ │ Confirmations: 28/32 | Est. time: 15 seconds               │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Tables

### Sortable Data Table
```
┌─────────────────────────────────────────────────────────────────┐
│ DATA TABLE COMPONENT                                            │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Community Members                [🔍 Search] [⚙️] [📤]    │ │
│ │                                                             │ │
│ │ ┌─────────────────┬─────────────┬──────────┬─────────────┐ │ │
│ │ │ Member ↕️       │ Joined ↕️   │ Votes ↕️ │ Status ↕️   │ │ │
│ │ ├─────────────────┼─────────────┼──────────┼─────────────┤ │ │
│ │ │ 👤 alice.sol    │ Jan 15      │ 23       │ 🟢 Active   │ │ │
│ │ │ 4vJ9...bkLKi    │ 2024        │ (89%)    │             │ │ │
│ │ ├─────────────────┼─────────────┼──────────┼─────────────┤ │ │
│ │ │ 👤 bob.eth      │ Jan 20      │ 19       │ 🟢 Active   │ │ │
│ │ │ 7mK2...nP4x     │ 2024        │ (73%)    │             │ │ │
│ │ ├─────────────────┼─────────────┼──────────┼─────────────┤ │ │
│ │ │ 👤 charlie.sol  │ Feb 01      │ 15       │ 🟡 Inactive │ │ │
│ │ │ 9nL5...qR8y     │ 2024        │ (58%)    │             │ │ │
│ │ ├─────────────────┼─────────────┼──────────┼─────────────┤ │ │
│ │ │ 👤 diana.eth    │ Feb 10      │ 12       │ 🟢 Active   │ │ │
│ │ │ 2hM9...tS6w     │ 2024        │ (92%)    │             │ │ │
│ │ └─────────────────┴─────────────┴──────────┴─────────────┘ │ │
│ │                                                             │ │
│ │ Showing 4 of 247 members | Page 1 of 62                   │ │
│ │ [◀ Previous] [1] [2] [3] ... [62] [Next ▶]               │ │
│ │                                                             │ │
│ │ Bulk Actions: [Select All] [Export Selected] [Message]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile-Optimized List
```
┌─────────────────────────────────────────────┐
│ MOBILE DATA LIST                            │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Members (247)              [🔍] [⚙️]   │ │
│ ├─────────────────────────────────────────┤ │
│ │ 👤 alice.sol                           │ │
│ │ Joined Jan 15 • 23 votes (89%)         │ │
│ │ 🟢 Active • Expert tier                │ │
│ │ [Message] [View Profile]               │ │
│ ├─────────────────────────────────────────┤ │
│ │ 👤 bob.eth                             │ │
│ │ Joined Jan 20 • 19 votes (73%)         │ │
│ │ 🟢 Active • Advanced tier              │ │
│ │ [Message] [View Profile]               │ │
│ ├─────────────────────────────────────────┤ │
│ │ 👤 charlie.sol                         │ │
│ │ Joined Feb 01 • 15 votes (58%)         │ │
│ │ 🟡 Inactive • Standard tier            │ │
│ │ [Message] [View Profile]               │ │
│ ├─────────────────────────────────────────┤ │
│ │ [Load More] [Jump to Top]              │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Search & Filter Components

### Advanced Filter Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ ADVANCED FILTERING                                              │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Filter Communities                                    [✗] │ │
│ │                                                             │ │
│ │ Search Terms:                                               │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 🔍 Search communities, topics, keywords...             │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ Categories:                                                 │ │
│ │ ☑️ DeFi & Trading    ☐ NFT & Art       ☐ Gaming & Fun      │ │
│ │ ☐ Education         ☐ Development     ☐ Governance        │ │
│ │ ☐ Social Network    ☐ Investment      ☐ Technology        │ │
│ │                                                             │ │
│ │ Community Size:                                             │ │
│ │ ◉ Any size    ○ Small (1-50)    ○ Medium (51-500)         │ │
│ │ ○ Large (501-2000)    ○ Very Large (2000+)                │ │
│ │                                                             │ │
│ │ Activity Level:                                             │ │
│ │ ████████████████████████████████████████████████████████    │ │
│ │ Low                                                  High   │ │
│ │ Currently: Medium to High                                   │ │
│ │                                                             │ │
│ │ Membership:                                                 │ │
│ │ ☑️ Open    ☑️ Application Required    ☐ Invite Only        │ │
│ │                                                             │ │
│ │ Founded:                                                    │ │
│ │ ○ Any time    ○ Last week    ◉ Last month    ○ Last year   │ │
│ │                                                             │ │
│ │ [Clear All] [Save Filter] [Apply Filter]                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Quick Filter Tags
```
┌─────────────────────────────────────────────────────────────────┐
│ QUICK FILTER INTERFACE                                          │
├─────────────────────────────────────────────────────────────────┤
│ Active Filters:                                                 │
│ [DeFi & Trading ✗] [Medium Size ✗] [High Activity ✗] [Clear All]│
│                                                                 │
│ Quick Filters:                                                  │
│ [🔥 Trending] [⭐ Recommended] [🆕 New] [🎯 For You] [More...]  │
│                                                                 │
│ Sort by: [Relevance ▼] [Newest ▼] [Most Active ▼] [Size ▼]     │
│                                                                 │
│ Results: 42 communities found                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Analytics Dashboard Widgets

### KPI Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ KEY PERFORMANCE INDICATORS                                      │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┬─────────────────────┐ │
│ │    Total    │   Active    │   Monthly   │      Platform       │ │
│ │ Communities │   Votes     │   Growth    │      Health         │ │
│ │             │             │             │                     │ │
│ │     156     │     23      │   +12.5%    │       94/100        │ │
│ │ ↗️ +8 new   │ ⏰ 12 end   │ 🚀 Strong   │   🟢 Excellent     │ │
│ │ this month  │   today     │   growth    │     health          │ │
│ └─────────────┴─────────────┴─────────────┴─────────────────────┘ │
│                                                                 │
│ ┌─────────────┬─────────────┬─────────────┬─────────────────────┐ │
│ │    Total    │ Average     │ Voting      │      Member         │ │
│ │  Members    │Participation│ Completion  │   Satisfaction      │ │
│ │             │    Rate     │    Rate     │                     │ │
│ │   12,847    │    78%      │    94%      │      4.7/5.0        │ │
│ │ ↗️ +423     │ ↗️ +3.2%    │ ↗️ +1.8%    │   ⭐⭐⭐⭐⭐        │ │
│ │ this month  │ vs last mo. │ vs last mo. │     Excellent       │ │
│ └─────────────┴─────────────┴─────────────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Heatmap Visualization
```
┌─────────────────────────────────────────────────────────────────┐
│ VOTING ACTIVITY HEATMAP                                         │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Community Voting Activity - Last 30 Days             [⚙️] │ │
│ │                                                             │ │
│ │        Mon  Tue  Wed  Thu  Fri  Sat  Sun                   │ │
│ │ Week 1  ███  ███  ██   ███  ███  █    █                    │ │
│ │ Week 2  ███  ███  ███  ██   ███  ██   █                    │ │
│ │ Week 3  ██   ███  ███  ███  ███  ██   ██                   │ │
│ │ Week 4  ███  ███  ██   ███  ███  ███  █                    │ │
│ │                                                             │ │
│ │ Legend: █ Low (0-5) ██ Medium (6-15) ███ High (16+)       │ │
│ │                                                             │ │
│ │ Peak Activity: Tuesday 2PM-4PM (avg 23 votes/hour)        │ │
│ │ Lowest Activity: Sunday 6AM-8AM (avg 2 votes/hour)        │ │
│ │                                                             │ │
│ │ [📊 Detailed View] [📅 Change Period] [📤 Export]         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

This comprehensive data visualization wireframe library provides the foundation for creating engaging, informative, and interactive data displays across both admin and member portals. 