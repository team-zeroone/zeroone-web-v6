require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelId = 'gemini-3-flash-preview';

  console.log(`Testing model: ${modelId}...`);

  try {
    const model = genAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent('Generate a simple Mermaid diagram flowchart for a "Hello World" app.');
    const response = await result.response;
    const text = response.text();
    
    console.log('\n--- Model Response ---');
    console.log(text);
    console.log('\n--- SUCCESS: Model is working! ---');
  } catch (error) {
    console.error('\n--- FAILURE: Model test failed ---');
    console.error('Error Message:', error.message);
    if (error.status) console.error('Status Code:', error.status);
    process.exit(1);
  }
}

testModel();
