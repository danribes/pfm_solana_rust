# Community Browser & Discovery Wireframe

## Community Discovery Interface

### Desktop Layout (1200px+)
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Community Discovery                                                                            │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ← Dashboard                      [🔍 Search communities, topics, members...] [🎯 For You] [⚙️]   │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DISCOVERY FILTERS & CATEGORIES                                                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Categories: [All] [DeFi] [NFT] [Gaming] [Education] [Governance] [Social] [Development]       │
│ Size: [Any] [<50] [50-200] [200-1000] [1000+] | Activity: [All] [High] [Medium] [Low]        │
│ Status: [Open] [Invite Only] [Application Required] | Sort: [Recommended] [Popular] [Newest]  │
│ [Clear All Filters] | Showing 24 of 156 communities                                          │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬─────────────────────────────────────────────────────────────────────────────────┐
│              │ COMMUNITY GRID                                                                  │
│ QUICK FILTERS│                                                                                 │
│              │ ┌─────────────────────┬─────────────────────┬─────────────────────────────────┐ │
│ 🔥 Trending  │ │ 🟢 DeFi Traders      │ 🟢 GameFi Union      │ 🟡 NFT Creators Hub           │ │
│   (12 new)   │ │ Community           │ Community           │ Community                     │ │
│              │ │                     │                     │                               │ │
│ 🚀 New       │ │ [   Community   ]   │ [   Community   ]   │ [   Community   ]             │ │
│   (8 today)  │ │ [     Image     ]   │ [     Image     ]   │ [     Image     ]             │ │
│              │ │                     │                     │                               │ │
│ ⭐ Recommend │ │ 247 members         │ 89 members          │ 45 members                    │ │
│   (6 for you)│ │ 🗳️ 12 active votes  │ 🗳️ 7 active votes   │ 🗳️3 active votes             │ │
│              │ │ 📈 +15% growth      │ 📈 +8% growth       │ ⏳ Pending approval           │ │
│ 📚 Learning  │ │ "DeFi trading..."   │ "Gaming & DeFi..."  │ "NFT artists..."              │ │
│   (4 communities)│                   │                     │                               │ │
│              │ │ DeFi, Trading       │ Gaming, DeFi        │ NFT, Art, Creators            │ │
│ 🏗️ Building  │ │ ⭐⭐⭐⭐⭐ 4.8/5     │ ⭐⭐⭐⭐ 4.2/5       │ ⭐⭐⭐⭐ 4.5/5                │ │
│   (7 communities)│                   │                     │                               │ │
│              │ │ [Join Community]    │ [Join Community]    │ [Apply to Join]               │ │
│ 💰 DeFi      │ │ [Learn More]        │ [Learn More]        │ [Learn More]                  │ │
│   (23 communities)│                  │                     │                               │ │
│              │ └─────────────────────┴─────────────────────┴─────────────────────────────────┘ │
│ 🎮 Gaming    │                                                                                 │
│   (15 communities)┌─────────────────────┬─────────────────────┬─────────────────────────────────┐ │
│              │ │ 🟢 Web3 Learning     │ 🟢 Solana Builders   │ 🟢 Governance Hub             │ │
│ 🎨 Creative  │ │ Circle              │ DAO                 │                               │ │
│   (9 communities)│                     │                     │                               │ │
│              │ │ [   Community   ]   │ [   Community   ]   │ [   Community   ]             │ │
│ 🏛️ DAO       │ │ [     Image     ]   │ [     Image     ]   │ [     Image     ]             │ │
│   (31 communities)│                   │                     │                               │ │
│              │ │ 23 members          │ 156 members         │ 89 members                    │ │
│              │ │ 🗳️ 1 active vote    │ 🗳️ 8 active votes   │ 🗳️ 15 active votes           │ │
│              │ │ 📈 +45% growth      │ 📈 +12% growth      │ 📈 +22% growth                │ │
│              │ │ "Learn Web3..."     │ "Build on Solana"   │ "Platform governance"         │ │
│              │ │                     │                     │                               │ │
│              │ │ Education, Web3     │ Development, Tech   │ Governance, Voting            │ │
│              │ │ ⭐⭐⭐⭐⭐ 4.9/5     │ ⭐⭐⭐⭐ 4.6/5       │ ⭐⭐⭐⭐ 4.4/5                │ │
│              │ │                     │                     │                               │ │
│              │ │ [Join Community]    │ [Join Community]    │ [Join Community]              │ │
│              │ │ [Learn More]        │ [Learn More]        │ [Learn More]                  │ │
│              │ └─────────────────────┴─────────────────────┴─────────────────────────────────┘ │
│              │                                                                                 │
│              │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│              │ │ [Load More Communities] [Back to Top] [Suggest a Community]                │ │
│              │ └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────┤                                                                                 │
               │ ┌─────────────────────────────────────────────────────────────────────────────┐ │
               │ │                            TRENDING TODAY                                    │ │
               │ ├─────────────────────────────────────────────────────────────────────────────┤ │
               │ │ 🔥 "Should DeFi protocols implement cross-chain bridges?" - 234 votes       │ │
               │ │ 🚀 New community: "Layer 2 Scaling Solutions" - 45 members in 2 days       │ │
               │ │ ⭐ "Solana NFT Marketplace Governance" reaches 1000 members                  │ │
               │ │ 💡 Featured: "Web3 UX Research Community" - Join the discussion             │ │
               │ └─────────────────────────────────────────────────────────────────────────────┘ │
               └─────────────────────────────────────────────────────────────────────────────────┘
