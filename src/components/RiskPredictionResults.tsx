import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Activity, Shield, Clock, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PredictionData {
  latitude: number;
  longitude: number;
  depth: number;
  daysSinceLastEQ: number;
  avgMagnitude: number;
}

interface RiskCategory {
  level: 'high' | 'medium' | 'low';
  score: number;
  title: string;
  analysis: string;
  recommendation: string;
}

interface PredictionResultsProps {
  predictionData: PredictionData | null;
  isLoading: boolean;
  onRiskCalculated?: (risk: 'high' | 'medium' | 'low') => void;
}

const RiskPredictionResults: React.FC<PredictionResultsProps> = ({ 
  predictionData, 
  isLoading,
  onRiskCalculated 
}) => {
  const { language, t } = useLanguage();
  const fontFamily = language === 'ja' ? '"Noto Sans JP", sans-serif' : '"Inter", sans-serif';

  const calculateRiskCategories = (data: PredictionData): RiskCategory[] => {
    const { depth, daysSinceLastEQ, avgMagnitude } = data;

    // Calculate individual risk factors
    const depthRisk = calculateDepthRisk(depth);
    const timeRisk = calculateTimeRisk(daysSinceLastEQ);
    const magnitudeRisk = calculateMagnitudeRisk(avgMagnitude);
    
    // Calculate combined risk (weighted average)
    const combinedScore = (depthRisk.score * 0.4) + (timeRisk.score * 0.3) + (magnitudeRisk.score * 0.3);
    const combinedLevel = combinedScore >= 70 ? 'high' : combinedScore >= 40 ? 'medium' : 'low';
    
    return [
      depthRisk,
      timeRisk,
      magnitudeRisk,
      {
        level: combinedLevel,
        score: combinedScore,
        title: language === 'ja' ? '総合リスク評価' : 'Overall Risk Assessment',
        analysis: getCombinedAnalysis(combinedLevel, combinedScore),
        recommendation: getCombinedRecommendation(combinedLevel)
      }
    ];
  };

  const calculateDepthRisk = (depth: number): RiskCategory => {
    let score = 0;
    let level: 'high' | 'medium' | 'low' = 'low';
    
    if (depth <= 30) {
      score = 85;
      level = 'high';
    } else if (depth <= 70) {
      score = 55;
      level = 'medium';
    } else {
      score = 25;
      level = 'low';
    }

    return {
      level,
      score,
      title: language === 'ja' ? '深度分析' : 'Depth Analysis',
      analysis: getDepthAnalysis(depth, level),
      recommendation: getDepthRecommendation(level)
    };
  };

  const calculateTimeRisk = (days: number): RiskCategory => {
    let score = 0;
    let level: 'high' | 'medium' | 'low' = 'low';
    
    if (days <= 3) {
      score = 75;
      level = 'high';
    } else if (days <= 15) {
      score = 50;
      level = 'medium';
    } else if (days >= 365) {
      score = 60;
      level = 'medium';
    } else {
      score = 20;
      level = 'low';
    }

    return {
      level,
      score,
      title: language === 'ja' ? '時間分析' : 'Time Analysis',
      analysis: getTimeAnalysis(days, level),
      recommendation: getTimeRecommendation(level, days)
    };
  };

  const calculateMagnitudeRisk = (magnitude: number): RiskCategory => {
    let score = 0;
    let level: 'high' | 'medium' | 'low' = 'low';
    
    if (magnitude >= 5.5) {
      score = 90;
      level = 'high';
    } else if (magnitude >= 4.5) {
      score = 60;
      level = 'medium';
    } else {
      score = 30;
      level = 'low';
    }

    return {
      level,
      score,
      title: language === 'ja' ? 'マグニチュード分析' : 'Magnitude Analysis',
      analysis: getMagnitudeAnalysis(magnitude, level),
      recommendation: getMagnitudeRecommendation(level)
    };
  };

  const getDepthAnalysis = (depth: number, level: string) => {
    switch (level) {
      case 'high': 
        return language === 'ja' 
          ? `${depth}km の浅い深度は地表に大きな影響を与える可能性があります`
          : `Shallow depth of ${depth}km can cause significant surface impact`;
      case 'medium': 
        return language === 'ja' 
          ? `${depth}km の中程度の深度で体感できる揺れが予想されます`
          : `Moderate depth of ${depth}km may cause noticeable shaking`;
      default: 
        return language === 'ja' 
          ? `${depth}km の深い深度により地表への影響は軽減されます`
          : `Deep depth of ${depth}km reduces surface impact`;
    }
  };

  const getTimeAnalysis = (days: number, level: string) => {
    if (days <= 3) {
      return language === 'ja' 
        ? `最近の地震活動（${days}日前）は継続的なストレスを示しています`
        : `Recent earthquake activity (${days} days ago) indicates ongoing stress`;
    } else if (days <= 15) {
      return language === 'ja' 
        ? `最近の地震活動（${days}日前）が検出されています`
        : `Recent earthquake activity (${days} days ago) has been detected`;
    } else if (days >= 365) {
      return language === 'ja' 
        ? `長期間の静穏期（${days}日）はエネルギー蓄積の可能性があります`
        : `Long quiet period (${days} days) may indicate energy buildup`;
    } else {
      return language === 'ja' 
        ? `最後の地震から${days}日経過 - 正常な間隔です`
        : `${days} days since last earthquake - normal interval`;
    }
  };

  const getMagnitudeAnalysis = (magnitude: number, level: string) => {
    switch (level) {
      case 'high': 
        return language === 'ja' 
          ? `マグニチュード ${magnitude} は深刻な被害の可能性を示します`
          : `Magnitude ${magnitude} indicates potential for severe damage`;
      case 'medium': 
        return language === 'ja' 
          ? `マグニチュード ${magnitude} で体感できる影響が予想されます`
          : `Magnitude ${magnitude} may cause noticeable effects`;
      default: 
        return language === 'ja' 
          ? `マグニチュード ${magnitude} は軽微な影響レベルです`
          : `Magnitude ${magnitude} represents minor impact level`;
    }
  };

  const getCombinedAnalysis = (level: string, score: number) => {
    switch (level) {
      case 'high': 
        return language === 'ja' 
          ? `総合スコア ${score.toFixed(1)} - 複数の高リスク要因が検出されました`
          : `Combined score ${score.toFixed(1)} - Multiple high-risk factors detected`;
      case 'medium': 
        return language === 'ja' 
          ? `総合スコア ${score.toFixed(1)} - 中程度のリスクレベルです`
          : `Combined score ${score.toFixed(1)} - Moderate risk level identified`;
      default: 
        return language === 'ja' 
          ? `総合スコア ${score.toFixed(1)} - 現在の条件は低リスクを示しています`
          : `Combined score ${score.toFixed(1)} - Current conditions show low risk`;
    }
  };

  const getDepthRecommendation = (level: string) => {
    switch (level) {
      case 'high': 
        return language === 'ja' 
          ? '重い物体を直ちに固定してください'
          : 'Secure heavy objects immediately';
      case 'medium': 
        return language === 'ja' 
          ? '構造安全性と緊急計画を確認してください'
          : 'Review structural safety and emergency plans';
      default: 
        return language === 'ja' 
          ? '標準的な地震対策を継続してください'
          : 'Continue standard earthquake preparedness';
    }
  };

  const getTimeRecommendation = (level: string, days: number) => {
    switch (level) {
      case 'high': 
        return days <= 3 
          ? (language === 'ja' ? '警戒を継続し、余震に備えてください' : 'Stay alert and prepare for potential aftershocks')
          : (language === 'ja' ? '地域の地震活動を注意深く監視してください' : 'Monitor regional earthquake activity carefully');
      case 'medium': 
        return days >= 365 
          ? (language === 'ja' ? '準備レベルを強化することを検討してください' : 'Consider increasing preparedness level')
          : (language === 'ja' ? '最近の地域活動に注意を払ってください' : 'Pay attention to recent regional activity');
      default: 
        return language === 'ja' 
          ? '日常的な準備を維持してください'
          : 'Maintain routine preparedness';
    }
  };

  const getMagnitudeRecommendation = (level: string) => {
    switch (level) {
      case 'high': 
        return language === 'ja' 
          ? '建物の安全性を確認し、避難計画を準備してください'
          : 'Check building safety and prepare evacuation plans';
      case 'medium': 
        return language === 'ja' 
          ? '緩い物を固定し、緊急用品を確認してください'
          : 'Secure loose items and check emergency supplies';
      default: 
        return language === 'ja' 
          ? '基本的な地震対策を維持してください'
          : 'Maintain basic earthquake preparedness';
    }
  };

  const getCombinedRecommendation = (level: string) => {
    switch (level) {
      case 'high': 
        return language === 'ja' 
          ? '🚨 即座の行動が必要です - すべての安全対策を実施してください'
          : '🚨 IMMEDIATE ACTION REQUIRED - Implement all safety measures';
      case 'medium': 
        return language === 'ja' 
          ? '⚠️ 注意が必要です - 緊急準備を確認・更新してください'
          : '⚠️ CAUTION REQUIRED - Review and update emergency preparations';
      default: 
        return language === 'ja' 
          ? '✅ 基本的な注意を維持してください'
          : '✅ MAINTAIN BASIC AWARENESS';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#FF5C4D';
      case 'medium': return '#FFCD58';
      case 'low': return '#DAD870';
      default: return '#FF9636';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Activity className="w-5 h-5" />;
      case 'low': return <Shield className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  // Pass the calculated risk level to the parent component
  useEffect(() => {
    if (predictionData && onRiskCalculated) {
      const riskCategories = calculateRiskCategories(predictionData);
      const combinedRisk = riskCategories[3]; // Combined risk is the last one
      onRiskCalculated(combinedRisk.level);
    }
  }, [predictionData, onRiskCalculated]);

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader style={{ background: `linear-gradient(135deg, #FF9636, #FFCD58)` }} className="text-white rounded-t-lg">
          <CardTitle className={`flex items-center gap-2 ${language === 'ja' ? 'text-lg' : 'text-xl'}`} style={{ fontFamily }}>
            <TrendingUp size={24} />
            {language === 'ja' ? 'リスク分析中' : 'Analyzing Risk'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              <p className={`text-gray-600 ${language === 'ja' ? 'text-sm' : 'text-base'}`} style={{ fontFamily }}>
                {language === 'ja' ? '複数の要因を分析中...' : 'Analyzing multiple factors...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!predictionData) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader style={{ background: `linear-gradient(135deg, #FF9636, #FFCD58)` }} className="text-white rounded-t-lg">
          <CardTitle className={`flex items-center gap-2 ${language === 'ja' ? 'text-lg' : 'text-xl'}`} style={{ fontFamily }}>
            <TrendingUp size={24} />
            {language === 'ja' ? 'リスク分析' : 'Risk Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Clock size={48} className="mx-auto mb-4 text-gray-400" />
            <p className={`mb-2 ${language === 'ja' ? 'text-base' : 'text-lg'}`} style={{ fontFamily }}>
              {language === 'ja' ? 'パラメータを入力して予測をクリック' : 'Enter parameters and click predict'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskCategories = calculateRiskCategories(predictionData);
  const combinedRisk = riskCategories[3]; // Combined risk is the last one

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader 
        style={{ backgroundColor: getRiskColor(combinedRisk.level) }} 
        className="text-white rounded-t-lg"
      >
        <CardTitle className={`flex items-center justify-between ${language === 'ja' ? 'text-lg' : 'text-xl'}`} style={{ fontFamily }}>
          <div className="flex items-center gap-2">
            {getRiskIcon(combinedRisk.level)}
            {language === 'ja' ? 'リスク分析結果' : 'Risk Analysis Results'}
          </div>
          <Badge 
            variant="secondary" 
            className={`bg-white/20 text-white border-white/30 ${language === 'ja' ? 'text-xs' : 'text-sm'}`}
            style={{ fontFamily }}
          >
            {language === 'ja' ? '総合' : 'Overall'}: {combinedRisk.level.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Primary Combined Result */}
        <Alert className="border-2" style={{ borderColor: getRiskColor(combinedRisk.level) }}>
          <AlertTriangle className="h-4 w-4" style={{ color: getRiskColor(combinedRisk.level) }} />
          <AlertDescription className="space-y-2">
            <div className={`font-bold ${language === 'ja' ? 'text-base' : 'text-lg'}`} style={{ color: getRiskColor(combinedRisk.level), fontFamily }}>
              {combinedRisk.title}: {combinedRisk.level.toUpperCase()}
            </div>
            <div className={`text-gray-700 ${language === 'ja' ? 'text-sm' : 'text-base'}`} style={{ fontFamily }}>
              {combinedRisk.analysis}
            </div>
            <div className={`font-semibold text-gray-800 ${language === 'ja' ? 'text-sm' : 'text-base'}`} style={{ fontFamily }}>
              {combinedRisk.recommendation}
            </div>
          </AlertDescription>
        </Alert>

        {/* Individual Risk Categories */}
        <div className="space-y-4">
          <h3 className={`font-semibold text-gray-800 ${language === 'ja' ? 'text-base' : 'text-lg'}`} style={{ fontFamily }}>
            {language === 'ja' ? '詳細分析' : 'Detailed Analysis'}
          </h3>
          
          {riskCategories.slice(0, 3).map((category, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderLeftColor: getRiskColor(category.level) }}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-semibold text-gray-800 ${language === 'ja' ? 'text-sm' : 'text-base'}`} style={{ fontFamily }}>
                  {category.title}
                </h4>
                <Badge style={{ backgroundColor: getRiskColor(category.level) }} className={`text-white ${language === 'ja' ? 'text-xs' : 'text-sm'}`}>
                  {category.level.toUpperCase()}
                </Badge>
              </div>
              
              <div className={`space-y-2 ${language === 'ja' ? 'text-xs' : 'text-sm'}`}>
                <div className="text-gray-700" style={{ fontFamily }}>
                  <strong>{language === 'ja' ? '分析' : 'Analysis'}:</strong> {category.analysis}
                </div>
                
                <div className="text-gray-700" style={{ fontFamily }}>
                  <strong>{language === 'ja' ? '推奨事項' : 'Recommendation'}:</strong> {category.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Location Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className={`font-semibold text-gray-800 mb-2 ${language === 'ja' ? 'text-sm' : 'text-base'}`} style={{ fontFamily }}>
            {language === 'ja' ? '分析パラメータ' : 'Analysis Parameters'}
          </h4>
          <div className={`grid grid-cols-2 gap-4 ${language === 'ja' ? 'text-xs' : 'text-sm'}`} style={{ fontFamily }}>
            <div>
              <strong>{language === 'ja' ? '位置' : 'Location'}:</strong> {predictionData.latitude.toFixed(4)}°N, {predictionData.longitude.toFixed(4)}°E
            </div>
            <div>
              <strong>{language === 'ja' ? '深度' : 'Depth'}:</strong> {predictionData.depth}km
            </div>
            <div>
              <strong>{language === 'ja' ? '最後の地震からの日数' : 'Days Since Last EQ'}:</strong> {predictionData.daysSinceLastEQ}
            </div>
            <div>
              <strong>{language === 'ja' ? '平均マグニチュード' : 'Average Magnitude'}:</strong> M{predictionData.avgMagnitude}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskPredictionResults;
