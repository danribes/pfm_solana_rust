# Results Visualization & Analytics Wireframe

## Results Dashboard

### Desktop Layout (1200px+)
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Voting Results & Analytics                                                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ← Voting                       [🔍 Search results...] [📊 Export] [📅 Date Range] [⚙️ Settings] │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ RESULTS OVERVIEW                                                                               │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────────┐ │
│ │  Completed  │   Your      │  Success    │   Average   │  Trending   │      Quick Actions      │ │
│ │   Votes     │ Accuracy    │   Rate      │ Participation│   Topics    │                         │ │
│ │             │             │             │             │             │                         │ │
│ │     156     │    78%      │    67%      │    73%      │  Governance │  [📊 Generate Report]   │ │
│ │ This month: │ (Winning    │ (Platform   │ (Above      │  DeFi Rules │  [📤 Share Results]     │ │
│ │     23      │  side)      │  average)   │  average)   │  Treasury   │  [🔍 Deep Analysis]     │ │
│ │     23      │  side)      │  average)   │  average)   │  Treasury   │  [🔍 Deep Analysis]     │ │
│ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ RECENT RESULTS                                                                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ✅ PASSED: DeFi Protocol Upgrade                               Completed 2 hours ago        │ │
│ │ DeFi Traders Community • Final Result: 69% YES (170 votes)                                │ │
│ │ Participation: 247/247 (100%) • Your vote: ✅ YES • You were on the winning side          │ │
│ │                                                                                             │ │
│ │ 📊 Final Results:                                                                           │ │
│ │ YES: ████████████████████████████████████████████████████████████████ 69% (170 votes)     │ │
│ │ NO:  ██████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 31% (77 votes)      │ │
│ │                                                                                             │ │
│ │ [📊 Detailed Analysis] [💬 View Discussion] [📤 Share Result] [🏆 Celebration]             │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ❌ REJECTED: Community Fee Structure                          Completed 6 hours ago        │ │
│ │ GameFi Union • Final Result: 45% YES (40 votes)                                           │ │
│ │ Participation: 89/89 (100%) • Your vote: ❌ NO • You were on the winning side             │ │
│ │                                                                                             │ │
│ │ 📊 Final Results:                                                                           │ │
│ │ YES: ████████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░ 45% (40 votes)     │ │
│ │ NO:  ████████████████████████████████████████████████████████████████ 55% (49 votes)      │ │
│ │                                                                                             │ │
│ │ [📊 Detailed Analysis] [💬 View Discussion] [🔄 Follow-up Proposal]                        │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ✅ PASSED: Treasury Allocation - Option B Selected            Completed 1 day ago          │ │
│ │ GameFi Union • Final Result: Option B (38 votes - 43%)                                    │ │
│ │ Participation: 87/89 (98%) • Your vote: ✅ Option B • You were on the winning side        │ │
│ │                                                                                             │ │
│ │ 📊 Final Results:                                                                           │ │
│ │ Option A: ████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░ 35% (30 votes)   │ │
│ │ Option B: ███████████████████████████████████████████████████████░░░░░░░ 43% (38 votes)   │ │
│ │ Option C: ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 22% (19 votes)   │ │
│ │                                                                                             │ │
│ │ [📊 Implementation Timeline] [💬 Discussion] [📋 Action Items]                             │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ANALYTICS & INSIGHTS                                                                           │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┬───────────────────────────────────┬─────────────────────────┐ │
│ │        Participation Trends     │         Vote Outcomes             │    Your Performance     │ │
│ │                                 │                                   │                         │ │
│ │ 100%│                          │  Passed: ████████████████ 67%     │ Accuracy: 78% ⭐⭐⭐⭐   │ │
│ │     │     ●●●●●●               │  Rejected: ████████ 33%            │ Participation: 89%      │ │
│ │  75%│   ●●●●●●●●               │                                   │ Streak: 12 votes        │ │
│ │     │ ●●●●●●●●●●               │  By Community:                    │ Best Category: DeFi     │ │
│ │  50%│●●●●●●●●●●●               │  • DeFi Traders: 85% pass rate    │ Voting Power: 8.4/10    │ │
│ │     │                          │  • GameFi Union: 60% pass rate   │                         │ │
│ │  25%└─Jan─Feb─Mar               │  • NFT Creators: 75% pass rate   │ [📊 Full Report]        │ │
│ └─────────────────────────────────┴───────────────────────────────────┴─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Vote Result Analysis