```

### Community Detail View
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Browse                                              [⭐ Favorite] [📤 Share] [🚨 Report] │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🟢 DeFi Traders Community                                    [🟢 Open] [Join Community] [💬]     │
│ "A vibrant community for DeFi trading strategies, market analysis, and educational content"     │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────────────┐
│  247 Members    │   12 Active     │     4.8/5       │    Founded      │       Categories        │
│                 │    Votes        │    Rating       │  Jan 15, 2024   │                         │
│   📈 +15%       │  ⏰ 2 ending    │  ⭐⭐⭐⭐⭐       │  (45 days ago)  │  DeFi, Trading, Finance │
│  (30 days)      │   today         │   (89 reviews)  │                 │                         │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📊 Overview | 👥 Members | 🗳️ Active Votes | 📈 Analytics | ⚙️ Rules | 💬 Discussions         │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│ ┌─────────────────────────────────────────────────┬─────────────────────────────────────────────┐ │
│ │                COMMUNITY OVERVIEW               │               RECENT ACTIVITY               │ │
│ ├─────────────────────────────────────────────────┼─────────────────────────────────────────────┤ │
│ │                                                 │                                             │ │
│ │ About:                                          │ 🗳️ Budget Proposal 2024                     │ │
│ │ DeFi Traders is a community focused on         │    89% participation • 2 hours ago          │ │
│ │ sharing trading strategies, analyzing market    │    Current result: 67% YES                  │ │
│ │ trends, and educating newcomers about          │                                             │ │
│ │ decentralized finance protocols.                │ 💬 "Yield Farming Best Practices"          │ │
│ │                                                 │    23 replies • 4 hours ago                │ │
│ │ Community Values:                               │    Last reply by @alice.sol                │ │
│ │ • Knowledge sharing and education               │                                             │ │
│ │ • Respectful discourse and debate              │ 👤 @bob.eth joined the community            │ │
│ │ • Evidence-based investment discussions        │    Welcome message sent • 6 hours ago      │ │
│ │ • Support for both beginners and experts       │                                             │ │
│ │                                                 │ 🗳️ Fee Structure Proposal                   │ │
│ │ Governance Model:                               │    Voting ended • REJECTED • 1 day ago    │ │
│ │ • Democratic voting on all major decisions     │    Final result: 45% YES, 55% NO           │ │
│ │ • 7-day voting periods for proposals           │                                             │ │
│ │ • 50% quorum requirement                       │ 📊 Monthly statistics published              │ │
│ │ • Any member can submit proposals              │    Community health: 94/100 • 2 days ago   │ │
│ │                                                 │                                             │ │
│ │ Admin Team:                                     │ [View All Activity →]                      │ │
│ │ 👤 @alice.sol - Founder & Admin               │                                             │ │
│ │ 👤 @charlie.sol - Moderator                   │                                             │ │
│ │ 👤 @david.eth - Community Manager             │                                             │ │
│ └─────────────────────────────────────────────────┴─────────────────────────────────────────────┘ │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                              COMMUNITY STATISTICS                                          │ │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                             │ │
│ │ ┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────────┐ │ │
│ │ │   Member Growth     │   Voting Activity   │   Discussion Eng.   │   Community Health     │ │ │
│ │ │                     │                     │                     │                        │ │ │
│ │ │ 250 │               │ 100%│               │  50 │               │   Score: 94/100        │ │ │
│ │ │     │     ●●●       │     │ ████          │     │     ●●●       │                        │ │ │
│ │ │ 200 │   ●●●         │  75%│ ████ ██       │  40 │   ●●●         │   🟢 Excellent         │ │ │
│ │ │     │ ●●●           │     │ ████ ███      │     │ ●●●           │                        │ │ │
│ │ │ 150 │●●●            │  50%│ ████ ████     │  30 │●●●            │   Trending: ↗️ +5%     │ │ │
│ │ │     │               │     │ ████ ████     │     │               │                        │ │ │
│ │ │ 100 └─Jan─Feb─Mar   │  25%└─Jan─Feb─Mar   │  20 └─Jan─Feb─Mar   │   Last updated: 2d ago │ │ │
│ │ │                     │                     │                     │                        │ │ │
│ │ │ +15% growth         │ 89% participation   │ 23 discussions/wk   │   [View Full Report]   │ │ │
│ │ │ (30 days)           │ (above average)     │ (very active)       │                        │ │ │
│ │ └─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                              JOIN THIS COMMUNITY                                           │ │
│ ├─────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │                                                                                             │ │
│ │ Requirements:                                                                               │ │
│ │ ✅ Valid Solana wallet connection                                                          │ │
│ │ ✅ Agree to community guidelines                                                           │ │
│ │ ✅ Complete brief introduction (optional)                                                  │ │
│ │                                                                                             │ │
│ │ Benefits of joining:                                                                        │ │
│ │ • Participate in all community votes                                                       │ │
│ │ • Access to exclusive trading insights and strategies                                      │ │
│ │ • Connect with experienced DeFi traders and educators                                      │ │
│ │ • Early access to new protocol analysis and reviews                                        │ │
│ │ • Contribute to community governance and decision-making                                   │ │
│ │                                                                                             │ │
│ │              [🔗 Connect Wallet & Join] [📋 Read Community Rules First]                   │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Community Browser (< 768px)
```
┌─────────────────────────────────────────────┐
│ ☰ Communities                         [🔍] │
├─────────────────────────────────────────────┤
│ [🎯 For You] [🔥 Trending] [📚 Categories] │
├─────────────────────────────────────────────┤
│ 🔍 Search communities, topics...            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Filters: [All] [DeFi] [Gaming] [NFT] [More]│
│ Size: [Any ▼] Activity: [All ▼] [Clear]    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🟢 DeFi Traders Community                  │
│ ┌─────────────────────────────────────────┐ │
│ │           Community Image               │ │
│ └─────────────────────────────────────────┘ │
│ 247 members • 12 active votes              │
│ ⭐⭐⭐⭐⭐ 4.8/5 • 📈 +15% growth           │
│ "DeFi trading strategies and analysis"     │
│ DeFi, Trading, Finance                     │
│ [Join Community] [Learn More]              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🟢 GameFi Union                            │
│ ┌─────────────────────────────────────────┐ │
│ │           Community Image               │ │
│ └─────────────────────────────────────────┘ │
│ 89 members • 7 active votes                │
│ ⭐⭐⭐⭐ 4.2/5 • 📈 +8% growth             │
│ "Gaming and DeFi intersection"             │
│ Gaming, DeFi, Entertainment                │
│ [Join Community] [Learn More]              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🟡 NFT Creators Hub                         │
│ ┌─────────────────────────────────────────┐ │
│ │           Community Image               │ │
│ └─────────────────────────────────────────┘ │
│ 45 members • 3 active votes                │
│ ⭐⭐⭐⭐ 4.5/5 • ⏳ Application required    │
│ "Platform for NFT artists and collectors" │
│ NFT, Art, Creators                         │
│ [Apply to Join] [Learn More]              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [Load More...] [📱 Create Community]       │
└─────────────────────────────────────────────┘
```

### Mobile Community Detail View
```
┌─────────────────────────────────────────────┐
│ ← DeFi Traders Community            [⭐][⚙️] │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │           Community Banner              │ │
│ └─────────────────────────────────────────┘ │
│ 🟢 Open Community                          │
│ 247 members • ⭐ 4.8/5 • 📈 +15%          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ "A vibrant community for DeFi trading      │
│ strategies, market analysis, and            │
│ educational content"                        │
├─────────────────────────────────────────────┤
│ 🗳️ 12 active votes (2 ending today)       │
│ 💬 23 discussions this week                │
│ 📊 89% voting participation                │
│ 👥 Founded Jan 15, 2024                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ About | Members | Votes | Rules | Activity  │
├─────────────────────────────────────────────┤
│ Community Values:                           │
│ • Knowledge sharing and education           │
│ • Respectful discourse and debate          │
│ • Evidence-based discussions               │
│ • Support for all skill levels            │
│                                             │
│ Governance:                                 │
│ • Democratic voting (7-day periods)        │
│ • 50% quorum requirement                   │
│ • Any member can propose                   │
│                                             │
│ Admin Team:                                 │
│ 👤 alice.sol - Founder & Admin            │
│ 👤 charlie.sol - Moderator                │
│ 👤 david.eth - Community Manager          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Recent Activity:                            │
│ 🗳️ Budget Proposal 2024                    │
│ 89% participation • 2h ago                 │
│                                             │
│ 💬 "Yield Farming Best Practices"          │
│ 23 replies • 4h ago                       │
│                                             │
│ 👤 bob.eth joined • 6h ago                 │
│                                             │
│ [View All Activity]                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Ready to join?                              │
│ ✅ Connect wallet                           │
│ ✅ Agree to guidelines                      │
│ ✅ Optional introduction                    │
│                                             │
│ [🔗 Join Community] [📋 Read Rules]        │
└─────────────────────────────────────────────┘
```

## Join Community Flow

### Join Community Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ Join DeFi Traders Community                               [✗] │
├─────────────────────────────────────────────────────────────────┤
│                     Step 1 of 3: Wallet Connection             │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 33%   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Please connect your wallet to join this community              │
│                                                                 │
│ 🔗 Current Wallet: alice.sol                                   │
│ 📍 4vJ9...bkLKi                                                │
│ 💰 Balance: 2.45 SOL                                           │
│ 🟢 Verified and eligible                                       │
│                                                                 │
│ Community Requirements:                                         │
│ ✅ Valid Solana wallet (connected)                            │
│ ✅ Minimum balance: 0.1 SOL (you have 2.45 SOL)              │
│ ✅ No previous violations (clean record)                       │
│ ✅ Agree to community guidelines                               │
│                                                                 │
│ Transaction Fee: ~0.00025 SOL                                  │
│ This covers the on-chain membership registration               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                    [Cancel] [Next: Guidelines →]               │
└─────────────────────────────────────────────────────────────────┘
```

