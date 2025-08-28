// backend/test_api.js
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing CMedia API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/`);
    const healthText = await healthResponse.text();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${healthText}\n`);

    // Test 2: Get service types
    console.log('2. Testing service types...');
    const typesResponse = await fetch(`${BASE_URL}/service-plans/types/service`);
    if (typesResponse.ok) {
      const types = await typesResponse.json();
      console.log(`   Status: ${typesResponse.status}`);
      console.log(`   Found ${types.length} service types`);
      types.forEach(type => console.log(`   - ${type.code}: ${type.name}`));
    } else {
      console.log(`   Error: ${typesResponse.status} ${typesResponse.statusText}`);
    }
    console.log('');

    // Test 3: Get service plans
    console.log('3. Testing service plans...');
    const plansResponse = await fetch(`${BASE_URL}/service-plans/`);
    if (plansResponse.ok) {
      const plans = await plansResponse.json();
      console.log(`   Status: ${plansResponse.status}`);
      console.log(`   Found ${plans.length} service plans`);
    } else {
      console.log(`   Error: ${plansResponse.status} ${plansResponse.statusText}`);
    }
    console.log('');

    // Test 4: Create a test service plan
    console.log('4. Testing service plan creation...');
    const createPlanResponse = await fetch(`${BASE_URL}/service-plans/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceTypeId: 1, // HOME_FIBER
        name: 'Test Fiber Plan',
        description: 'Test plan for API testing',
        monthlyFee: 29.99,
        currency: 'USD',
        isActive: true,
        attributes: {
          speed_mbps: 100,
          note: 'test_plan'
        }
      })
    });

    if (createPlanResponse.ok) {
      const newPlan = await createPlanResponse.json();
      console.log(`   Status: ${createPlanResponse.status}`);
      console.log(`   Created plan: ${newPlan.plan.name} (ID: ${newPlan.plan.plan_id})`);
      
      // Test 5: Create a subscription with the new plan
      console.log('\n5. Testing subscription creation...');
      const createSubResponse = await fetch(`${BASE_URL}/subscriptions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: 1, // Assuming customer exists
          planId: newPlan.plan.plan_id,
          status: 'pending',
          startDate: '2024-01-01',
          billingCycle: 'monthly'
        })
      });

      if (createSubResponse.ok) {
        const newSub = await createSubResponse.json();
        console.log(`   Status: ${createSubResponse.status}`);
        console.log(`   Created subscription: ${newSub.subscription.subscription_id}`);
      } else {
        const error = await createSubResponse.json();
        console.log(`   Error: ${createSubResponse.status} - ${error.error}`);
      }
    } else {
      const error = await createPlanResponse.json();
      console.log(`   Error: ${createPlanResponse.status} - ${error.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPI();

