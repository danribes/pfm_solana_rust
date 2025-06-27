# Voting Interface Wireframe

## Active Voting Dashboard

### Desktop Layout (1200px+)
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Active Voting                                                                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ← Dashboard                     [🔍 Search votes, topics...] [📊 My History] [📋 Create Vote]   │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ VOTING OVERVIEW                                                                                │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────────┐ │
│ │   Active    │  Ending     │   Your      │   Voting    │  Completed  │      Quick Actions      │ │
│ │   Votes     │   Today     │ Pending     │   Power     │  This Week  │                         │ │
│ │             │             │   Votes     │             │             │                         │ │
│ │     12      │      3      │      2      │   8.4/10    │     15      │  [🗳️ Vote on Urgent]   │ │
│ │  Across 5   │  ⏰ Urgent  │ ⚠️ Action   │  🔥 Top 15% │  📊 Results │  [📋 Create Proposal]  │ │
│ │ communities │   needed    │   needed    │   Tier      │  available  │  [📈 View Analytics]    │ │
│ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ FILTERING & SORTING                                                                            │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Status: [All] [Active] [Ending Soon] [Completed] | Community: [All ▼] | Type: [All ▼]        │
│ Sort: [Deadline ▼] | View: [Cards] [List] | Show: [25 per page ▼] | [Clear Filters]         │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬─────────────────────────────────────────────────────────────────────────────────┐
│              │ ACTIVE VOTES                                                                    │
│ QUICK NAV    │                                                                                 │
│              │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ 🔥 Urgent    │ │                    🚨 ENDING SOON - ACTION REQUIRED                         │ │
│   (3 votes)  │ │                                                                             │ │
│              │ │ 🗳️ DeFi Protocol Upgrade Decision                    ⏰ Ends in 2h 15m     │ │
│ ⏳ Today     │ │ DeFi Traders Community • Proposal by @alice.sol                           │ │
│   (3 votes)  │ │                                                                             │ │
│              │ │ Current Results: 67% YES (165 votes) | 33% NO (82 votes)                  │ │
│ 📅 This Week │ │ Participation: 247/247 members (100%) 🔥                                  │ │
│   (6 votes)  │ │ Your Vote: ✅ YES (cast 4 hours ago)                                      │ │
│              │ │                                                                             │ │
│ 🏘️ By Community│ │ "Should we upgrade to the new DeFi protocol version with improved       │ │
│ • DeFi Traders│ │ yield farming capabilities and reduced gas fees?"                         │ │
│   (5 votes)  │ │                                                                             │ │
│ • GameFi     │ │ [View Full Details] [Change Vote] [Discuss] [Share Results]               │ │
│   (3 votes)  │ └─────────────────────────────────────────────────────────────────────────────┘ │
│ • NFT Hub    │                                                                                 │
│   (1 vote)   │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│              │ │ 🗳️ Community Treasury Allocation                      ⏰ Ends in 1d 8h     │ │
│ 📊 Analytics │ │ GameFi Union • Proposal by @charlie.sol                                    │ │
│   Dashboard  │ │                                                                             │ │
│              │ │ Current Results: 45% Option A | 32% Option B | 23% Option C              │ │
│ 🎯 Recommend │ │ Participation: 67/89 members (75%)                                         │ │
│   for You    │ │ Your Vote: ⏳ NOT YET VOTED                                                │ │
│              │ │                                                                             │ │
│              │ │ "How should we allocate the 50,000 PFM tokens in our community treasury   │ │
│              │ │ for maximum benefit to all members?"                                       │ │
│              │ │                                                                             │ │
│              │ │ Options:                                                                    │ │
│              │ │ A) 60% Development, 25% Marketing, 15% Reserve                            │ │
│              │ │ B) 40% Development, 40% Community Rewards, 20% Marketing                  │ │
│              │ │ C) 50% Community Rewards, 30% Development, 20% Reserve                    │ │
│              │ │                                                                             │ │
│              │ │ [Vote Now] [Learn More] [Discuss] [View Analysis]                         │ │
│              │ └─────────────────────────────────────────────────────────────────────────────┘ │
│              │                                                                                 │
│              │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│              │ │ 🗳️ Governance Token Staking Mechanism               ⏰ Ends in 3d 12h     │ │
│              │ │ Web3 Governance Hub • Proposal by @governance_team                         │ │
│              │ │                                                                             │ │
│              │ │ Current Results: 78% YES (201 votes) | 22% NO (56 votes)                  │ │
│              │ │ Participation: 257/324 members (79%)                                       │ │
│              │ │ Your Vote: ❌ NO (cast 2 days ago)                                         │ │
│              │ │                                                                             │ │
│              │ │ "Should we implement a governance token staking mechanism that requires    │ │
│              │ │ members to stake tokens to participate in voting?"                         │ │
│              │ │                                                                             │ │
│              │ │ Impact: High - This would fundamentally change how voting works            │ │
│              │ │ Required: 75% supermajority for approval                                   │ │
│              │ │                                                                             │ │
│              │ │ [Change Vote] [View Proposal] [Join Discussion] [Impact Analysis]         │ │
│              │ └─────────────────────────────────────────────────────────────────────────────┘ │
│              │                                                                                 │
│              │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│              │ │ [View All Active Votes] [Load More] [📊 Voting Analytics]                  │ │
│              │ └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────┤                                                                                 │
               │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
               │ │                           RECENT VOTING ACTIVITY                             │ │
               │ ├─────────────────────────────────────────────────────────────────────────────┤ │
               │ │ 🗳️ 2h ago - Voted YES on "DeFi Protocol Upgrade" (your 23rd vote)         │ │
               │ │ 📊 4h ago - "Community Fee Structure" voting ended - REJECTED (45% YES)    │ │
               │ │ 🗳️ 1d ago - Voted Option B on "Treasury Allocation" in GameFi Union       │ │
               │ │ 🎉 2d ago - Earned "Active Voter" badge (90%+ participation rate)          │ │
               │ │ 📈 3d ago - Your voting power increased to 8.4/10 (Top 15% tier)          │ │
               │ │ [View Full Voting History] [Export Voting Record]                          │ │
               │ └─────────────────────────────────────────────────────────────────────────────┘ │
               └─────────────────────────────────────────────────────────────────────────────────┘
