
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EarthquakeZone {
  id: string;
  zone_name: string;
  prefecture: string;
  center_latitude: number;
  center_longitude: number;
  radius_km: number;
  risk_category: string;
  average_magnitude: number;
  last_major_earthquake: string | null;
}

interface EarthquakeData {
  id: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  location_name: string | null;
  prefecture: string | null;
  occurred_at: string;
}

interface JapanEarthquakeData {
  id: string;
  city: string;
  latitude: number;
  longitude: number;
  depth_km: number;
  avg_magnitude: number;
  days_since_last_eq: number;
}

export const useEarthquakeData = () => {
  const [zones, setZones] = useState<EarthquakeZone[]>([]);
  const [recentEarthquakes, setRecentEarthquakes] = useState<EarthquakeData[]>([]);
  const [japanCityData, setJapanCityData] = useState<JapanEarthquakeData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEarthquakeZones = async () => {
    try {
      const { data, error } = await supabase
        .from('earthquake_zones')
        .select('*')
        .order('risk_category', { ascending: false });

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching earthquake zones:', error);
      toast({
        title: "データ取得エラー / Data Fetch Error",
        description: "地震地域データの取得に失敗しました / Failed to fetch earthquake zone data",
        variant: "destructive"
      });
    }
  };

  const fetchJapanCityData = async () => {
    try {
      const { data, error } = await supabase
        .from('japan_earthquake_data')
        .select('*')
        .order('avg_magnitude', { ascending: false });

      if (error) throw error;
      setJapanCityData(data || []);
    } catch (error) {
      console.error('Error fetching Japan city data:', error);
      toast({
        title: "都市データ取得エラー / City Data Fetch Error",
        description: "日本の都市地震データの取得に失敗しました / Failed to fetch Japan city earthquake data",
        variant: "destructive"
      });
    }
  };

  const fetchRecentEarthquakes = async () => {
    try {
      const { data, error } = await supabase
        .from('earthquake_data')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentEarthquakes(data || []);
    } catch (error) {
      console.error('Error fetching recent earthquakes:', error);
    }
  };

  const findNearbyZones = (latitude: number, longitude: number, radiusKm: number = 100) => {
    return zones.filter(zone => {
      const distance = calculateDistance(
        latitude, longitude,
        zone.center_latitude, zone.center_longitude
      );
      return distance <= radiusKm;
    });
  };

  const findNearestCity = (latitude: number, longitude: number) => {
    let nearestCity = null;
    let minDistance = Infinity;

    japanCityData.forEach(city => {
      const distance = calculateDistance(
        latitude, longitude,
        city.latitude, city.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = { ...city, distance };
      }
    });

    return nearestCity;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const categorizeRisk = (avgMagnitude: number, depthKm: number, daysSinceLastEq: number): 'high' | 'medium' | 'low' => {
    if (avgMagnitude >= 5.0 && depthKm <= 60 && daysSinceLastEq <= 2) {
      return 'high';
    } else if (avgMagnitude >= 4.5 && depthKm <= 70 && daysSinceLastEq <= 6) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  const generateAdvancedPrediction = (
    latitude: number, 
    longitude: number, 
    depth: number, 
    daysSinceLast: number, 
    magnitude: number
  ) => {
    const nearestCity = findNearestCity(latitude, longitude);
    let riskScore = 0;
    let details = '';
    
    // Base risk calculation using the new categorization logic
    const baseRisk = categorizeRisk(magnitude, depth, daysSinceLast);
    
    // Base risk calculation using nearest city data
    if (nearestCity && nearestCity.distance < 50) {
      const cityRisk = calculateCityRisk(nearestCity);
      riskScore += cityRisk * 0.4; // 40% weight for city historical data
      details += `Nearest reference city: ${nearestCity.city} (${nearestCity.distance.toFixed(1)}km away). `;
      
      // Apply the new categorization logic to nearest city data
      const cityRiskCategory = categorizeRisk(nearestCity.avg_magnitude, nearestCity.depth_km, nearestCity.days_since_last_eq);
      details += `City risk category: ${cityRiskCategory}. `;
    }

    // Depth factor (shallow earthquakes are more dangerous)
    if (depth < 30) {
      riskScore += 40;
      details += 'Shallow depth increases surface impact risk. ';
    } else if (depth < 70) {
      riskScore += 20;
      details += 'Moderate depth with significant surface impact potential. ';
    } else {
      riskScore += 5;
      details += 'Deep earthquake with reduced surface impact. ';
    }

    // Magnitude factor
    if (magnitude > 5.5) {
      riskScore += 35;
      details += 'High magnitude indicates potential for severe damage. ';
    } else if (magnitude > 4.5) {
      riskScore += 20;
      details += 'Moderate magnitude with noticeable effects. ';
    } else {
      riskScore += 5;
      details += 'Low magnitude with minimal effects. ';
    }

    // Time factor (recent activity increases risk)
    if (daysSinceLast < 3) {
      riskScore += 25;
      details += 'Recent seismic activity indicates ongoing geological stress. ';
    } else if (daysSinceLast < 15) {
      riskScore += 15;
      details += 'Recent earthquake activity in the region. ';
    } else if (daysSinceLast > 365) {
      riskScore += 10;
      details += 'Extended quiet period may indicate accumulated stress. ';
    }

    // Use the new categorization logic as the primary risk determinant
    let risk: 'low' | 'medium' | 'high' = baseRisk;
    
    // Adjust based on calculated risk score if significantly different
    if (riskScore >= 70 && risk !== 'high') {
      risk = 'high';
    } else if (riskScore >= 40 && risk === 'low') {
      risk = 'medium';
    }

    return {
      risk,
      confidence: Math.min(95, Math.max(75, riskScore + 10)),
      details,
      nearestCity: nearestCity?.city || 'Unknown',
      riskScore
    };
  };

  const calculateCityRisk = (cityData: JapanEarthquakeData) => {
    let cityRisk = 0;
    
    // Magnitude factor
    if (cityData.avg_magnitude > 5.0) cityRisk += 30;
    else if (cityData.avg_magnitude > 4.5) cityRisk += 20;
    else cityRisk += 10;

    // Days since last earthquake
    if (cityData.days_since_last_eq < 3) cityRisk += 25;
    else if (cityData.days_since_last_eq < 10) cityRisk += 15;
    else if (cityData.days_since_last_eq > 365) cityRisk += 10;

    // Depth factor
    if (cityData.depth_km < 50) cityRisk += 20;
    else if (cityData.depth_km < 70) cityRisk += 10;

    return Math.min(100, cityRisk);
  };

  const savePrediction = async (predictionData: {
    latitude: number;
    longitude: number;
    depth: number;
    magnitude: number;
    days_since_last: number;
    risk_level: string;
    confidence: number;
    prediction_details: string;
    warning_en: string;
    warning_jp: string;
  }) => {
    try {
      const { error } = await supabase
        .from('risk_predictions')
        .insert([predictionData]);

      if (error) throw error;
      
      toast({
        title: "予測保存完了 / Prediction Saved",
        description: "リスク予測がデータベースに保存されました / Risk prediction saved to database"
      });
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  };

  useEffect(() => {
    fetchEarthquakeZones();
    fetchRecentEarthquakes();
    fetchJapanCityData();
  }, []);

  return {
    zones,
    recentEarthquakes,
    japanCityData,
    loading,
    findNearbyZones,
    findNearestCity,
    generateAdvancedPrediction,
    savePrediction,
    fetchEarthquakeZones,
    fetchRecentEarthquakes,
    fetchJapanCityData,
    categorizeRisk
  };
};
