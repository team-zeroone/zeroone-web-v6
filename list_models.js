require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error('Error: Please set a valid GEMINI_API_KEY in your .env file.');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log('Fetching available models...\n');
    // We use a manual fetch since listModels isn't always exposed in the simplified SDK
    const axios = require('axios');
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    console.log('Available Models:');
    response.data.models.forEach(model => {
      console.log(`- ${model.name.replace('models/', '')} (${model.supportedGenerationMethods.join(', ')})`);
    });
  } catch (error) {
    console.error('Error fetching models:', error.response ? error.response.data : error.message);
  }
}

listModels();
