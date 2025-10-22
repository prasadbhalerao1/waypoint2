/**
 * Chat Context & Prompts
 * System prompts, static snippets, and prompt building for RAG-based chat
 */

// System prompt for WayPoint AI assistant
export const SYSTEM_PROMPT = `You are WayPoint Assistant, a compassionate and conversational mental health companion for college students in India. You chat naturally like a supportive friend who happens to be trained in mental health support.

CORE PRINCIPLES:
- Engage in natural, flowing conversation - not robotic responses
- Provide emotional support and evidence-based coping strategies
- You are empathetic, non-judgmental, and culturally aware
- Escalate to human counselors when needed
- Reference specific tools and techniques from your knowledge base

YOUR EXPERTISE INCLUDES:
1. **Cognitive Behavioral Therapy (CBT) Techniques:**
   - Thought reframing and challenging cognitive distortions
   - ABC model (Activating event → Beliefs → Consequences)
   - Behavioral activation for depression
   - Exposure therapy concepts for anxiety
   - Mindfulness-based CBT approaches

2. **Screening & Assessment:**
   - Suggest PHQ-9 screening for depression symptoms
   - Recommend GAD-7 for anxiety assessment
   - Explain what these scores mean in accessible language
   - Encourage professional follow-up for concerning scores

3. **Evidence-Based Interventions:**
   - Breathing exercises (4-7-8, box breathing)
   - Grounding techniques (5-4-3-2-1 sensory method)
   - Progressive muscle relaxation
   - Journaling prompts for emotional processing
   - Sleep hygiene and routine building

4. **Crisis Support:**
   - Immediate safety assessment
   - Crisis helplines (KIRAN 1800-599-0019, Vandrevala 9999 666 555)
   - Urgent counselor booking assistance

CONVERSATION STYLE:
- Talk like ChatGPT - natural, warm, and conversational
- Ask follow-up questions to understand context better
- Validate feelings before offering solutions
- Use "I understand..." "It sounds like..." "Have you tried..."
- Break down complex concepts into simple explanations
- Use examples and analogies when helpful

WHEN TO SUGGEST SCREENING TOOLS:
- User mentions persistent sadness, hopelessness → "Have you taken the PHQ-9 depression screening? It can help us understand what you're experiencing."
- User mentions worry, panic, anxiety → "The GAD-7 anxiety assessment might be helpful. Would you like to try it?"
- After screening, explain results and next steps

WHEN TO SUGGEST CBT:
- Negative thought patterns → Introduce thought reframing
- Avoidance behaviors → Explain behavioral activation
- Catastrophizing → Teach reality testing
- Always explain WHY the technique works (the science behind it)

CULTURAL SENSITIVITY:
- Acknowledge Indian academic pressure, family expectations, stigma
- Respect cultural values while promoting mental health
- Offer resources in regional languages when available
- Understand joint family dynamics and collectivist culture

CRISIS PROTOCOL:
If user mentions self-harm, suicide, severe distress, or asks about sensitive topics like depression, anxiety, etc.:
1. ALWAYS respond with empathy and support - never refuse to engage
2. Provide helpful, evidence-based information and coping strategies
3. At the END of your response, include crisis helplines: KIRAN 1800-599-0019, Vandrevala 9999 666 555
4. Encourage professional help when appropriate, but don't make it feel mandatory
5. NEVER redirect to external pages or refuse to answer - always engage compassionately

IMPORTANT: When users ask about depression, anxiety, or other mental health topics:
- Answer their questions fully and helpfully
- Provide evidence-based information
- Share coping strategies and techniques
- Be supportive and non-judgmental
- Include helpline numbers at the end as a resource, not a requirement

LIMITATIONS (mention naturally when relevant):
- You provide support and coping strategies, not diagnosis or treatment
- You cannot prescribe medication
- You cannot replace professional mental health care
- Serious concerns need human professional support

Remember: Be conversational, empathetic, and practical. Think of yourself as a knowledgeable friend who genuinely cares.`;

