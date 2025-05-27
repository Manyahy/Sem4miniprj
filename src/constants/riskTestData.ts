
// Test data constants for demonstrating different risk levels
// These values are calibrated to the risk calculation formulas

export const RISK_TEST_DATA = {
  // HIGH RISK - All factors combine for score >= 70
  HIGH_RISK: {
    name: "Tokyo Bay High Risk Zone / 東京湾高リスク地域",
    latitude: "35.6762",
    longitude: "139.6503", 
    depth: "15.0", // Shallow depth (≤30km) = 85 score
    daysSinceLastEarthquake: "1", // Very recent (≤3 days) = 75 score
    averagePastMagnitude: "6.2" // High magnitude (≥5.5) = 90 score
    // Combined: (85 × 0.4) + (75 × 0.3) + (90 × 0.3) = 34 + 22.5 + 27 = 83.5 → HIGH RISK
  },

  // MEDIUM RISK - Moderate factors for score 40-69
  MEDIUM_RISK: {
    name: "Osaka Moderate Risk Zone / 大阪中リスク地域", 
    latitude: "34.6937",
    longitude: "135.5023",
    depth: "45.0", // Moderate depth (≤70km) = 55 score
    daysSinceLastEarthquake: "8", // Recent activity (≤15 days) = 50 score
    averagePastMagnitude: "4.8" // Moderate magnitude (≥4.5) = 60 score
    // Combined: (55 × 0.4) + (50 × 0.3) + (60 × 0.3) = 22 + 15 + 18 = 55 → MEDIUM RISK
  },

  // LOW RISK - All factors result in score < 40
  LOW_RISK: {
    name: "Fukuoka Low Risk Zone / 福岡低リスク地域",
    latitude: "33.5904",
    longitude: "130.4017",
    depth: "85.0", // Deep earthquake (>70km) = 25 score
    daysSinceLastEarthquake: "45", // Normal interval (not recent, not too long) = 20 score
    averagePastMagnitude: "3.8" // Low magnitude (<4.5) = 30 score
    // Combined: (25 × 0.4) + (20 × 0.3) + (30 × 0.3) = 10 + 6 + 9 = 25 → LOW RISK
  }
};

// Additional extreme test cases for validation
export const EXTREME_TEST_CASES = {
  // Extremely high risk scenario
  MAXIMUM_RISK: {
    name: "Maximum Risk Scenario / 最大リスクシナリオ",
    latitude: "38.2682",
    longitude: "140.8694",
    depth: "5.0", // Very shallow
    daysSinceLastEarthquake: "0", // Just happened
    averagePastMagnitude: "7.5" // Very high magnitude
  },

  // Extremely low risk scenario  
  MINIMUM_RISK: {
    name: "Minimum Risk Scenario / 最小リスクシナリオ",
    latitude: "26.2044",
    longitude: "127.6792",
    depth: "150.0", // Very deep
    daysSinceLastEarthquake: "30", // Normal interval
    averagePastMagnitude: "2.5" // Very low magnitude
  }
};

// Risk calculation explanation for reference
export const RISK_FORMULA_EXPLANATION = {
  DEPTH_SCORING: {
    "≤30km": 85,
    "≤70km": 55, 
    ">70km": 25
  },
  TIME_SCORING: {
    "≤3 days": 75,
    "≤15 days": 50,
    "≥365 days": 60,
    "other": 20
  },
  MAGNITUDE_SCORING: {
    "≥5.5M": 90,
    "≥4.5M": 60,
    "<4.5M": 30
  },
  COMBINED_FORMULA: "Final Score = (Depth × 0.4) + (Time × 0.3) + (Magnitude × 0.3)",
  RISK_THRESHOLDS: {
    HIGH: "≥70",
    MEDIUM: "40-69", 
    LOW: "<40"
  }
};
