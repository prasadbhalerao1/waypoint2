/**
 * Screening Controller
 * Handles PHQ-9 and GAD-7 assessments
 */

import Screening from '../models/Screening.js';
import User from '../models/User.js';
import { getAuth } from '@clerk/express';

// PHQ-9 Questions
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself"
];

// GAD-7 Questions
const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

/**
 * Calculate PHQ-9 severity
 */
function calculatePHQ9Severity(score) {
  if (score <= 4) return 'minimal';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  if (score <= 19) return 'moderately_severe';
  return 'severe';
}

/**
 * Calculate GAD-7 severity
 */
function calculateGAD7Severity(score) {
  if (score <= 4) return 'minimal';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  return 'severe';
}

/**
 * POST /api/v1/screening
 * Submit a screening assessment
 */
export const submitScreening = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, responses } = req.body;

    // Validate type
    if (!['PHQ-9', 'GAD-7'].includes(type)) {
      return res.status(400).json({ error: 'Invalid screening type' });
    }

    // Validate responses
    const expectedLength = type === 'PHQ-9' ? 9 : 7;
    if (!responses || responses.length !== expectedLength) {
      return res.status(400).json({ error: `Expected ${expectedLength} responses` });
    }

    // Calculate total score
    const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0);

    // Determine severity
    const severity = type === 'PHQ-9' 
      ? calculatePHQ9Severity(totalScore)
      : calculateGAD7Severity(totalScore);

    // Check for suicidal ideation (PHQ-9 question 9)
    const suicidalIdeation = type === 'PHQ-9' && responses[8]?.score > 0;

    // Flag for high risk
    const flagged = severity === 'severe' || severity === 'moderately_severe' || suicidalIdeation;

    // Create screening record
    const screening = new Screening({
      userId,
      type,
      responses,
      totalScore,
      severity,
      flagged,
      suicidalIdeation
    });

    await screening.save();

    // Update user's last activity
    const user = await User.findOne({ clerkId: userId });
    if (user) {
      await user.updateStreak();
    }

    res.json({
      screeningId: screening._id,
      type,
      totalScore,
      severity,
      flagged,
      suicidalIdeation,
      interpretation: getInterpretation(type, totalScore, severity, suicidalIdeation),
      recommendations: getRecommendations(type, severity, suicidalIdeation)
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/screening/history
 * Get user's screening history
 */
export const getScreeningHistory = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, limit = 10 } = req.query;

    const query = { userId };
    if (type) query.type = type;

    const screenings = await Screening.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-responses'); // Don't return individual responses for privacy

    res.json({ screenings });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/screening/questions
 * Get screening questions
 */
export const getQuestions = async (req, res) => {
  const { type } = req.query;

  if (type === 'PHQ-9') {
    return res.json({
      type: 'PHQ-9',
      title: 'Patient Health Questionnaire (PHQ-9)',
      description: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
      questions: PHQ9_QUESTIONS,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    });
  }

  if (type === 'GAD-7') {
    return res.json({
      type: 'GAD-7',
      title: 'Generalized Anxiety Disorder (GAD-7)',
      description: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
      questions: GAD7_QUESTIONS,
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ]
    });
  }

  res.status(400).json({ error: 'Invalid type. Use PHQ-9 or GAD-7' });
};

/**
 * Helper: Get interpretation text
 */
function getInterpretation(type, score, severity, suicidalIdeation) {
  if (suicidalIdeation) {
    return `Your screening indicates thoughts of self-harm. This is very serious and requires immediate attention. Please reach out for help right away.`;
  }

  const interpretations = {
    'PHQ-9': {
      minimal: `Your score of ${score} suggests minimal depression symptoms. This is a positive sign! Continue practicing self-care and reach out if things change.`,
      mild: `Your score of ${score} indicates mild depression. You may benefit from self-help strategies, lifestyle changes, and monitoring your symptoms.`,
      moderate: `Your score of ${score} suggests moderate depression. We recommend speaking with a counselor to explore treatment options.`,
      moderately_severe: `Your score of ${score} indicates moderately severe depression. Professional support is strongly recommended. Please book a counseling session.`,
      severe: `Your score of ${score} suggests severe depression. Immediate professional help is important. Please book an urgent counseling session.`
    },
    'GAD-7': {
      minimal: `Your score of ${score} suggests minimal anxiety symptoms. Keep up your wellness practices!`,
      mild: `Your score of ${score} indicates mild anxiety. Self-help techniques and stress management may be helpful.`,
      moderate: `Your score of ${score} suggests moderate anxiety. Consider speaking with a counselor about coping strategies.`,
      severe: `Your score of ${score} indicates severe anxiety. Professional support is strongly recommended. Please book a counseling session.`
    }
  };

  return interpretations[type][severity];
}

/**
 * Helper: Get recommendations
 */
function getRecommendations(type, severity, suicidalIdeation) {
  if (suicidalIdeation) {
    return [
      'call_crisis_helpline',
      'book_urgent_counselor',
      'emergency_contact'
    ];
  }

  if (severity === 'severe' || severity === 'moderately_severe') {
    return [
      'book_counselor',
      'try_cbt_exercises',
      'daily_mood_tracking'
    ];
  }

  if (severity === 'moderate') {
    return [
      'try_cbt_exercises',
      'book_counselor',
      'wellness_resources'
    ];
  }

  return [
    'wellness_resources',
    'daily_mood_tracking',
    'try_exercises'
  ];
}

export default {
  submitScreening,
  getScreeningHistory,
  getQuestions
};