```

## Individual Vote Detail Page

### Voting Interface - Single Vote
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Voting                                   [⭐ Watch] [📤 Share] [📋 Report] [💬 Chat] │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🗳️ Community Treasury Allocation                                        ⏰ Ends in 1d 8h 23m  │
│ GameFi Union • Posted by @charlie.sol • 3 days ago                                           │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────────────┐
│  Participation  │   Your Vote     │    Quorum       │   Vote Type     │      Vote Weight        │
│                 │                 │                 │                 │                         │
│    67/89        │   ⏳ Pending    │    45/89        │  Multi-Choice   │       1.0x              │
│    (75%)        │   Not voted     │   (51% req)     │   Selection     │    Standard Member      │
│  📈 Above avg   │                 │   ✅ Met        │                 │                         │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PROPOSAL DETAILS                                                                               │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│ **How should we allocate the 50,000 PFM tokens in our community treasury for maximum         │
│ benefit to all members?**                                                                      │
│                                                                                                │
│ **Background:**                                                                                │
│ Our community treasury has grown to 50,000 PFM tokens through successful governance          │
│ decisions and community activities. We need to decide how to allocate these tokens to        │
│ maximize value for all members while ensuring sustainable growth.                             │
│                                                                                                │
│ **Context:**                                                                                   │
│ • Current treasury size: 50,000 PFM (~$25,000 USD)                                          │
│ • Treasury growth rate: +15% monthly                                                          │
│ • Community size: 89 active members                                                           │
│ • Previous allocation was: 50% Development, 30% Marketing, 20% Reserve                       │
│ • Community feedback: Need more direct member rewards                                         │
│                                                                                                │
│ **Proposal by @charlie.sol:**                                                                 │
│ "After analyzing our community growth patterns and member feedback, I propose we             │
│ restructure our token allocation to better reward active members while maintaining           │
│ development momentum. The three options below represent different strategic priorities."      │
│                                                                                                │
│ **Analysis & Research:**                                                                       │
│ [📊 Treasury Analysis Report] [📈 Growth Projections] [💬 Community Feedback Summary]        │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ VOTING OPTIONS                                                                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🅰️ OPTION A: Development-Focused Allocation                         45% (40 votes)        │ │
│ │ ████████████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ │
│ │                                                                                             │ │
│ │ • 60% Development (30,000 PFM)                                                             │ │
│ │ • 25% Marketing & Growth (12,500 PFM)                                                      │ │
│ │ • 15% Reserve Fund (7,500 PFM)                                                             │ │
│ │                                                                                             │ │
│ │ **Pros:** Accelerated feature development, technical improvements                          │ │
│ │ **Cons:** Limited direct member rewards                                                    │ │
│ │ **Impact:** High development velocity, sustainable growth                                  │ │
│ │                                                                                             │ │
│ │ ○ Select this option                                                                       │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🅱️ OPTION B: Balanced Community Rewards                            32% (29 votes)        │ │
│ │ ████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ │
│ │                                                                                             │ │
│ │ • 40% Development (20,000 PFM)                                                             │ │
│ │ • 40% Community Rewards (20,000 PFM)                                                      │ │
│ │ • 20% Marketing & Growth (10,000 PFM)                                                      │ │
│ │                                                                                             │ │
│ │ **Pros:** Direct member rewards, balanced approach                                         │ │
│ │ **Cons:** Reduced development funding                                                      │ │
│ │ **Impact:** Higher member satisfaction, moderate development                               │ │
│ │                                                                                             │ │
│ │ ○ Select this option                                                                       │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🅲 OPTION C: Member-Centric Allocation                              23% (20 votes)        │ │
│ │ ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │ │
│ │                                                                                             │ │
│ │ • 50% Community Rewards (25,000 PFM)                                                      │ │
│ │ • 30% Development (15,000 PFM)                                                             │ │
│ │ • 20% Reserve Fund (10,000 PFM)                                                            │ │
│ │                                                                                             │ │
│ │ **Pros:** Maximum member rewards, strong incentives                                        │ │
│ │ **Cons:** Limited development resources                                                    │ │
│ │ **Impact:** High member engagement, slower feature development                             │ │
│ │                                                                                             │ │
│ │ ○ Select this option                                                                       │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                   CAST YOUR VOTE                                           │ │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ You haven't voted yet. Choose one option above and confirm your vote.                     │ │
│ │                                                                                             │ │
│ │ Vote Confirmation:                                                                          │ │
│ │ ☐ I have read and understood all options                                                  │ │
│ │ ☐ I understand this vote cannot be changed after submission                               │ │
│ │ ☐ I confirm this is my final decision                                                     │ │
│ │                                                                                             │ │
│ │ Transaction Fee: ~0.00025 SOL (~$0.01) for on-chain vote recording                       │ │
│ │                                                                                             │ │
│ │                          [🗳️ Submit Vote] [📋 Save Draft]                                 │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DISCUSSION & ANALYSIS                                                                          │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 💬 Discussion (23) | 📊 Analysis (4) | 📈 Impact (2) | 🔍 Research (5)                       │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│ 💬 @alice.sol - 2 hours ago                                                                   │
│ "I lean towards Option B. It provides a good balance between rewarding our active            │
│ members and maintaining development momentum. The 40% for community rewards could            │
│ significantly boost engagement."                                                               │
│ 👍 12 👎 2 💬 Reply                                                                           │
│                                                                                                │
│ 💬 @bob.eth - 4 hours ago                                                                     │
│ "Option A makes more sense long-term. Strong development leads to a better platform,         │
│ which benefits everyone. We can increase rewards later when the treasury grows."             │
│ 👍 8 👎 5 💬 Reply                                                                            │
│                                                                                                │
│ 📊 @data_analyst.sol - 6 hours ago                                                           │
│ "Based on similar communities, Option B typically leads to 25% higher retention             │
│ rates but 15% slower feature development. Here's my analysis: [📊 View Report]"             │
│ 👍 15 👎 1 💬 Reply                                                                           │
│                                                                                                │
│ [View All Comments] [Add Comment] [Sort by: Newest ▼]                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Mobile Voting Interface (< 768px)

### Mobile Active Votes
```
┌─────────────────────────────────────────────┐
│ ☰ Voting                              [🔍] │
├─────────────────────────────────────────────┤
│ [Active] [Ending Soon] [Completed] [Mine]   │
├─────────────────────────────────────────────┤
│ Your voting power: 8.4/10 🔥               │
│ 🗳️ 2 pending votes • ⏰ 3 end today        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🚨 URGENT - Ending in 2h 15m               │
│ ┌─────────────────────────────────────────┐ │
│ │ 🗳️ DeFi Protocol Upgrade               │ │
│ │ DeFi Traders Community                 │ │
│ │                                         │ │
│ │ 67% YES (165 votes)                    │ │
│ │ 33% NO (82 votes)                      │ │
│ │ 100% participation 🔥                  │ │
│ │                                         │ │
│ │ ✅ You voted: YES (4h ago)             │ │
│ │                                         │ │
│ │ [View Details] [Change Vote]           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ⏰ Ending in 1d 8h                          │
│ ┌─────────────────────────────────────────┐ │
│ │ 🗳️ Treasury Allocation                  │ │
│ │ GameFi Union                           │ │
│ │                                         │ │
│ │ 45% Option A (40 votes)                │ │
│ │ 32% Option B (29 votes)                │ │
│ │ 23% Option C (20 votes)                │ │
│ │                                         │ │
│ │ ⏳ You haven't voted yet               │ │
│ │                                         │ │
│ │ [Vote Now] [Learn More]                │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ⏰ Ending in 3d 12h                         │
│ ┌─────────────────────────────────────────┐ │
│ │ 🗳️ Governance Token Staking            │ │
│ │ Web3 Governance Hub                    │ │
│ │                                         │ │
│ │ 78% YES (201 votes)                    │ │
│ │ 22% NO (56 votes)                      │ │
│ │ 79% participation                      │ │
│ │                                         │ │
│ │ ❌ You voted: NO (2d ago)              │ │
│ │                                         │ │
│ │ [View Details] [Change Vote]           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [Load More Votes] [📊 My Voting History]   │
└─────────────────────────────────────────────┘
```

### Mobile Vote Detail & Casting
```
┌─────────────────────────────────────────────┐
│ ← Treasury Allocation              [📤][⭐] │
├─────────────────────────────────────────────┤
│ GameFi Union • by @charlie.sol              │
│ ⏰ Ends in 1d 8h 23m                       │
│ 75% participation (67/89)                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Current Results:                            │
│ 🅰️ Option A: 45% (40 votes)                │ │
│ ████████████████████████████████████████████ │
│ Development-focused allocation              │
│                                             │
│ 🅱️ Option B: 32% (29 votes)                │ │
│ ████████████████████████████████░░░░░░░░░░░░ │
│ Balanced community rewards                 │
│                                             │
│ 🅲 Option C: 23% (20 votes)                │ │
│ ████████████████████████░░░░░░░░░░░░░░░░░░░░ │
│ Member-centric allocation                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ About | Options | Discussion | Analysis     │
├─────────────────────────────────────────────┤
│ How should we allocate the 50,000 PFM      │
│ tokens in our community treasury?          │
│                                             │
│ Background:                                 │
│ Our treasury has grown to 50K PFM tokens   │
│ through successful governance. We need to   │
│ decide allocation for maximum member        │
│ benefit and sustainable growth.             │
│                                             │
│ Context:                                    │
│ • Treasury: 50,000 PFM (~$25,000)         │
│ • Growth: +15% monthly                     │
│ • Members: 89 active                       │
│ • Previous: 50% Dev, 30% Marketing, 20%   │
│   Reserve                                   │
│                                             │
│ [View Full Proposal]                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🗳️ Cast Your Vote                          │
├─────────────────────────────────────────────┤
│ ◉ Option A: Development-Focused             │
│   60% Dev, 25% Marketing, 15% Reserve      │
│   Pros: Fast development, tech improvements │
│   Cons: Limited member rewards             │
│                                             │
│ ○ Option B: Balanced Rewards                │
│   40% Dev, 40% Rewards, 20% Marketing      │
│   Pros: Member rewards, balanced approach  │
│   Cons: Reduced development funding        │
│                                             │
│ ○ Option C: Member-Centric                  │
│   50% Rewards, 30% Dev, 20% Reserve        │
│   Pros: Max member rewards, high engagement │
│   Cons: Limited development resources      │
├─────────────────────────────────────────────┤
│ ☐ I understand all options                 │
│ ☐ Vote cannot be changed                   │
│ ☐ This is my final decision                │
│                                             │
│ Fee: ~0.00025 SOL (~$0.01)                │
│                                             │
│ [🗳️ Submit Vote] [💾 Save Draft]          │
└─────────────────────────────────────────────┘
```

## Vote Confirmation Flow

### Vote Confirmation Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ Confirm Your Vote                                          [✗] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🗳️ Community Treasury Allocation                               │
│ GameFi Union Community                                          │
│                                                                 │
│ Your Selection:                                                 │
│ 🅰️ **Option A: Development-Focused Allocation**               │
│                                                                 │
│ • 60% Development (30,000 PFM)                                 │
│ • 25% Marketing & Growth (12,500 PFM)                          │
│ • 15% Reserve Fund (7,500 PFM)                                 │
│                                                                 │
│ Vote Details:                                                   │
│ • Voting Period: 7 days                                        │
│ • Your Vote Weight: 1.0x (Standard Member)                     │
│ • Transaction Fee: 0.00025 SOL (~$0.01)                       │
│ • Vote ID: #GT-2024-002                                        │
│                                                                 │
│ ⚠️ Important:                                                   │
│ • This vote cannot be changed once submitted                   │
│ • Your vote will be permanently recorded on-chain             │
│ • You will receive a confirmation transaction                  │
│                                                                 │
│ Wallet Confirmation:                                            │
│ 📍 alice.sol (4vJ9...bkLKi)                                   │
│ 💰 Current Balance: 2.45 SOL                                  │
│ 🟢 Sufficient for transaction fee                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                   [Cancel] [🔗 Confirm & Submit Vote]          │
└─────────────────────────────────────────────────────────────────┘
```