### Guidelines Acceptance
```
┌─────────────────────────────────────────────────────────────────┐
│ Join DeFi Traders Community                               [✗] │
├─────────────────────────────────────────────────────────────────┤
│                   Step 2 of 3: Community Guidelines            │
│ ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 66%   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Please review and accept our community guidelines:             │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ DeFi Traders Community Guidelines                          │ │
│ │                                                             │ │
│ │ 1. Respectful Communication                                 │ │
│ │    • Be respectful and constructive in all interactions    │ │
│ │    • No harassment, discrimination, or personal attacks    │ │
│ │    • Use appropriate language and tone                     │ │
│ │                                                             │ │
│ │ 2. Quality Content                                          │ │
│ │    • Share valuable insights and well-researched content   │ │
│ │    • Avoid spam, promotional content, or low-effort posts  │ │
│ │    • Cite sources when sharing analysis or data            │ │
│ │                                                             │ │
│ │ 3. Governance Participation                                 │ │
│ │    • Participate thoughtfully in community votes           │ │
│ │    • Research proposals before voting                      │ │
│ │    • Respect the community's democratic decisions          │ │
│ │                                                             │ │
│ │ 4. Financial Responsibility                                 │ │
│ │    • No financial advice or investment recommendations     │ │
│ │    • Share information for educational purposes only       │ │
│ │    • DYOR (Do Your Own Research) principle applies         │ │
│ │                                                             │ │
│ │ 5. Privacy and Security                                     │ │
│ │    • Never share private keys or sensitive information     │ │
│ │    • Report suspicious activity to moderators              │ │
│ │    • Protect your own and others' privacy                  │ │
│ │                                                             │ │
│ │ Violations may result in warnings, temporary suspension,   │ │
│ │ or permanent removal from the community.                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ☐ I have read and agree to the community guidelines           │ │
│ ☐ I understand that violations may result in removal          │ │
│ ☐ I agree to participate constructively in governance         │ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                [← Back] [Next: Confirmation →]                 │
└─────────────────────────────────────────────────────────────────┘
```

