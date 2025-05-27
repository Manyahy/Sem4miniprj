
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    title: "Japan Earthquake Risk Predictor",
    subtitle: "Advanced seismic risk assessment with multiple formula-based analysis",
    locationParams: "Location Parameters",
    riskMap: "Risk Map",
    latitude: "Latitude",
    longitude: "Longitude", 
    depth: "Depth of Last Earthquake Activity",
    daysSince: "Days Since Last Earthquake",
    avgMagnitude: "Average Past Magnitude",
    predictRisk: "Predict Risk",
    analyzing: "Analyzing...",
    sampleData: "Calibrated Test Cases",
    highRisk: "HIGH RISK Example",
    mediumRisk: "MEDIUM RISK Example",
    lowRisk: "LOW RISK Example",
    riskAnalysis: "Formula-Based Risk Analysis",
    depthFormula: "DEPTH FORMULA",
    timeFormula: "TIME FORMULA",
    magnitudeFormula: "MAGNITUDE FORMULA",
    multiFormula: "Multi-Formula Analysis",
    riskAssessment: "Risk Assessment",
    switchToJapanese: "日本語",
    predictionComplete: "Prediction Complete",
    allCategoriesAnalyzed: "All risk categories have been analyzed",
    invalidInput: "Invalid Input",
    enterValidValues: "Please enter valid numeric values for all fields",
    locationError: "Location Error",
    enterJapanCoords: "Please enter coordinates within Japan's boundaries",
    rangeError: "Range Error",
    valuesOutOfRange: "Input values are outside valid range",
    sampleDataLoaded: "Sample Data Loaded"
  },
  ja: {
    title: "日本地震リスク予測システム",
    subtitle: "複数の公式ベース分析による高度地震リスク評価",
    locationParams: "位置パラメータ",
    riskMap: "リスクマップ",
    latitude: "緯度",
    longitude: "経度",
    depth: "最後の地震活動の深度",
    daysSince: "最後の地震からの日数",
    avgMagnitude: "過去の平均マグニチュード",
    predictRisk: "リスク予測",
    analyzing: "解析中...",
    sampleData: "校正済みテストケース",
    highRisk: "高リスク例",
    mediumRisk: "中リスク例", 
    lowRisk: "低リスク例",
    riskAnalysis: "公式ベースリスク分析",
    depthFormula: "深度公式",
    timeFormula: "時間公式",
    magnitudeFormula: "マグニチュード公式",
    multiFormula: "多公式分析",
    riskAssessment: "リスク評価",
    switchToJapanese: "English",
    predictionComplete: "予測完了",
    allCategoriesAnalyzed: "すべてのリスクカテゴリが分析されました",
    invalidInput: "入力エラー",
    enterValidValues: "すべての項目に有効な数値を入力してください",
    locationError: "位置エラー",
    enterJapanCoords: "日本国内の座標を入力してください",
    rangeError: "範囲エラー",
    valuesOutOfRange: "入力値が有効範囲外です",
    sampleDataLoaded: "サンプルデータ読込完了"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