### Vote Success Confirmation
```
┌─────────────────────────────────────────────────────────────────┐
│ Vote Successfully Submitted! 🎉                           [✗] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ✅ Your vote has been recorded on-chain                        │
│                                                                 │
│ Transaction Details:                                            │
│ • Vote: Option A - Development-Focused Allocation              │
│ • Transaction Hash: 5K8j...mN9p                               │
│ • Block: 234,567,891                                           │
│ • Fee Paid: 0.00025 SOL                                       │
│ • Confirmation Time: 2.3 seconds                              │
│                                                                 │
│ What's Next:                                                    │
│ • Your vote is now part of the public record                  │
│ • Results will update in real-time                            │
│ • You'll be notified when voting ends                         │
│ • Join the discussion to share your reasoning                  │
│                                                                 │
│ Current Status:                                                 │
│ Option A: 46% (41 votes) - Your vote included                 │
│ Participation: 68/89 members (76%)                            │
│ Time Remaining: 1d 8h 15m                                     │
│                                                                 │
│ [View Updated Results] [Join Discussion] [Share Vote] [Close]  │
└─────────────────────────────────────────────────────────────────┘
```

## Voting History & Analytics

### Personal Voting Dashboard
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ My Voting History & Analytics                                                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ← Back to Voting                               [📊 Export Data] [📈 Full Analytics] [⚙️]       │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────────────┐
│  Total Votes    │ Participation   │  Success Rate   │ Voting Power    │    Member Since         │
│                 │      Rate       │                 │                 │                         │
│       23        │      89%        │      78%        │    8.4/10       │   Jan 15, 2024          │
│  (All time)     │  Above average  │ (Winning side)  │  🔥 Top 15%     │   (45 days ago)         │
│  📈 +8 this     │   (Platform:    │  Platform avg:  │   Expert tier   │                         │
│      month      │    67%)         │    65%)         │                 │                         │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ VOTING PERFORMANCE TRENDS                                                                      │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┬───────────────────────────────────┬─────────────────────────┐ │
│ │         Participation           │           Success Rate            │      Voting Power       │ │
│ │                                 │                                   │                         │ │
│ │ 100%│                          │ 100%│                            │ 10.0│                   │ │
│ │     │     ●●●●●●               │     │ ●●●    ●●●●                │     │     ●●●●●●●       │ │
│ │  75%│   ●●●●●●●●               │  75%│●●●●● ●●●●●●●                │  7.5│   ●●●●●●●●●       │ │
│ │     │ ●●●●●●●●●●               │     │●●●●●●●●●●●●●                │     │ ●●●●●●●●●●●       │ │
│ │  50%│●●●●●●●●●●●               │  50%│●●●●●●●●●●●●●                │  5.0│●●●●●●●●●●●●       │ │
│ │     │                          │     │                            │     │                   │ │
│ │  25%└─Jan─Feb─Mar               │  25%└─Jan─Feb─Mar                │  2.5└─Jan─Feb─Mar        │ │
│ │                                 │                                   │                         │ │
│ │ Trend: ↗️ Improving (+5%)       │ Trend: ↗️ Improving (+8%)        │ Trend: ↗️ Rising (+1.2) │ │
│ │ Target: Maintain >85%           │ Target: Achieve >80%             │ Target: Reach 9.0/10    │ │
│ └─────────────────────────────────┴───────────────────────────────────┴─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ RECENT VOTING HISTORY                                                                          │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Date       │ Community           │ Vote                        │ Your Choice    │ Result      │ │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2h ago     │ DeFi Traders        │ DeFi Protocol Upgrade       │ ✅ YES        │ 🟡 Pending │ │
│ 4h ago     │ GameFi Union        │ Community Fee Structure     │ ❌ NO         │ ❌ REJECTED │ │
│ 1d ago     │ NFT Creators        │ Artist Verification         │ ✅ YES        │ ✅ PASSED   │ │
│ 3d ago     │ Web3 Governance     │ Governance Token Staking    │ ❌ NO         │ 🟡 Pending │ │
│ 1w ago     │ DeFi Traders        │ Treasury Management         │ ✅ Option B   │ ✅ PASSED   │ │
│ 1w ago     │ GameFi Union        │ Partnership Proposal        │ ✅ YES        │ ✅ PASSED   │ │
│ 2w ago     │ DeFi Traders        │ Community Guidelines        │ ✅ YES        │ ✅ PASSED   │ │
│ 2w ago     │ Web3 Learning       │ Educational Content Plan    │ ✅ Option A   │ ❌ REJECTED │ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Real-Time Updates