// Static knowledge snippets (fallback when AI API not available)
export const STATIC_SNIPPETS = [
  {
    id: 'breathing_478',
    title: '4-7-8 Breathing Exercise',
    content: `The 4-7-8 breathing technique is a simple yet powerful way to calm anxiety:

1. Breathe in through your nose for 4 counts
2. Hold your breath for 7 counts
3. Exhale slowly through your mouth for 8 counts
4. Repeat 3-4 times

This activates your parasympathetic nervous system, helping you relax. Practice daily for best results.`,
    tags: ['anxiety', 'stress', 'breathing', 'quick'],
    source: 'CBT Techniques'
  },
  {
    id: 'grounding_54321',
    title: '5-4-3-2-1 Grounding Technique',
    content: `When feeling overwhelmed or anxious, use your senses to ground yourself:

5 - Name 5 things you can SEE around you
4 - Name 4 things you can TOUCH
3 - Name 3 things you can HEAR
2 - Name 2 things you can SMELL
1 - Name 1 thing you can TASTE

This brings you back to the present moment and reduces anxiety.`,
    tags: ['anxiety', 'grounding', 'mindfulness', 'quick'],
    source: 'Mindfulness Practices'
  },
  {
    id: 'exam_stress',
    title: 'Managing Exam Stress',
    content: `Exam stress is common among students. Here are evidence-based strategies:

1. Break study into manageable chunks (Pomodoro: 25 min study, 5 min break)
2. Prioritize sleep (7-9 hours) - sleep consolidates memory
3. Practice active recall instead of passive reading
4. Take regular breaks for physical activity
5. Stay hydrated and eat nutritious meals
6. Use positive self-talk: "I am prepared, I can do this"
7. Practice deep breathing before the exam

Remember: One exam doesn't define your worth or future.`,
    tags: ['academic', 'stress', 'exams', 'study'],
    source: 'Academic Wellness Guide'
  },
  {
    id: 'sleep_hygiene',
    title: 'Sleep Hygiene Tips',
    content: `Good sleep is crucial for mental health. Improve your sleep with these tips:

1. Maintain a consistent sleep schedule (even on weekends)
2. Create a relaxing bedtime routine (no screens 1 hour before bed)
3. Keep your bedroom cool, dark, and quiet
4. Avoid caffeine after 2 PM
5. Exercise regularly, but not close to bedtime
6. Limit daytime naps to 20-30 minutes
7. If you can't sleep after 20 minutes, get up and do a calming activity

Quality sleep improves mood, focus, and resilience.`,
    tags: ['sleep', 'wellness', 'routine'],
    source: 'Sleep Foundation'
  },
  {
    id: 'thought_reframing',
    title: 'Cognitive Reframing (CBT)',
    content: `Challenge negative thoughts with this CBT technique:

1. IDENTIFY the negative thought (e.g., "I'm going to fail")
2. EXAMINE the evidence: Is this thought based on facts or feelings?
3. CHALLENGE it: What would you tell a friend thinking this?
4. REFRAME: Create a balanced, realistic thought (e.g., "I've prepared well, and I'll do my best")

Example:
Negative: "Everyone thinks I'm weird"
Reframed: "Some people appreciate my unique perspective, and that's okay"

Practice this daily to build mental resilience.`,
    tags: ['cbt', 'anxiety', 'depression', 'thoughts'],
    source: 'Cognitive Behavioral Therapy'
  },
  {
    id: 'crisis_helplines',
    title: 'Crisis Support Helplines (India)',
    content: `If you're in crisis, please reach out immediately:

🆘 EMERGENCY: 112 (Police/Ambulance)

Mental Health Helplines:
📞 KIRAN (Govt): 1800-599-0019 (24/7, toll-free)
📞 Vandrevala Foundation: 1860-2662-345 / 9999 666 555 (24/7)
📞 iCall (TISS): 9152987821 (Mon-Sat, 8 AM - 10 PM)
📞 Snehi: 91-22-2772-6771 (24/7)
📞 Aasra: 91-22-2754-6669 (24/7)

You are not alone. Help is available.`,
    tags: ['crisis', 'helpline', 'emergency', 'support'],
    source: 'Crisis Resources'
  }
];

// Risk keywords for crisis detection
export const RISK_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
  'self harm', 'cut myself', 'hurt myself', 'harm myself',
  'no point living', 'can\'t go on', 'give up', 'hopeless',
  'overdose', 'pills', 'jump off'
];

/**
 * Check if message contains crisis indicators
 * @param {string} message - User message
 * @returns {boolean} - True if crisis detected
 */
export function detectCrisis(message) {
  if (!message) return false;
  
  const lowerMessage = message.toLowerCase();
  return RISK_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Build prompt for LLM with RAG context
 * @param {object} params - Prompt parameters
 * @param {string} params.message - User message
 * @param {object} params.userContext - User context (mood, theme, etc.)
 * @param {array} params.retrieved - Retrieved knowledge snippets
 * @param {array} params.conversationHistory - Previous conversation messages
 * @returns {array} - Messages array for LLM
 */
export function buildPrompt({ message, userContext = {}, retrieved = [], conversationHistory = [] }) {
  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT
    }
  ];

  // Add user context
  if (userContext.mood) {
    const moodLabels = ['overwhelmed', 'struggling', 'okay', 'good', 'great'];
    const moodText = moodLabels[userContext.mood - 1] || 'neutral';
    messages.push({
      role: 'system',
      content: `User's current mood: ${moodText}`
    });
  }

  if (userContext.theme) {
    messages.push({
      role: 'system',
      content: `User's selected theme: ${userContext.theme}. Tailor your language to match this theme when appropriate.`
    });
  }

  // Add retrieved context from RAG
  if (retrieved && retrieved.length > 0) {
    const contextText = retrieved.map((doc, idx) => 
      `[Source ${idx + 1}: ${doc.title || doc.source}]\n${doc.content}`
    ).join('\n\n');

    messages.push({
      role: 'system',
      content: `Relevant knowledge base excerpts:\n\n${contextText}\n\nUse these sources to inform your response and cite them when relevant.`
    });
  }

  // Add conversation history for context continuity
  if (conversationHistory && conversationHistory.length > 0) {
    conversationHistory.forEach(chat => {
      if (chat.message) {
        messages.push({
          role: 'user',
          content: chat.message
        });
      }
      if (chat.reply) {
        messages.push({
          role: 'assistant',
          content: chat.reply
        });
      }
    });
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: message
  });

  return messages;
}

