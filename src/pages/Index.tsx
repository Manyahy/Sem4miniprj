import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Activity, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import RiskPredictionResults from '@/components/RiskPredictionResults';
import Header from '@/components/Header';
import SimpleRiskMap from '@/components/SimpleRiskMap';
import { useEarthquakeData } from '@/hooks/useEarthquakeData';
import { RISK_TEST_DATA } from '@/constants/riskTestData';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    depth: '',
    daysSinceLastEarthquake: '',
    averagePastMagnitude: ''
  });

  const [predictionData, setPredictionData] = useState<{
    latitude: number;
    longitude: number;
    depth: number;
    daysSinceLastEQ: number;
    avgMagnitude: number;
  } | null>(null);

  const [calculatedRiskLevel, setCalculatedRiskLevel] = useState<'low' | 'medium' | 'high' | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const { zones, findNearbyZones, generateAdvancedPrediction, savePrediction, japanCityData, categorizeRisk } = useEarthquakeData();

  // Updated sample locations with user-friendly descriptions
  const sampleLocations = [
    {
      name: t('highRisk'),
      subtitle: language === 'ja' ? "高リスク地域" : "High Risk Area",
      ...RISK_TEST_DATA.HIGH_RISK
    },
    {
      name: t('mediumRisk'), 
      subtitle: language === 'ja' ? "中リスク地域" : "Medium Risk Area",
      ...RISK_TEST_DATA.MEDIUM_RISK
    },
    {
      name: t('lowRisk'),
      subtitle: language === 'ja' ? "低リスク地域" : "Low Risk Area", 
      ...RISK_TEST_DATA.LOW_RISK
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadSampleData = (sample: typeof sampleLocations[0]) => {
    setFormData({
      latitude: sample.latitude,
      longitude: sample.longitude,
      depth: sample.depth,
      daysSinceLastEarthquake: sample.daysSinceLastEarthquake,
      averagePastMagnitude: sample.averagePastMagnitude
    });
    
    toast({
      title: t('sampleDataLoaded'),
      description: `${sample.subtitle} - ${sample.name}`,
    });
  };

  const validateJapanCoordinates = (lat: number, lng: number) => {
    return lat >= 24 && lat <= 46 && lng >= 129 && lng <= 146;
  };

  const handlePredict = async () => {
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    const depth = parseFloat(formData.depth);
    const days = parseInt(formData.daysSinceLastEarthquake);
    const magnitude = parseFloat(formData.averagePastMagnitude);

    if (isNaN(lat) || isNaN(lng) || isNaN(depth) || isNaN(days) || isNaN(magnitude)) {
      toast({
        title: t('invalidInput'),
        description: t('enterValidValues'),
        variant: "destructive"
      });
      return;
    }

    if (!validateJapanCoordinates(lat, lng)) {
      toast({
        title: t('locationError'),
        description: t('enterJapanCoords'),
        variant: "destructive"
      });
      return;
    }

    if (depth < 0 || depth > 1000 || days < 0 || days > 10000 || magnitude < 0 || magnitude > 10) {
      toast({
        title: t('rangeError'),
        description: t('valuesOutOfRange'),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    setTimeout(async () => {
      const newPredictionData = {
        latitude: lat,
        longitude: lng,
        depth,
        daysSinceLastEQ: days,
        avgMagnitude: magnitude
      };

      // Calculate the actual risk level using the same logic as RiskPredictionResults
      const riskLevel = categorizeRisk(magnitude, depth, days);
      
      setPredictionData(newPredictionData);
      setCalculatedRiskLevel(riskLevel);
      setIsLoading(false);
      
      toast({
        title: t('predictionComplete'),
        description: t('allCategoriesAnalyzed'),
      });
    }, 1500);
  };

  const fontFamily = language === 'ja' ? '"Noto Sans JP", sans-serif' : '"Inter", sans-serif';

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, #FFE8E6, #FFF4E6, #FFFACD)`, fontFamily }}>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className={`font-bold text-gray-900 mb-4 flex items-center justify-center gap-3 ${language === 'ja' ? 'text-3xl' : 'text-4xl'}`} style={{ fontFamily }}>
            <Activity style={{ color: '#FF5C4D' }} size={40} />
            {t('title')}
          </h1>
          <p className={`text-gray-600 max-w-4xl mx-auto ${language === 'ja' ? 'text-lg' : 'text-xl'}`} style={{ fontFamily }}>
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Input Form */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader style={{ background: `linear-gradient(135deg, #FF9636, #FFCD58)` }} className="text-white rounded-t-lg">
              <CardTitle className={`flex items-center gap-2 ${language === 'ja' ? 'text-lg' : 'text-xl'}`} style={{ fontFamily }}>
                <MapPin size={24} />
                {t('locationParams')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Sample Data Buttons */}
              <div className="space-y-3">
                <Label className={`font-semibold text-gray-700 ${language === 'ja' ? 'text-sm' : 'text-sm'}`} style={{ fontFamily }}>
                  {t('sampleData')}
                </Label>
                <div className="grid gap-2">
                  {sampleLocations.map((sample, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => loadSampleData(sample)}
                      className={`justify-start hover:bg-orange-50 border-orange-200 flex flex-col items-start p-3 h-auto ${language === 'ja' ? 'text-xs' : 'text-xs'}`}
                      style={{ borderColor: '#FF9636', fontFamily }}
                    >
                      <div className="font-semibold">{sample.name}</div>
                      <div className="text-xs text-gray-600">{sample.subtitle}</div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input fields */}
              <div className="space-y-2">
                <Label htmlFor="latitude" className={`font-semibold text-gray-700 ${language === 'ja' ? 'text-sm' : 'text-sm'}`} style={{ fontFamily }}>
                  {t('latitude')} (degrees)
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  placeholder={language === 'ja' ? "例: 35.6762 (東京)" : "e.g., 35.6762 (Tokyo)"}
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                  style={{ fontFamily }}
                />
                <p className={`text-gray-500 ${language === 'ja' ? 'text-xs' : 'text-xs'}`} style={{ fontFamily }}>
                  {language === 'ja' ? '有効範囲: 24° to 46° (日本国境)' : 'Valid range: 24° to 46° (Japan boundaries)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude" className={`font-semibold text-gray-700 ${language === 'ja' ? 'text-sm' : 'text-sm'}`} style={{ fontFamily }}>
                  {t('longitude')} (degrees)
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  placeholder={language === 'ja' ? "例: 139.6503 (東京)" : "e.g., 139.6503 (Tokyo)"}
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                  style={{ fontFamily }}
                />
                <p className={`text-gray-500 ${language === 'ja' ? 'text-xs' : 'text-xs'}`} style={{ fontFamily }}>
                  {language === 'ja' ? '有効範囲: 129° to 146° (日本国境)' : 'Valid range: 129° to 146° (Japan boundaries)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depth" className={`font-semibold text-gray-700 ${language === 'ja' ? 'text-sm' : 'text-sm'}`} style={{ fontFamily }}>
                  {t('depth')} (km)
                </Label>
                <Input
                  id="depth"
                  type="number"
                  step="0.1"
                  placeholder={language === 'ja' ? "例: 10.5" : "e.g., 10.5"}
                  value={formData.depth}
                  onChange={(e) => handleInputChange('depth', e.target.value)}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                  style={{ fontFamily }}
                />
                <p className={`text-gray-500 ${language === 'ja' ? 'text-xs' : 'text-xs'}`} style={{ fontFamily }}>
                  {language === 'ja' ? '深度は地表の衝撃強度に影響します' : 'Depth affects surface impact intensity'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="days" className={`font-semibold text-gray-700 ${language === 'ja' ? 'text-sm' : 'text-sm'}`} style={{ fontFamily }}>
                  {t('daysSince')}
                </Label>
                <Input
                  id="days"
                  type="number"
                  placeholder={language === 'ja' ? "例: 45" : "e.g., 45"}
                  value={formData.daysSinceLastEarthquake}
                  onChange={(e) => handleInputChange('daysSinceLastEarthquake', e.target.value)}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                  style={{ fontFamily }}
                />
                <p className={`text-gray-500 ${language === 'ja' ? 'text-xs' : 'text-xs'}`} style={{ fontFamily }}>
                  {language === 'ja' ? '最後に記録された地震活動からの時間' : 'Time since last recorded seismic activity'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="magnitude" className={`font-semibold text-gray-700 ${language === 'ja' ? 'text-sm' : 'text-sm'}`} style={{ fontFamily }}>
                  {t('avgMagnitude')}
                </Label>
                <Input
                  id="magnitude"
                  type="number"
                  step="0.1"
                  placeholder={language === 'ja' ? "例: 5.2" : "e.g., 5.2"}
                  value={formData.averagePastMagnitude}
                  onChange={(e) => handleInputChange('averagePastMagnitude', e.target.value)}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                  style={{ fontFamily }}
                />
                <p className={`text-gray-500 ${language === 'ja' ? 'text-xs' : 'text-xs'}`} style={{ fontFamily }}>
                  {language === 'ja' ? 'この地域の歴史的平均地震マグニチュード' : 'Historical average earthquake magnitude in this area'}
                </p>
              </div>

              <Button 
                onClick={handlePredict}
                disabled={isLoading}
                className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 ${language === 'ja' ? 'text-sm' : 'text-base'}`}
                style={{ background: `linear-gradient(135deg, #FF5C4D, #FF9636)`, fontFamily }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('analyzing')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Activity size={20} />
                    {t('predictRisk')}
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Risk Map */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader style={{ background: `linear-gradient(135deg, #DAD870, #FFCD58)` }} className="text-white rounded-t-lg">
              <CardTitle className={`flex items-center gap-2 ${language === 'ja' ? 'text-lg' : 'text-xl'}`} style={{ fontFamily }}>
                <MapPin size={24} />
                {t('riskMap')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SimpleRiskMap 
                latitude={parseFloat(formData.latitude) || null}
                longitude={parseFloat(formData.longitude) || null}
                riskLevel={calculatedRiskLevel}
              />
            </CardContent>
          </Card>

          {/* Prediction Results */}
          <RiskPredictionResults 
            predictionData={predictionData} 
            isLoading={isLoading}
            onRiskCalculated={(risk) => setCalculatedRiskLevel(risk)}
          />
        </div>

        {/* Simplified Risk Information */}
        <Card className="mt-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle style={{ color: '#FF9636' }} size={28} />
              <h2 className={`font-bold text-gray-900 ${language === 'ja' ? 'text-xl' : 'text-2xl'}`} style={{ fontFamily }}>
                {t('riskAnalysis')}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <Badge style={{ backgroundColor: '#FF5C4D' }} className={`mb-2 text-white ${language === 'ja' ? 'text-xs' : 'text-sm'}`}>
                  {language === 'ja' ? '深度分析' : 'Depth Analysis'}
                </Badge>
                <p className={`text-gray-700 ${language === 'ja' ? 'text-xs' : 'text-sm'}`} style={{ fontFamily }}>
                  {language === 'ja' ? '浅い地震ほど地表への被害が大きい' : 'Shallow earthquakes cause more surface damage'}
                </p>
              </div>
              <div className="text-center">
                <Badge style={{ backgroundColor: '#FFCD58' }} className={`mb-2 text-white ${language === 'ja' ? 'text-xs' : 'text-sm'}`}>
                  {language === 'ja' ? '時間分析' : 'Time Analysis'}
                </Badge>
                <p className={`text-gray-700 ${language === 'ja' ? 'text-xs' : 'text-sm'}`} style={{ fontFamily }}>
                  {language === 'ja' ? '最近の活動や長期静穏期がリスクに影響' : 'Recent activity or long quiet periods affect risk'}
                </p>
              </div>
              <div className="text-center">
                <Badge style={{ backgroundColor: '#DAD870' }} className={`mb-2 text-white ${language === 'ja' ? 'text-xs' : 'text-sm'}`}>
                  {language === 'ja' ? 'マグニチュード分析' : 'Magnitude Analysis'}
                </Badge>
                <p className={`text-gray-700 ${language === 'ja' ? 'text-xs' : 'text-sm'}`} style={{ fontFamily }}>
                  {language === 'ja' ? '高マグニチュードは深刻な被害の可能性' : 'High magnitude indicates severe damage potential'}
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className={`font-semibold mb-3 ${language === 'ja' ? 'text-base' : 'text-lg'}`} style={{ fontFamily }}>
                  {language === 'ja' ? '分析方法' : 'Analysis Method'}
                </h3>
                <ul className={`space-y-2 ${language === 'ja' ? 'text-xs' : 'text-sm'}`} style={{ fontFamily }}>
                  <li>• {language === 'ja' ? '各リスク要因を個別に評価' : 'Individual evaluation of each risk factor'}</li>
                  <li>• {language === 'ja' ? '総合的なリスクスコア計算' : 'Comprehensive risk score calculation'}</li>
                  <li>• {language === 'ja' ? '実用的な推奨事項の提供' : 'Practical recommendations provided'}</li>
                  <li>• {language === 'ja' ? 'リアルタイム分析と結果表示' : 'Real-time analysis and results display'}</li>
                </ul>
              </div>
              <div>
                <h3 className={`font-semibold mb-3 ${language === 'ja' ? 'text-base' : 'text-lg'}`} style={{ fontFamily }}>
                  {language === 'ja' ? 'リスクレベル' : 'Risk Levels'}
                </h3>
                <ul className={`space-y-2 ${language === 'ja' ? 'text-xs' : 'text-sm'}`} style={{ fontFamily }}>
                  <li>• {language === 'ja' ? '高リスク：即座の準備行動が必要' : 'High Risk: Immediate preparedness actions needed'}</li>
                  <li>• {language === 'ja' ? '中リスク：注意深い監視と準備' : 'Medium Risk: Careful monitoring and preparation'}</li>
                  <li>• {language === 'ja' ? '低リスク：基本的な注意レベル' : 'Low Risk: Basic awareness level'}</li>
                  <li>• {language === 'ja' ? '各レベルに応じた具体的なガイダンス' : 'Specific guidance for each level'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