### Live Vote Updates Widget
```
┌─────────────────────────────────────────────┐
│ 🔴 LIVE: DeFi Protocol Upgrade             │
├─────────────────────────────────────────────┤
│ ████████████████████████████████████████████ │
│ 67% YES (165 votes)                        │
│ ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░ │
│ 33% NO (82 votes)                          │
│                                             │
│ 📊 Live Stats:                             │
│ • Participation: 247/247 (100%)            │
│ • Last vote: 23 seconds ago                │
│ • Voting rate: 12 votes/hour               │
│ • Trend: Steady YES majority               │
│                                             │
│ ⏰ Ends in: 2h 15m 32s                     │
│ [Watch Live] [Join Discussion]             │
└─────────────────────────────────────────────┘
```

### Push Notification Examples
```
🔔 Voting reminder: "Treasury Allocation" ends in 2 hours
🔔 New vote: "Community Guidelines Update" in DeFi Traders
🔔 Vote result: "Fee Structure" was REJECTED (45% YES)
🔔 Achievement: You've reached 90% voting participation! 🎉
```

## Accessibility Features

### Screen Reader Support
- **Vote Options**: Clear labeling and description of each option
- **Results**: Live announcements of vote count changes
- **Progress**: Time remaining and participation updates
- **Confirmation**: Clear confirmation of vote submission

### Keyboard Navigation
- **Tab Order**: Logical flow through vote options and actions
- **Arrow Keys**: Navigate between vote options
- **Space/Enter**: Select options and submit votes
- **Escape**: Cancel vote submission or close modals

### Voice Commands
- "Vote yes on current proposal"
- "Show me my voting history"
- "What votes are ending today"
- "Read vote options aloud"

This voting interface wireframe provides a comprehensive, engaging, and accessible voting experience that encourages participation while maintaining transparency and usability across all devices. 