### Individual Result Deep Dive
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Results                                    [📤 Share] [📊 Export] [🔖 Bookmark]      │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ✅ PASSED: DeFi Protocol Upgrade                                    Completed 2 hours ago      │
│ DeFi Traders Community • Proposed by @alice.sol • Vote ID: #DT-2024-003                       │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────────────┐
│  Final Result   │  Participation  │   Vote Period   │   Quorum Met    │       Impact Level      │
│                 │                 │                 │                 │                         │
│  69% YES        │    247/247      │    7 days       │  ✅ 100% req    │       🔥 High          │
│  170 votes      │    (100%)       │  Completed on   │    50% min      │  Platform-wide change  │
│  31% NO         │   🏆 Perfect    │   schedule      │                 │                         │
│  77 votes       │  participation  │                 │                 │                         │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DETAILED RESULTS BREAKDOWN                                                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│ 📊 Vote Distribution:                                                                          │
│                                                                                                │
│ ✅ YES (69% - 170 votes)                                                                      │
│ ████████████████████████████████████████████████████████████████████████████████████████████   │
│ ████████████████████████████████████████████████████████████████████████████████████████████   │
│ ████████████████████████████████████████████████████████████████████████████████████████████   │
│                                                                                                │
│ ❌ NO (31% - 77 votes)                                                                        │
│ ████████████████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                                                                │
│ 🕐 Voting Timeline:                                                                           │
│ Day 1: ████████ 32 votes (56% YES)                                                           │
│ Day 2: ████████████ 48 votes (62% YES)                                                       │
│ Day 3: ████████████████ 64 votes (67% YES)                                                   │
│ Day 4: ████████████████████ 89 votes (68% YES)                                               │
│ Day 5: ████████████████████████ 156 votes (69% YES)                                          │
│ Day 6: ████████████████████████████ 198 votes (69% YES)                                      │
│ Day 7: ████████████████████████████████ 247 votes (69% YES) ✅ FINAL                        │
│                                                                                                │
│ 📈 Key Insights:                                                                              │
│ • Early YES lead maintained throughout voting period                                          │
│ • Consistent 69% support in final 3 days                                                     │
│ • No significant voting surges or coordinated campaigns detected                              │
│ • Broad consensus achieved with healthy debate                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DEMOGRAPHIC ANALYSIS                                                                           │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┬───────────────────────────────────┬─────────────────────────┐ │
│ │       By Member Tenure          │         By Voting Power           │    By Activity Level    │ │
│ │                                 │                                   │                         │ │
│ │ New (0-30d): 67% YES (23 votes) │ High (8-10): 78% YES (45 votes)  │ Very Active: 72% YES    │ │
│ │ Growing (31-90d): 71% YES       │ Med (5-7): 68% YES (89 votes)    │ Active: 69% YES         │ │
│ │ Established (90d+): 69% YES     │ Low (1-4): 62% YES (36 votes)    │ Moderate: 65% YES       │ │
│ │                                 │                                   │ Occasional: 58% YES     │ │
│ │ Insight: Consistent support     │ Insight: Higher power = more YES  │ Insight: Activity ↑ YES │ │
│ │ across all tenure levels        │ suggests informed voting          │ suggests engagement     │ │
│ └─────────────────────────────────┴───────────────────────────────────┴─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DISCUSSION IMPACT & SENTIMENT                                                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 💬 Discussion Summary: 89 comments, 234 reactions                                             │
│                                                                                                │
│ 📊 Sentiment Analysis:                                                                         │
│ Positive: ████████████████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░ 72%     │
│ Neutral:  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 18%     │
│ Negative: ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 10%     │
│                                                                                                │
│ 🎯 Key Discussion Points:                                                                     │
│ • Gas fee reduction benefits (mentioned 34 times) - Positive impact                          │
│ • Yield farming improvements (mentioned 28 times) - Strong support                           │
│ • Implementation timeline concerns (mentioned 12 times) - Addressed by team                  │
│ • Security audit completion (mentioned 8 times) - Reassurance provided                       │
│                                                                                                │
│ 🏆 Most Influential Comments:                                                                 │
│ 1. @alice.sol's technical analysis (👍 45, 💬 12 replies)                                   │
│ 2. @security_expert.eth's audit review (👍 38, 💬 8 replies)                                │
│ 3. @community_mod's implementation timeline (👍 29, 💬 15 replies)                          │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Mobile Results Interface (< 768px)

