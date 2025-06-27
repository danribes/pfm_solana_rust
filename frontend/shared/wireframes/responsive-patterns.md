# Responsive Design Patterns Wireframes

## Responsive Navigation Patterns

### Desktop Navigation (1200px+)
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DESKTOP NAVIGATION LAYOUT                                                                      │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [🏠 Logo] PFM Platform           [🔍 Global Search...]     [🔔 3] [👤 alice.sol ▼] [🔗]       │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Dashboard | 🏘️ Communities | 🗳️ Voting | 📊 Results | 👤 Profile | ⚙️ Settings           │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet Navigation (768px - 1024px)
```
┌─────────────────────────────────────────────────────────────────┐
│ TABLET NAVIGATION LAYOUT                                        │
├─────────────────────────────────────────────────────────────────┤
│ [🏠] PFM Platform        [🔍 Search]     [🔔] [👤] [🔗]        │
├─────────────────────────────────────────────────────────────────┤
│ 🏠 Dashboard | 🏘️ Communities | 🗳️ Voting | 📊 Results | 👤   │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Navigation (< 768px)
```
┌─────────────────────────────────────────────┐
│ MOBILE NAVIGATION LAYOUT                    │
├─────────────────────────────────────────────┤
│ ☰ [PFM] Platform             [🔔] [👤] [🔗] │
├─────────────────────────────────────────────┤
│ Mobile Bottom Navigation:                   │
│ ┌─────┬─────┬─────┬─────┬─────┐            │
│ │ 🏠  │ 🏘️  │ 🗳️  │ 📊  │ 👤  │            │
│ │Home │Comm │Vote │Data │ Me  │            │
│ └─────┴─────┴─────┴─────┴─────┘            │
│                                             │
│ Hamburger Menu (Hidden by default):        │
│ ┌─────────────────────────────────────────┐ │
│ │ [✗] Close Menu                          │ │
│ │                                         │ │
│ │ 🏠 Dashboard                            │ │
│ │ 🏘️ Communities                          │ │
│ │ 🗳️ Voting                               │ │
│ │ 📊 Results                              │ │
│ │ 👤 Profile                              │ │
│ │ ⚙️ Settings                             │ │
│ │ ────────────────                        │ │
│ │ 🔗 Wallet Status                       │ │
│ │ 🆘 Help & Support                      │ │
│ │ 🚪 Sign Out                            │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Card Layout Patterns

### Desktop Grid Layout (3-4 columns)
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DESKTOP CARD GRID (1200px+)                                                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────────────┐ │
│ │ Community Card 1    │ Community Card 2    │ Community Card 3    │ Community Card 4           │ │
│ │                     │                     │                     │                            │ │
│ │ [  Card Image  ]    │ [  Card Image  ]    │ [  Card Image  ]    │ [  Card Image  ]           │ │
│ │                     │                     │                     │                            │ │
│ │ Card Title          │ Card Title          │ Card Title          │ Card Title                 │ │
│ │ Card Description    │ Card Description    │ Card Description    │ Card Description           │ │
│ │                     │                     │                     │                            │ │
│ │ Meta info           │ Meta info           │ Meta info           │ Meta info                  │ │
│ │ [Action] [Action]   │ [Action] [Action]   │ [Action] [Action]   │ [Action] [Action]          │ │
│ └─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────────────┘ │
│ ┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────────────┐ │
│ │ Community Card 5    │ Community Card 6    │ Community Card 7    │ Community Card 8           │ │
│ │ [...similar layout] │ [...similar layout] │ [...similar layout] │ [...similar layout]        │ │
│ └─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet Grid Layout (2-3 columns)
```
┌─────────────────────────────────────────────────────────────────┐
│ TABLET CARD GRID (768px - 1024px)                              │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┬─────────────────────┬─────────────────┐ │
│ │ Community Card 1    │ Community Card 2    │ Community C3    │ │
│ │                     │                     │                 │ │
│ │ [  Card Image  ]    │ [  Card Image  ]    │ [Card Image]    │ │
│ │                     │                     │                 │ │
│ │ Card Title          │ Card Title          │ Card Title      │ │
│ │ Card Description    │ Card Description    │ Description     │ │
│ │                     │                     │                 │ │
│ │ Meta • Info         │ Meta • Info         │ Meta • Info     │ │
│ │ [Action] [Action]   │ [Action] [Action]   │ [Act] [Act]     │ │
│ └─────────────────────┴─────────────────────┴─────────────────┘ │
│ ┌─────────────────────┬─────────────────────┬─────────────────┐ │
│ │ Community Card 4    │ Community Card 5    │ Community C6    │ │
│ │ [...similar layout] │ [...similar layout] │ [...similar]    │ │
│ └─────────────────────┴─────────────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Single Column Layout
```
┌─────────────────────────────────────────────┐
│ MOBILE SINGLE COLUMN (< 768px)             │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Community Card 1                        │ │
│ │                                         │ │
│ │ [         Card Image         ]          │ │
│ │                                         │ │
│ │ Card Title                              │ │
│ │ Card description text that wraps        │ │
│ │ to multiple lines on mobile             │ │
│ │                                         │ │
│ │ 👥 247 members • 📊 12 votes            │ │
│ │ ⭐⭐⭐⭐⭐ 4.8/5 • 📈 +15%              │ │
│ │                                         │ │
│ │ [Join Community] [Learn More]           │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Community Card 2                        │ │
│ │ [...similar mobile layout]              │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Community Card 3                        │ │
│ │ [...similar mobile layout]              │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Form Layout Patterns

