/**
 * Example Usage of AI Service
 * This file demonstrates how to use both OpenAI and Gemini APIs
 * Run with: node EXAMPLE_USAGE.js
 */

import 'dotenv/config';
import { 
  getChatCompletion, 
  getStreamingChatCompletion,
  getStructuredOutput,
  isAIConfigured,
  getAIProviderInfo 
} from './src/services/aiService.js';

// Check configuration
console.log('=== AI Configuration ===');
const info = getAIProviderInfo();
console.log(`Provider: ${info.provider}`);
console.log(`Model: ${info.model}`);
console.log(`Configured: ${info.configured}`);
console.log('');

if (!isAIConfigured()) {
  console.error('❌ AI is not configured. Please set API keys in .env file.');
  process.exit(1);
}

// Example 1: Simple Chat Completion
async function exampleChatCompletion() {
  console.log('=== Example 1: Chat Completion ===');
  
  const messages = [
    { 
      role: 'system', 
      content: 'You are a supportive mental health assistant for college students.' 
    },
    { 
      role: 'user', 
      content: 'I am feeling stressed about my exams. Can you help?' 
    }
  ];

  try {
    const response = await getChatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 500
    });
    
    console.log('Response:', response);
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 2: Streaming Chat Completion
async function exampleStreamingChat() {
  console.log('=== Example 2: Streaming Chat ===');
  
  const messages = [
    { 
      role: 'system', 
      content: 'You are a supportive mental health assistant.' 
    },
    { 
      role: 'user', 
      content: 'Tell me about breathing exercises for anxiety.' 
    }
  ];

  try {
    process.stdout.write('Response: ');
    
    const stream = getStreamingChatCompletion(messages, {
      temperature: 0.7,
      max_tokens: 300
    });
    
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
    
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 3: Structured Output (PHQ-9 Screening)
async function exampleStructuredOutput() {
  console.log('=== Example 3: Structured Output (PHQ-9) ===');
  
  const messages = [
    { 
      role: 'system', 
      content: 'You are a clinical assessment assistant. Analyze the PHQ-9 responses and return structured JSON.' 
    },
    { 
      role: 'user', 
      content: 'PHQ-9 answers: [2, 2, 3, 2, 1, 2, 2, 1, 0]. Calculate total score and severity.' 
    }
  ];

  // PHQ-9 Schema
  const schema = {
    type: "object",
    properties: {
      answers: {
        type: "array",
        items: { type: "number" }
      },
      total_score: {
        type: "number"
      },
      severity_label: {
        type: "string",
        enum: ["none", "mild", "moderate", "moderately_severe", "severe"]
      },
      triage_level: {
        type: "string",
        enum: ["low", "moderate", "high"]
      },
      notes: {
        type: "string"
      }
    },
    required: ["answers", "total_score", "severity_label", "triage_level"]
  };

  try {
    const result = await getStructuredOutput(messages, schema, {
      temperature: 0.3
    });
    
    console.log('Structured Result:', JSON.stringify(result, null, 2));
    console.log('');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 4: Testing Both Providers
async function exampleBothProviders() {
  console.log('=== Example 4: Testing Both Providers ===');
  
  const messages = [
    { 
      role: 'system', 
      content: 'You are a helpful assistant.' 
    },
    { 
      role: 'user', 
      content: 'Say hello in one sentence.' 
    }
  ];

  // Test OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    try {
      console.log('Testing OpenAI...');
      const openaiResponse = await getChatCompletion(messages, { 
        provider: 'openai',
        temperature: 0.7 
      });
      console.log('OpenAI:', openaiResponse);
      console.log('');
    } catch (error) {
      console.error('OpenAI Error:', error.message);
    }
  }

  // Test Gemini
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      console.log('Testing Gemini...');
      const geminiResponse = await getChatCompletion(messages, { 
        provider: 'gemini',
        temperature: 0.7 
      });
      console.log('Gemini:', geminiResponse);
      console.log('');
    } catch (error) {
      console.error('Gemini Error:', error.message);
    }
  }
}

// Run all examples
async function runExamples() {
  try {
    await exampleChatCompletion();
    await exampleStreamingChat();
    await exampleStructuredOutput();
    await exampleBothProviders();
    
    console.log('✅ All examples completed!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

export { 
  exampleChatCompletion, 
  exampleStreamingChat, 
  exampleStructuredOutput,
  exampleBothProviders 
};
