require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModel() {
  const apiKey = process.env.GEMINI_GATEWAY_KEY || "megha-gateway-key-123";
  const gatewayUrl = process.env.GEMINI_GATEWAY_URL || "https://ai-gateway.meghaj.workers.dev";

  console.log(`Initializing client using gateway key...`);
  const genAI = new GoogleGenerativeAI(apiKey);
  const aliases = ["alias-1", "alias-2", "alias-3"];
  let lastError = null;

  for (const modelAlias of aliases) {
    try {
      console.log(`Testing model: ${modelAlias}...`);
      const model = genAI.getGenerativeModel(
        { model: modelAlias },
        { baseUrl: gatewayUrl }
      );
      const result = await model.generateContent('Generate a simple Mermaid diagram flowchart for a "Hello World" app.');
      const response = await result.response;
      const text = response.text();
      
      console.log('\n--- Model Response ---');
      console.log(text);
      console.log(`\n--- SUCCESS: Model ${modelAlias} is working! ---`);
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Failed with model: ${modelAlias}. Error:`, error.message);
    }
  }

  console.error('\n--- FAILURE: All model aliases failed ---');
  console.error('Last Error Message:', lastError?.message);
  process.exit(1);
}

testModel();