### Desktop Form Layout (2-3 columns)
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DESKTOP FORM LAYOUT                                                                            │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Create Community                                                                   [✗]    │ │
│ │                                                                                             │ │
│ │ ┌─────────────────────────────────┬─────────────────────────────────────────────────────┐   │ │
│ │ │ Basic Information               │ Settings & Configuration                            │   │ │
│ │ │                                 │                                                     │   │ │
│ │ │ Community Name *                │ Membership Type *                                   │   │ │
│ │ │ ┌─────────────────────────────┐ │ ◉ Open  ○ Application  ○ Invite Only              │   │ │
│ │ │ │ DeFi Traders Hub           │ │                                                     │   │ │
│ │ │ └─────────────────────────────┘ │ Voting Threshold                                   │   │ │
│ │ │                                 │ ████████████████████████████████████████░░░░░░░░░░  │   │ │
│ │ │ Category *                      │ 75% (Supermajority)                                │   │ │
│ │ │ ┌─────────────────────────────┐ │                                                     │   │ │
│ │ │ │ DeFi & Trading        [▼] │ │ Quorum Requirement                                 │   │ │
│ │ │ └─────────────────────────────┘ │ ████████████████████████████████████████░░░░░░░░░░  │   │ │
│ │ │                                 │ 50% (Simple majority)                             │   │ │
│ │ │ Community Description *         │                                                     │   │ │
│ │ │ ┌─────────────────────────────┐ │ Governance Model                                   │   │ │
│ │ │ │ A community for DeFi        │ │ ☑️ Democratic voting                                │   │ │
│ │ │ │ traders to share strategies │ │ ☑️ Token-weighted votes                             │   │ │
│ │ │ │ and market analysis...      │ │ ☐ Admin override                                   │   │ │
│ │ │ │                             │ │ ☐ Reputation-based                                 │   │ │
│ │ │ └─────────────────────────────┘ │                                                     │   │ │
│ │ │ 156/500 characters              │                                                     │   │ │
│ │ └─────────────────────────────────┴─────────────────────────────────────────────────────┘   │ │
│ │                                                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │ │
│ │ │ Community Guidelines & Rules                                                            │   │ │
│ │ │                                                                                         │   │ │
│ │ │ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │   │ │
│ │ │ │ 1. Be respectful and constructive in all discussions                               │ │   │ │
│ │ │ │ 2. No financial advice - share information for educational purposes only           │ │   │ │
│ │ │ │ 3. Research proposals thoroughly before voting                                     │ │   │ │
│ │ │ │ 4. Maintain confidentiality of private community discussions                      │ │   │ │
│ │ │ │ ...                                                                                 │ │   │ │
│ │ │ └─────────────────────────────────────────────────────────────────────────────────────┘ │   │ │
│ │ └─────────────────────────────────────────────────────────────────────────────────────────┘   │ │
│ │                                                                                             │ │
│ │ ☐ I agree to the PFM Terms of Service                                                     │ │
│ │ ☐ I confirm all information is accurate                                                   │ │
│ │                                                                                             │ │
│ │                           [Cancel] [Save Draft] [Create Community]                        │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Form Layout (Single Column)
```
┌─────────────────────────────────────────────┐
│ MOBILE FORM LAYOUT                          │
├─────────────────────────────────────────────┤
│ ← Create Community                    [✗] │
├─────────────────────────────────────────────┤
│ Step 1 of 3: Basic Information             │
│ ██████████████░░░░░░░░░░░░░░░░░░░░░░░░ 33%  │
├─────────────────────────────────────────────┤
│                                             │
│ Community Name *                            │
│ ┌─────────────────────────────────────────┐ │
│ │ DeFi Traders Hub                        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Category *                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ DeFi & Trading                    [▼] │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Community Description *                     │
│ ┌─────────────────────────────────────────┐ │
│ │ A community for DeFi traders to share   │ │
│ │ strategies and market analysis. We      │ │
│ │ focus on educational content and        │ │
│ │ collaborative learning...               │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│ 156/500 characters                         │
│                                             │
│ Upload Community Image (Optional)           │
│ ┌─────────────────────────────────────────┐ │
│ │ [📷 Choose Image] [📋 Use Default]      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Cancel] [Next: Settings →]                │
└─────────────────────────────────────────────┘
```