### Mobile Results Dashboard
```
┌─────────────────────────────────────────────┐
│ ☰ Results                            [🔍]  │
├─────────────────────────────────────────────┤
│ [Recent] [All Time] [My Votes] [Analytics] │
├─────────────────────────────────────────────┤
│ Your accuracy: 78% • 89% participation     │
│ 156 completed votes • 23 this month        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ✅ PASSED - 2h ago                          │
│ ┌─────────────────────────────────────────┐ │
│ │ 🗳️ DeFi Protocol Upgrade               │ │
│ │ DeFi Traders Community                 │ │
│ │                                         │ │
│ │ 69% YES (170 votes)                    │ │
│ │ ██████████████████████████████████████  │ │
│ │ 31% NO (77 votes)                      │ │
│ │ ████████████████░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ │                                         │ │
│ │ 100% participation (247/247)           │ │
│ │ ✅ You voted: YES (winning side)       │ │
│ │                                         │ │
│ │ [View Details] [Discussion]            │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ❌ REJECTED - 6h ago                        │
│ ┌─────────────────────────────────────────┐ │
│ │ 🗳️ Community Fee Structure             │ │
│ │ GameFi Union                           │ │
│ │                                         │ │
│ │ 45% YES (40 votes)                     │ │
│ │ ████████████████████████░░░░░░░░░░░░░░░ │ │
│ │ 55% NO (49 votes)                      │ │
│ │ ██████████████████████████████████████  │ │
│ │                                         │ │
│ │ 100% participation (89/89)             │ │
│ │ ✅ You voted: NO (winning side)        │ │
│ │                                         │ │
│ │ [View Details] [Follow-up]             │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ✅ PASSED - 1d ago                          │
│ ┌─────────────────────────────────────────┐ │
│ │ 🗳️ Treasury Allocation                  │ │
│ │ GameFi Union                           │ │
│ │                                         │ │
│ │ Option A: 35% (30 votes)               │ │
│ │ ████████████████████████████████░░░░░░░ │ │
│ │ Option B: 43% (38 votes) ✅ WINNER     │ │
│ │ ████████████████████████████████████████ │ │
│ │ Option C: 22% (19 votes)               │ │
│ │ ██████████████████░░░░░░░░░░░░░░░░░░░░░ │ │
│ │                                         │ │
│ │ ✅ You voted: Option B (winning side)  │ │
│ │                                         │ │
│ │ [Implementation] [Timeline]            │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [Load More Results] [📊 Analytics]         │
└─────────────────────────────────────────────┘
```

## Result Sharing & Export

