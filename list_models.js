require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_GATEWAY_KEY || "megha-gateway-key-123";
  const gatewayUrl = process.env.GEMINI_GATEWAY_URL || "https://ai-gateway.meghaj.workers.dev";

  try {
    console.log('Fetching available models via gateway...\n');
    const axios = require('axios');
    const response = await axios.get(`${gatewayUrl}/v1beta/models?key=${apiKey}`);
    
    console.log('Available Models:');
    response.data.models.forEach(model => {
      console.log(`- ${model.name.replace('models/', '')} (${model.supportedGenerationMethods.join(', ')})`);
    });
  } catch (error) {
    console.error('Error fetching models:', error.response ? error.response.data : error.message);
  }
}

listModels();