## Data Table Responsive Patterns

### Desktop Data Table
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DESKTOP DATA TABLE                                                                             │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Community Members (247)                     [🔍 Search members] [⚙️ Filter] [📤 Export]       │
│                                                                                                │
│ ┌─────────────────┬─────────────┬──────────────┬─────────────┬─────────────┬──────────────────┐ │
│ │ ☐ Member        │ Joined      │ Last Active  │ Votes Cast  │ Reputation  │ Actions          │ │
│ ├─────────────────┼─────────────┼──────────────┼─────────────┼─────────────┼──────────────────┤ │
│ │ ☐ 👤 alice.sol  │ Jan 15      │ 2 hours ago  │ 23 (89%)    │ 🟢 Expert   │ [Message] [Edit] │ │
│ │   4vJ9...bkLKi  │ 2024        │              │             │ 92/100      │ [Remove]         │ │
│ ├─────────────────┼─────────────┼──────────────┼─────────────┼─────────────┼──────────────────┤ │
│ │ ☐ 👤 bob.eth    │ Jan 20      │ 1 day ago    │ 19 (73%)    │ 🟡 Advanced │ [Message] [Edit] │ │
│ │   7mK2...nP4x   │ 2024        │              │             │ 78/100      │ [Remove]         │ │
│ ├─────────────────┼─────────────┼──────────────┼─────────────┼─────────────┼──────────────────┤ │
│ │ ☐ 👤 charlie... │ Feb 01      │ 5 days ago   │ 15 (58%)    │ ⚪ Standard │ [Message] [Edit] │ │
│ │   9nL5...qR8y   │ 2024        │              │             │ 65/100      │ [Remove]         │ │
│ └─────────────────┴─────────────┴──────────────┴─────────────┴─────────────┴──────────────────┘ │
│                                                                                                │
│ Showing 1-25 of 247 • [◀ Previous] [1] [2] [3] ... [10] [Next ▶]                            │
│ Selected: 0 items • [Select All] [Bulk Message] [Bulk Export] [Bulk Remove]                  │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet Data Table (Simplified)
```
┌─────────────────────────────────────────────────────────────────┐
│ TABLET DATA TABLE                                               │
├─────────────────────────────────────────────────────────────────┤
│ Members (247)              [🔍 Search] [⚙️] [📤]             │
│                                                                 │
│ ┌─────────────────┬─────────────┬──────────┬─────────────────┐ │
│ │ Member          │ Activity    │ Votes    │ Actions         │ │
│ ├─────────────────┼─────────────┼──────────┼─────────────────┤ │
│ │ 👤 alice.sol    │ 2h ago      │ 23 (89%) │ [💬] [⚙️] [❌] │ │
│ │ 🟢 Expert       │ Very active │          │                 │ │
│ ├─────────────────┼─────────────┼──────────┼─────────────────┤ │
│ │ 👤 bob.eth      │ 1d ago      │ 19 (73%) │ [💬] [⚙️] [❌] │ │
│ │ 🟡 Advanced     │ Active      │          │                 │ │
│ ├─────────────────┼─────────────┼──────────┼─────────────────┤ │
│ │ 👤 charlie.sol  │ 5d ago      │ 15 (58%) │ [💬] [⚙️] [❌] │ │
│ │ ⚪ Standard     │ Inactive    │          │                 │ │
│ └─────────────────┴─────────────┴──────────┴─────────────────┘ │
│                                                                 │
│ Page 1 of 10 • [◀] [▶] • [Bulk Actions ▼]                    │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Card List (Table Alternative)
```
┌─────────────────────────────────────────────┐
│ MOBILE CARD LIST                            │
├─────────────────────────────────────────────┤
│ Members (247)              [🔍] [⚙️] [📤] │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 alice.sol                    [⋮]    │ │
│ │ 4vJ9...bkLKi                           │ │
│ │                                         │ │
│ │ 🟢 Expert • 92/100 reputation          │ │
│ │ Joined Jan 15 • Last active 2h ago     │ │
│ │ 23 votes cast (89% participation)      │ │
│ │                                         │ │
│ │ [💬 Message] [⚙️ Manage] [👤 Profile]  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 bob.eth                      [⋮]    │ │
│ │ 7mK2...nP4x                            │ │
│ │                                         │ │
│ │ 🟡 Advanced • 78/100 reputation        │ │
│ │ Joined Jan 20 • Last active 1d ago     │ │
│ │ 19 votes cast (73% participation)      │ │
│ │                                         │ │
│ │ [💬 Message] [⚙️ Manage] [👤 Profile]  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Load More Members] [↑ Back to Top]        │
└─────────────────────────────────────────────┘
```

## Chart Responsive Patterns

### Desktop Chart Layout
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DESKTOP CHART LAYOUT                                                                           │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Community Growth Analytics                                    [📊] [📤] [⚙️]             │ │
│ │                                                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────────────────────────────────────┐ │ │
│ │ │                           Monthly Member Growth                                         │ │ │
│ │ │                                                                                         │ │ │
│ │ │ 300│                                                        ●●●                         │ │ │
│ │ │    │                                                  ●●●●●●●●●                         │ │ │
│ │ │ 250│                                           ●●●●●●●●●●●●●●●                         │ │ │
│ │ │    │                                     ●●●●●●●●●●●●●●●●●●●●●                         │ │ │
│ │ │ 200│                              ●●●●●●●●●●●●●●●●●●●●●●●●●●●                         │ │ │
│ │ │    │                       ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                         │ │ │
│ │ │ 150│                ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                         │ │ │
│ │ │    │         ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                         │ │ │
│ │ │ 100│  ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●                         │ │ │
│ │ │    │                                                                                  │ │ │
│ │ │  50└─Jan──Feb──Mar──Apr──May──Jun──Jul──Aug──Sep──Oct──Nov──Dec─                     │ │ │
│ │ │                                                                                         │ │ │
│ │ │ Growth Rate: +15.3% monthly | Peak: October (287 members) | Trend: ↗️ Accelerating   │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                                             │ │
│ │ Key Metrics:                                                                                │ │
│ │ • Total Members: 287 (+47 this month)                                                      │ │
│ │ • Average Growth: 23 members/month                                                         │ │
│ │ • Retention Rate: 94.2%                                                                    │ │
│ │ • Projected Dec Total: 340 members                                                         │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Chart Layout
```
┌─────────────────────────────────────────────┐
│ MOBILE CHART LAYOUT                         │
├─────────────────────────────────────────────┤
│ ← Community Growth          [⚙️] [📤]     │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Member Growth                           │ │
│ │                                         │ │
│ │ 300│                        ●●●         │ │
│ │    │                  ●●●●●●●●●         │ │
│ │ 250│           ●●●●●●●●●●●●●●●         │ │
│ │    │     ●●●●●●●●●●●●●●●●●●●●●         │ │
│ │ 200│●●●●●●●●●●●●●●●●●●●●●●●●●●         │ │
│ │    │                                   │ │
│ │ 150└─Jan─Apr─Jul─Oct─                  │ │
│ │                                         │ │
│ │ +15.3% monthly growth                   │ │
│ │ 287 total members                       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Key Stats:                                  │
│ • This month: +47 members                  │
│ • Monthly avg: 23 new members              │
│ • Retention: 94.2%                         │
│ • Trend: ↗️ Accelerating                   │
│                                             │
│ [📊 Detailed View] [📋 Export Data]       │
└─────────────────────────────────────────────┘
```

## Modal Responsive Patterns

### Desktop Modal (Large)
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DESKTOP MODAL OVERLAY                                                                          │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│     ┌─────────────────────────────────────────────────────────────────────────────────────┐    │
│     │ Vote on Community Treasury Allocation                                         [✗] │    │
│     ├─────────────────────────────────────────────────────────────────────────────────────┤    │
│     │                                                                                     │    │
│     │ ┌─────────────────────────────────┬───────────────────────────────────────────────┐ │    │
│     │ │ Proposal Details                │ Current Results                               │ │    │
│     │ │                                 │                                               │ │    │
│     │ │ How should we allocate our      │ Option A: 35% (30 votes)                    │ │    │
│     │ │ 50,000 PFM community treasury   │ ████████████████████████████████████░░░░░░░░ │ │    │
│     │ │ for maximum benefit?            │                                               │ │    │
│     │ │                                 │ Option B: 43% (38 votes) ← Leading          │ │    │
│     │ │ Option A: Development Focus     │ ████████████████████████████████████████████ │ │    │
│     │ │ • 60% Development               │                                               │ │    │
│     │ │ • 25% Marketing                 │ Option C: 22% (19 votes)                    │ │    │
│     │ │ • 15% Reserve                   │ ████████████████████████░░░░░░░░░░░░░░░░░░░░ │ │    │
│     │ │                                 │                                               │ │    │
│     │ │ Option B: Balanced Approach     │ Participation: 87/89 (98%)                  │ │    │
│     │ │ • 40% Development               │ Time remaining: 1d 8h 23m                   │ │    │
│     │ │ • 40% Community Rewards         │                                               │ │    │
│     │ │ • 20% Marketing                 │                                               │ │    │
│     │ │                                 │                                               │ │    │
│     │ │ Option C: Member-Centric        │                                               │ │    │
│     │ │ • 50% Community Rewards         │                                               │ │    │
│     │ │ • 30% Development               │                                               │ │    │
│     │ │ • 20% Reserve                   │                                               │ │    │
│     │ └─────────────────────────────────┴───────────────────────────────────────────────┘ │    │
│     │                                                                                     │    │
│     │ Your Vote:                                                                          │    │
│     │ ◉ Option A    ○ Option B    ○ Option C                                            │    │
│     │                                                                                     │    │
│     │ ☐ I have read and understand all options                                          │    │
│     │ ☐ I understand this vote cannot be changed                                        │    │
│     │                                                                                     │    │
│     │ Transaction fee: ~0.00025 SOL (~$0.01)                                           │    │
│     │                                                                                     │    │
│     ├─────────────────────────────────────────────────────────────────────────────────────┤    │
│     │                          [Cancel] [🗳️ Submit Vote]                                 │    │
│     └─────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Modal (Full Screen)
```
┌─────────────────────────────────────────────┐
│ MOBILE MODAL (FULL SCREEN)                  │
├─────────────────────────────────────────────┤
│ ← Treasury Allocation Vote            [✗] │
├─────────────────────────────────────────────┤
│ GameFi Union • Ends in 1d 8h 23m           │
│ 87/89 members voted (98%)                  │
├─────────────────────────────────────────────┤
│                                             │
│ How should we allocate our 50,000 PFM      │
│ community treasury?                         │
│                                             │
│ Current Results:                            │
│ Option A: 35% (30 votes)                   │
│ ████████████████████████████████████░░░░░░░ │
│                                             │
│ Option B: 43% (38 votes) ← Leading         │
│ ████████████████████████████████████████████ │
│                                             │
│ Option C: 22% (19 votes)                   │
│ ████████████████████████░░░░░░░░░░░░░░░░░░░ │
│                                             │
├─────────────────────────────────────────────┤
│ Options | Results | Discussion | Analysis   │
├─────────────────────────────────────────────┤
│                                             │
│ Choose your vote:                           │
│                                             │
│ ◉ Option A: Development Focus               │
│   60% Dev, 25% Marketing, 15% Reserve      │
│   Pros: Fast development, tech improvements │
│   Cons: Limited member rewards             │
│                                             │
│ ○ Option B: Balanced Approach               │
│   40% Dev, 40% Rewards, 20% Marketing      │
│   Pros: Member rewards, balanced approach  │
│   Cons: Reduced development funding        │
│                                             │
│ ○ Option C: Member-Centric                  │
│   50% Rewards, 30% Dev, 20% Reserve        │
│   Pros: Max member rewards, high engagement │
│   Cons: Limited development resources      │
│                                             │
├─────────────────────────────────────────────┤
│ ☐ I understand all options                 │
│ ☐ Vote cannot be changed                   │
│                                             │
│ Fee: ~0.00025 SOL (~$0.01)                │
│                                             │
│ [Cancel] [🗳️ Submit Vote]                  │
└─────────────────────────────────────────────┘
```

This comprehensive responsive patterns wireframe library ensures consistent, accessible, and optimized user experiences across all device types and screen sizes. 