### Join Confirmation
```
┌─────────────────────────────────────────────────────────────────┐
│ Join DeFi Traders Community                               [✗] │
├─────────────────────────────────────────────────────────────────┤
│                    Step 3 of 3: Confirmation                   │
│ ████████████████████████████████████████████████████████ 100%   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ You're ready to join DeFi Traders Community!                   │
│                                                                 │
│ Summary:                                                        │
│ • Community: DeFi Traders                                      │
│ • Membership Type: Standard Member                             │
│ • Voting Rights: Immediate                                     │
│ • Access Level: Full community access                         │
│                                                                 │
│ Transaction Details:                                            │
│ • Registration Fee: 0.00025 SOL (~$0.01)                      │
│ • Network: Solana Mainnet                                     │
│ • Estimated Confirmation: ~30 seconds                         │ │
│                                                                 │
│ Optional Introduction:                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Hi everyone! I'm excited to join the DeFi Traders         │ │
│ │ community. I've been interested in DeFi for about a year   │ │
│ │ and looking forward to learning from experienced traders   │ │
│ │ and sharing my own insights.                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ Characters: 234/500 (optional)                                │
│                                                                 │
│ ☐ Post introduction to community feed                          │ │
│ ☐ Subscribe to community notifications                         │ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│             [← Back] [🔗 Join Community & Pay Fee]             │
└─────────────────────────────────────────────────────────────────┘
```

