/**
 * Automated Test Suite for AI Shopping Assistant
 * Tests the application with multiple shopping requests, verifies prompt engineering,
 * workflow execution, identification extraction, recommendation generation, and error handling.
 */

const { generateSimulatedResponse, parseAIResponse } = require('./server');

console.log('====================================================');
console.log('🧪 Starting AI Shopping Assistant Test Suite');
console.log('====================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${testName} - ${details}`);
    testsFailed++;
  }
}

// ----------------------------------------------------
// TEST CASE 1: Laptop for programming under ₹60,000
// ----------------------------------------------------
console.log('--- TEST 1: Laptop for Programming Under ₹60,000 ---');
const query1 = "I need a laptop for programming under ₹60,000.";
const res1 = generateSimulatedResponse(query1);

assert(res1 && res1.identified, 'Response contains identified customer requirements');
assert(res1.identified.category.toLowerCase().includes('laptop'), 'Category correctly identified as Laptop', `Got: ${res1.identified.category}`);
assert(res1.identified.budget.includes('60,000'), 'Budget correctly identified under ₹60,000', `Got: ${res1.identified.budget}`);
assert(res1.recommendations.length >= 2, 'Generated at least 2 laptop recommendations', `Count: ${res1.recommendations.length}`);

// Verify all recommendation card fields
const laptop1 = res1.recommendations[0];
assert(laptop1.name && laptop1.name.length > 0, 'Recommendation card has Product Name');
assert(laptop1.category && laptop1.category.length > 0, 'Recommendation card has Product Category');
assert(laptop1.price && laptop1.price.length > 0, 'Recommendation card has Price');
assert(Array.isArray(laptop1.features) && laptop1.features.length >= 3, 'Recommendation card has Key Features');
assert(laptop1.whySuitable && laptop1.whySuitable.length > 0, 'Recommendation card has Why It Is Suitable explanation');

// Verify budget constraint: no product should exceed ₹60,000
const allWithinBudget = res1.recommendations.every(item => {
  const num = parseInt(item.price.replace(/[^\d]/g, ''), 10);
  return isNaN(num) || num <= 60000;
});
assert(allWithinBudget, 'Budget constraint enforced: No laptop exceeds ₹60,000');
console.log(`Summary: Recommended "${laptop1.name}" for ${laptop1.price}\n`);

// ----------------------------------------------------
// TEST CASE 2: Smartphone with a good camera
// ----------------------------------------------------
console.log('--- TEST 2: Smartphone with a Good Camera ---');
const query2 = "Suggest a smartphone with a good camera.";
const res2 = generateSimulatedResponse(query2);

assert(res2 && res2.identified, 'Response contains identified customer requirements');
assert(res2.identified.category.toLowerCase().includes('smartphone'), 'Category identified as Smartphone', `Got: ${res2.identified.category}`);
assert(res2.identified.intendedUse.toLowerCase().includes('photography') || res2.identified.features.some(f => f.toLowerCase().includes('camera') || f.toLowerCase().includes('ois')), 'Identified camera/photography focus');
assert(res2.recommendations.length >= 2, 'Generated smartphone recommendations');

const phone1 = res2.recommendations[0];
assert(phone1.features.some(f => f.toLowerCase().includes('camera') || f.toLowerCase().includes('sensor') || f.toLowerCase().includes('ois')), 'Phone features emphasize camera capabilities');
console.log(`Summary: Recommended "${phone1.name}" for ${phone1.price}\n`);

// ----------------------------------------------------
// TEST CASE 3: Headphones for online classes
// ----------------------------------------------------
console.log('--- TEST 3: Headphones for Online Classes ---');
const query3 = "I need headphones for online classes.";
const res3 = generateSimulatedResponse(query3);

assert(res3 && res3.identified, 'Response contains identified requirements');
assert(res3.identified.category.toLowerCase().includes('headphone') || res3.identified.category.toLowerCase().includes('audio'), 'Category identified as Headphones');
assert(res3.identified.intendedUse.toLowerCase().includes('online classes'), 'Intended use identified as online classes');
assert(res3.recommendations.length >= 2, 'Generated headphone recommendations');