### Share Result Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ Share Voting Result                                        [✗] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🗳️ DeFi Protocol Upgrade - PASSED (69% YES)                   │
│ DeFi Traders Community • Completed 2 hours ago                 │
│                                                                 │
│ Share Options:                                                  │
│                                                                 │
│ 📱 Social Media:                                                │
│ [📘 Facebook] [🐦 Twitter] [💼 LinkedIn] [📸 Instagram]       │
│                                                                 │
│ 💬 Direct Share:                                                │
│ [📧 Email] [💬 Discord] [📱 Telegram] [📋 Copy Link]          │
│                                                                 │
│ 📊 Export Data:                                                 │
│ [📄 PDF Report] [📊 Excel/CSV] [📋 Summary Text]              │
│                                                                 │
│ Custom Message:                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Exciting news! The DeFi Protocol Upgrade proposal passed   │ │
│ │ with 69% YES votes in our DeFi Traders community. 100%     │ │
│ │ participation shows how engaged our members are! 🚀        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ Characters: 187/280                                             │
│                                                                 │
│ Include:                                                        │
│ ☑️ Vote percentages and counts                                 │
│ ☑️ Participation rate                                          │ │
│ ☑️ Community name and proposal title                          │
│ ☐ Your personal vote (privacy option)                         │
│ ☐ Detailed breakdown and charts                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                          [Cancel] [Share Now]                  │
└─────────────────────────────────────────────────────────────────┘
```

## Analytics Deep Dive

### Personal Voting Analytics
```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Your Voting Analytics - Deep Dive                                                             │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ← Results Dashboard                          [📊 Export Report] [📅 Date Range] [⚙️ Settings] │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PERFORMANCE SUMMARY                                                                            │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────────────────┐ │
│ │   Overall   │ Winning     │ Response    │   Voting    │ Community   │        Badges           │ │
│ │  Accuracy   │   Streak    │    Time     │   Power     │  Impact     │       Earned            │ │
│ │             │             │             │             │             │                         │ │
│ │    78%      │   12 wins   │   2.3 hrs   │   8.4/10    │   High      │  🏆 Active Voter       │ │
│ │ Top 25%     │ Current     │  (Median)   │  Top 15%    │ Influential │  🎯 Quick Responder    │ │
│ │ Platform    │   streak    │  Platform   │   Expert    │   member    │  🧠 Informed Voter     │ │
│ │             │             │  avg: 6.8h  │    tier     │             │  📈 Trend Spotter      │ │
│ └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ VOTING PATTERNS & INSIGHTS                                                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┬───────────────────────────────────┬─────────────────────────┐ │
│ │        Vote Distribution        │           Category Success        │    Time Patterns        │ │
│ │                                 │                                   │                         │ │
│ │ YES votes: ████████████ 65%     │ DeFi: ████████████████ 85%        │ ⏰ Best time: 2-4 PM   │ │
│ │ NO votes: ████████ 35%          │ Governance: ██████████ 70%        │ 📅 Most active: Weekdays│ │
│ │                                 │ Treasury: ████████████ 78%        │ 🚀 Quick votes: 73%     │ │
│ │ Multi-choice breakdown:         │ Technical: ██████████ 72%         │ 🤔 Delayed votes: 27%   │ │
│ │ Option A: 45%                   │ Social: ████████ 58%              │                         │ │
│ │ Option B: 35%                   │ Marketing: ██████ 45%             │ Insight: You prefer     │ │
│ │ Option C: 20%                   │                                   │ voting during work hours│ │
│ │                                 │ Strongest: DeFi & Treasury        │ and make quick decisions│ │
│ └─────────────────────────────────┴───────────────────────────────────┴─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ COMMUNITY IMPACT ANALYSIS                                                                      │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Your votes have been influential in shaping community decisions                               │
│                                                                                                │
│ 🎯 Most Impactful Votes:                                                                      │
│ 1. Treasury Allocation (GameFi Union) - Your early YES vote influenced 12 others            │
│ 2. DeFi Protocol Upgrade - Your technical analysis comment got 45 likes                     │
│ 3. Community Guidelines - Your suggested amendments were incorporated                         │
│                                                                                                │
│ 📈 Influence Metrics:                                                                         │
│ • Vote correlation with final outcome: 78% (strong predictor)                               │
│ • Discussion participation: 23 comments on voted proposals                                   │
│ • Community member citations: 8 members referenced your votes                               │
│ • Follow rate: 12 members follow your voting pattern                                        │
│                                                                                                │
│ 🏆 Recognition:                                                                               │
│ • "Thoughtful Voter" badge - earned for detailed comment participation                      │
│ • "Community Builder" mention in 3 post-vote discussions                                    │
│ • Top 5% influence score in DeFi Traders community                                          │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Accessibility Features

### Screen Reader Support
- **Result Announcements**: Clear status and percentage announcements
- **Chart Data**: Alternative text descriptions for all visualizations
- **Timeline Navigation**: Structured navigation through voting periods
- **Export Options**: Accessible format options for different needs

### Keyboard Navigation
- **Tab Order**: Logical flow through results and analytics
- **Arrow Keys**: Navigate through vote options and time periods
- **Enter/Space**: Expand detailed views and export options
- **Shortcuts**: R (Results), A (Analytics), E (Export), S (Share)

### Voice Commands
- "Show me recent voting results"
- "What's my voting accuracy"
- "Export this result as PDF"
- "Share the latest vote result"

This results visualization wireframe provides comprehensive analytics and insights while maintaining excellent accessibility and usability across all devices. 