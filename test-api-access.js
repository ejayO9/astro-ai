require('dotenv').config({ path: '.env.local' });
const { openai } = require("@ai-sdk/openai");
const { generateText } = require("ai");

async function testAPIAccess() {
  console.log("🧪 Testing OpenAI API access with gpt-4.1...");
  console.log("🔑 API Key exists:", !!process.env.OPENAI_API_KEY);
  console.log("🔑 API Key starts with:", process.env.OPENAI_API_KEY?.substring(0, 7) + "...");
  
  try {
    const { text } = await generateText({
      model: openai("gpt-4.1"),
      prompt: "Say 'Hello, API is working!' in exactly 5 words.",
      maxTokens: 20,
      temperature: 0.1,
    });
    
    console.log("✅ API Test Success!");
    console.log("📝 Response:", text);
    console.log("🎉 gpt-4.1 is accessible with your API key");
  } catch (error) {
    console.log("❌ API Test Failed!");
    console.log("🔥 Error:", error.message);
    console.log("📊 Status Code:", error.statusCode);
    console.log("📄 Response Body:", error.responseBody);
    console.log("🌐 URL:", error.url);
    console.log("📋 Full Error Object:");
    console.log(JSON.stringify(error, null, 2));
    
    // Check if it's a model access issue
    if (error.statusCode === 401) {
      console.log("\n🔍 Diagnosis: 401 Unauthorized Error");
      console.log("💡 This usually means:");
      console.log("   1. Invalid API key");
      console.log("   2. API key doesn't have access to gpt-4.1");
      console.log("   3. Billing/usage limits reached");
      console.log("   4. Project/organization restrictions");
    }
  }
}

testAPIAccess(); 