const headphone1 = res3.recommendations[0];
assert(headphone1.whySuitable.toLowerCase().includes('online') || headphone1.whySuitable.toLowerCase().includes('lecture') || headphone1.whySuitable.toLowerCase().includes('vocal') || headphone1.whySuitable.toLowerCase().includes('study'), 'Suitability clearly links to online class study needs');
console.log(`Summary: Recommended "${headphone1.name}" for ${headphone1.price}\n`);

// ----------------------------------------------------
// TEST CASE 4: Follow-up Question for vague requests
// ----------------------------------------------------
console.log('--- TEST 4: Follow-up Question Handling ("I want a phone.") ---');
const query4 = "I want a phone.";
const res4 = generateSimulatedResponse(query4);

assert(res4.isFollowUp === true, 'Flagged as follow-up question required');
assert(res4.recommendations.length === 0, 'Does not blindly recommend without knowing preferences');
assert(res4.message.includes('budget') && (res4.message.includes('camera') || res4.message.includes('gaming') || res4.message.includes('battery')), 'Asks proper clarifying follow-up question on budget and priority');
console.log(`AI Follow-up Question: "${res4.message}"\n`);

// ----------------------------------------------------
// TEST CASE 5: Multi-Turn Conversation (Follow-up Answer)
// ----------------------------------------------------
console.log('--- TEST 5: Multi-Turn Conversation History Handling ---');
const history = [
  { role: 'user', content: 'I need headphones.' },
  { role: 'assistant', content: 'What is your budget and will you mainly use them for music, gaming, or online classes?' }
];
const followUpQuery = "Under ₹3,000 for online classes.";
const res5 = generateSimulatedResponse(followUpQuery, history);

assert(res5.isFollowUp === false, 'Follow-up successfully resolved into recommendations');
assert(res5.identified.budget.includes('3,000'), 'Budget under ₹3,000 captured from multi-turn input');
assert(res5.recommendations.length >= 2, 'Generated recommendations after follow-up answered');
console.log(`Resolved recommendations count: ${res5.recommendations.length}\n`);

// ----------------------------------------------------
// TEST CASE 6: Gift for friend under ₹2,000
// ----------------------------------------------------
console.log('--- TEST 6: Gift for friend under ₹2,000 ---');
const query6 = "Suggest a gift for my friend under ₹2,000.";
const res6 = generateSimulatedResponse(query6);

assert(res6.identified.budget.includes('2,000'), 'Identified budget under ₹2,000');
assert(res6.recommendations.length >= 2, 'Generated gift options');
const giftBudgetCheck = res6.recommendations.every(item => {
  const num = parseInt(item.price.replace(/[^\d]/g, ''), 10);
  return isNaN(num) || num <= 2000;
});
assert(giftBudgetCheck, 'All gift recommendations are within ₹2,000 budget');
console.log(`Summary: Recommended "${res6.recommendations[0].name}" for ${res6.recommendations[0].price}\n`);

// ----------------------------------------------------
// TEST CASE 7: Parser Robustness (JSON parsing with Markdown Fences)
// ----------------------------------------------------
console.log('--- TEST 7: AI Output Parser Robustness ---');
const markdownFencedAIOutput = "```json\n" + JSON.stringify({
  message: "Test message",
  isFollowUp: false,
  identified: { category: "Test Category", budget: "₹1,000", features: ["F1"], intendedUse: "Testing" },
  recommendations: [{ name: "Test Product", category: "Test", price: "₹999", features: ["F1"], whySuitable: "Good test" }]
}) + "\n```";

const parsed = parseAIResponse(markdownFencedAIOutput, "test query");
assert(parsed.message === "Test message", 'Successfully stripped markdown code fences');
assert(parsed.recommendations.length === 1, 'Extracted recommendation from parsed JSON');
console.log('Parser test passed.\n');

// ----------------------------------------------------
// FINAL RESULTS SUMMARY
// ----------------------------------------------------
console.log('====================================================');
console.log(`📊 Test Results: ${testsPassed} Passed, ${testsFailed} Failed`);
console.log('====================================================');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL TEST CASES PASSED SUCCESSFULLY!\n');
}