/**
 * Get canned response based on mood and keywords
 * @param {string} message - User message
 * @param {number} mood - User mood (1-5)
 * @param {string} theme - User theme
 * @returns {object} - Response object
 */
export function getCannedResponse(message, mood = 3, theme = 'default') {
  const lowerMessage = message.toLowerCase();
  
  // Crisis response
  if (detectCrisis(lowerMessage)) {
    return {
      reply: `I'm really concerned about you right now. Your safety is the most important thing. Please reach out for immediate help:

🆘 KIRAN Mental Health Helpline: 1800-599-0019 (24/7, toll-free)
📞 Vandrevala Foundation: 9999 666 555 (24/7)

You don't have to go through this alone. Would you like me to help you book an urgent session with a counselor?`,
      escalate: true,
      escalationActions: ['call_helpline', 'book_counsellor', 'emergency_contact'],
      sources: ['crisis_helplines']
    };
  }

  // Anxiety/stress response
  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('stress')) {
    const snippet = STATIC_SNIPPETS.find(s => s.id === 'breathing_478');
    return {
      reply: `I understand you're feeling anxious. Let's try a quick breathing exercise that can help calm your nervous system:\n\n${snippet.content}\n\nWould you like to try this exercise now, or explore other coping strategies?`,
      escalate: false,
      actions: ['breathing_exercise', 'grounding_exercise', 'talk_more'],
      sources: ['breathing_478']
    };
  }

  // Exam stress
  if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('study')) {
    const snippet = STATIC_SNIPPETS.find(s => s.id === 'exam_stress');
    return {
      reply: `Exam stress is really common among students. Here are some evidence-based strategies that can help:\n\n${snippet.content}\n\nWhich of these would you like to explore further?`,
      escalate: false,
      actions: ['study_tips', 'stress_management', 'talk_more'],
      sources: ['exam_stress']
    };
  }

  // Sleep issues
  if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('tired')) {
    const snippet = STATIC_SNIPPETS.find(s => s.id === 'sleep_hygiene');
    return {
      reply: `Sleep problems can really affect your mental health. Let's work on improving your sleep:\n\n${snippet.content}\n\nWould you like personalized sleep tips or relaxation exercises?`,
      escalate: false,
      actions: ['sleep_tips', 'relaxation_exercise', 'talk_more'],
      sources: ['sleep_hygiene']
    };
  }

  // Default response based on mood
  const moodResponses = {
    1: `I hear that you're feeling overwhelmed right now. That's really tough, and I want you to know that your feelings are valid. Let's work together to find some relief. Would you like to try a quick calming exercise, or would you prefer to talk more about what's going on?`,
    2: `I understand you're struggling. It takes courage to reach out, and I'm glad you're here. Let's explore some ways to help you feel better. Would you like to try a coping exercise, explore resources, or talk about what's on your mind?`,
    3: `Thanks for sharing with me. I'm here to support you. What would be most helpful for you right now - trying a wellness exercise, exploring resources, or just talking things through?`,
    4: `It's great to hear you're doing well! Let's keep that positive momentum going. Would you like to explore wellness resources, try a mindfulness exercise, or learn about building resilience?`,
    5: `Wonderful to hear you're feeling great! This is a perfect time to build your mental wellness toolkit. Would you like to explore advanced techniques, share your success strategies, or try something new?`
  };

  return {
    reply: moodResponses[mood] || moodResponses[3],
    escalate: false,
    actions: ['breathing_exercise', 'explore_resources', 'book_counsellor', 'talk_more'],
    sources: ['local_template']
  };
}

/**
 * TODO: Placeholder for vector DB retrieval
 * Integrate FAISS/Pinecone/Qdrant here
 * 
 * @param {array} queryEmbedding - Query embedding vector
 * @param {number} topK - Number of results to retrieve
 * @returns {array} - Retrieved documents
 */
export async function retrieveRelevantDocs(queryEmbedding, topK = 3) {
  // TODO: Implement vector similarity search
  // Example with FAISS:
  // const results = await faissIndex.search(queryEmbedding, topK);
  // return results.map(r => ({ ...r.metadata, score: r.score }));
  
  // For now, return static snippets as fallback
  return STATIC_SNIPPETS.slice(0, topK);
}

export default {
  SYSTEM_PROMPT,
  STATIC_SNIPPETS,
  RISK_KEYWORDS,
  detectCrisis,
  buildPrompt,
  getCannedResponse,
  retrieveRelevantDocs
};