## Community Search & Filter

### Advanced Search Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ Advanced Community Search                                  [✗] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Search Terms:                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ DeFi trading strategies                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Categories:                                                     │
│ ☑️ DeFi & Trading    ☐ NFT & Art        ☐ Gaming & Entertainment │
│ ☐ Education         ☐ Development      ☐ Governance & DAO      │
│ ☐ Social & Network  ☐ Investment       ☐ Technology           │
│                                                                 │
│ Community Size:                                                 │
│ ◉ Any size    ○ Small (1-50)    ○ Medium (51-500)             │
│ ○ Large (501-2000)    ○ Very Large (2000+)                    │
│                                                                 │
│ Activity Level:                                                 │
│ ◉ Any activity    ○ Very High    ○ High    ○ Medium    ○ Low   │
│                                                                 │
│ Membership:                                                     │
│ ☑️ Open communities    ☑️ Application required    ☐ Invite only │
│                                                                 │
│ Founded:                                                        │
│ ◉ Any time    ○ Last week    ○ Last month    ○ Last 3 months   │
│                                                                 │
│ Rating:                                                         │
│ ◉ Any rating    ○ 4+ stars    ○ 4.5+ stars                    │
│                                                                 │
│ Language:                                                       │
│ [English ▼]                                                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│              [Clear All] [Cancel] [Search Communities]         │
└─────────────────────────────────────────────────────────────────┘
```

## Mobile Join Flow

### Mobile Join Community
```
┌─────────────────────────────────────────────┐
│ Join DeFi Traders                     [✗] │
├─────────────────────────────────────────────┤
│ Step 1/3: Wallet Connection                │
│ ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░ 33%   │
├─────────────────────────────────────────────┤
│ 🔗 alice.sol connected                     │
│ 💰 2.45 SOL available                      │
│ ✅ Meets requirements                       │
│                                             │
│ Requirements:                               │
│ ✅ Valid wallet                             │
│ ✅ Min 0.1 SOL balance                     │
│ ✅ Clean record                            │
│                                             │
│ Fee: ~0.00025 SOL (~$0.01)                │
│                                             │
│ [Cancel] [Next: Guidelines]                │
└─────────────────────────────────────────────┘
```

### Mobile Guidelines
```
┌─────────────────────────────────────────────┐
│ Join DeFi Traders                     [✗] │
├─────────────────────────────────────────────┤
│ Step 2/3: Guidelines                        │
│ ████████████████████░░░░░░░░░░░░░░░ 66%    │
├─────────────────────────────────────────────┤
│ Community Guidelines:                       │
│                                             │
│ 1. Respectful Communication                 │
│ Be respectful in all interactions          │
│                                             │
│ 2. Quality Content                          │
│ Share valuable, researched content         │
│                                             │
│ 3. Governance Participation                 │
│ Participate thoughtfully in votes          │
│                                             │
│ 4. Financial Responsibility                 │
│ No financial advice, educational only      │
│                                             │
│ 5. Privacy & Security                       │
│ Protect sensitive information              │
│                                             │
│ ☐ I agree to all guidelines                │ │
│ ☐ I understand violation consequences      │
│                                             │
│ [Read Full Guidelines]                      │
│ [Back] [Next: Confirm]                     │
└─────────────────────────────────────────────┘
```

## Accessibility Features

### Screen Reader Support
- **Community Cards**: Proper headings and descriptive content
- **Filter Controls**: Clear labels and state announcements
- **Search Results**: Announced count and navigation instructions
- **Join Flow**: Step-by-step progress announcements

### Keyboard Navigation
- **Tab Order**: Logical flow through community cards and filters
- **Arrow Keys**: Navigate through community grid
- **Enter/Space**: Activate community cards and filter options
- **Escape**: Close modals and return to previous state

### Voice Commands
- "Show me DeFi communities"
- "Filter by small communities"
- "Join this community"
- "Read community guidelines"

This community browser wireframe provides an engaging, accessible interface for discovering and joining communities while maintaining excellent usability across all devices and platforms. 