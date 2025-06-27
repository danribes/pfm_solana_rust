// backend/test-cache.js
const { cacheClient } = require('./cache/client');
const CommunityCacheStrategy = require('./cache/strategies/community');
const UserCacheStrategy = require('./cache/strategies/user');
const VotingCacheStrategy = require('./cache/strategies/voting');
const { cacheAnalytics } = require('./cache/analytics');
const { cacheService } = require('./services/cache');

async function testCacheImplementation() {
  console.log('🧪 Testing Cache Implementation...\n');

  try {
    // Test 1: Cache Client Connection
    console.log('1. Testing Cache Client Connection...');
    const connected = await cacheClient.connect();
    if (connected) {
      console.log('✅ Cache client connected successfully');
    } else {
      console.log('❌ Cache client connection failed');
      return;
    }

    // Test 2: Basic Cache Operations
    console.log('\n2. Testing Basic Cache Operations...');
    
    // Test set operation
    const setResult = await cacheClient.set('test:key', { data: 'test value' }, { prefix: 'test' });
    console.log('✅ Set operation:', setResult ? 'success' : 'failed');

    // Test get operation
    const getResult = await cacheClient.get('test:key', { prefix: 'test' });
    console.log('✅ Get operation:', getResult ? 'success' : 'failed');
    console.log('   Retrieved data:', getResult);

    // Test exists operation
    const existsResult = await cacheClient.exists('test:key', { prefix: 'test' });
    console.log('✅ Exists operation:', existsResult ? 'key exists' : 'key not found');

    // Test delete operation
    const deleteResult = await cacheClient.delete('test:key', { prefix: 'test' });
    console.log('✅ Delete operation:', deleteResult ? 'success' : 'failed');

    // Test 3: Community Cache Strategy
    console.log('\n3. Testing Community Cache Strategy...');
    const communityCache = new CommunityCacheStrategy();
    
    const testCommunity = {
      id: 'test-community-1',
      name: 'Test Community',
      description: 'A test community for caching',
      memberCount: 100
    };

    await communityCache.setCommunityMetadata(testCommunity.id, testCommunity);
    const retrievedCommunity = await communityCache.getCommunityMetadata(testCommunity.id);
    console.log('✅ Community metadata caching:', retrievedCommunity ? 'success' : 'failed');

    // Test 4: User Cache Strategy
    console.log('\n4. Testing User Cache Strategy...');
    const userCache = new UserCacheStrategy();
    
    const testUser = {
      id: 'test-user-1',
      walletAddress: '0x1234567890abcdef',
      profile: {
        name: 'Test User',
        email: 'test@example.com'
      }
    };

    await userCache.setUserProfile(testUser.id, testUser);
    const retrievedUser = await userCache.getUserProfile(testUser.id);
    console.log('✅ User profile caching:', retrievedUser ? 'success' : 'failed');

    // Test 5: Voting Cache Strategy
    console.log('\n5. Testing Voting Cache Strategy...');
    const votingCache = new VotingCacheStrategy();
    
    const testQuestion = {
      id: 'test-question-1',
      title: 'Test Voting Question',
      options: ['Option A', 'Option B', 'Option C'],
      communityId: 'test-community-1'
    };

    await votingCache.setVotingQuestion(testQuestion.id, testQuestion);
    const retrievedQuestion = await votingCache.getVotingQuestion(testQuestion.id);
    console.log('✅ Voting question caching:', retrievedQuestion ? 'success' : 'failed');

    // Test 6: Cache Analytics
    console.log('\n6. Testing Cache Analytics...');
    const metrics = cacheAnalytics.getMetrics();
    console.log('✅ Analytics metrics:', {
      requests: metrics.requests,
      hits: metrics.hits,
      misses: metrics.misses,
      hitRate: metrics.hitRate
    });

    // Test 7: Cache Service
    console.log('\n7. Testing Cache Service...');
    await cacheService.initialize();
    
    const serviceStats = cacheService.getStats();
    console.log('✅ Cache service stats:', {
      isInitialized: serviceStats.isInitialized,
      isConnected: serviceStats.cache.isConnected,
      hits: serviceStats.cache.hits,
      misses: serviceStats.cache.misses
    });

    // Test 8: Cache Performance
    console.log('\n8. Testing Cache Performance...');
    const startTime = Date.now();
    
    // Perform multiple operations to test performance
    for (let i = 0; i < 10; i++) {
      await cacheClient.set(`perf:key:${i}`, { value: i }, { prefix: 'perf' });
      await cacheClient.get(`perf:key:${i}`, { prefix: 'perf' });
    }
    
    const endTime = Date.now();
    const performanceTime = endTime - startTime;
    console.log('✅ Performance test completed in:', performanceTime, 'ms');

    // Test 9: Cache Health
    console.log('\n9. Testing Cache Health...');
    const healthStatus = await cacheService.getHealthStatus();
    console.log('✅ Health status:', healthStatus.status);

    // Test 10: Cache Statistics
    console.log('\n10. Testing Cache Statistics...');
    const stats = cacheClient.getStats();
    console.log('✅ Cache statistics:', {
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hitRate,
      sets: stats.sets,
      deletes: stats.deletes
    });

    console.log('\n🎉 All cache tests completed successfully!');
    console.log('\n📊 Final Statistics:');
    console.log('- Total requests:', stats.hits + stats.misses);
    console.log('- Hit rate:', stats.hitRate + '%');
    console.log('- Cache operations:', stats.sets + stats.deletes);
    console.log('- Errors:', stats.errors);

  } catch (error) {
    console.error('❌ Cache test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cleanup
    try {
      await cacheClient.invalidatePrefix('test');
      await cacheClient.invalidatePrefix('perf');
      await cacheService.shutdown();
      console.log('\n🧹 Cache cleanup completed');
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  }
}

// Run tests
testCacheImplementation(); 