import axios from 'axios';
import * as Location from 'expo-location';
import { WEATHERAPI_KEY, KMA_API_KEY, isKoreaLocation } from './config';

const PROXY_URL = 'http://localhost:3000/api';

// 기본 위치 (서울)
const DEFAULT_LOCATION = {
  latitude: 37.5665,
  longitude: 126.9780,
};

export interface WeatherData {
  temperature: number;
  weather: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export interface ForecastData {
  date: string;
  temperature: number;
  weather: string;
}

// 위도/경도로 가장 가까운 관측소 데이터 찾기
const findNearestStation = (data: string, latitude: number, longitude: number) => {
  const lines = data.split('\n');
  const dataLines = lines.filter(line => 
    line.trim().length > 0 && 
    !line.startsWith('#') && 
    !line.startsWith('YYMM')
  );

  // 현재는 첫 번째 유효한 데이터를 사용
  // TODO: 실제 위도/경도 기반 가까운 관측소 찾기 로직 구현
  return dataLines[0];
};

const parseKMAWeather = (data: string): WeatherData => {
  const lines = data.split('\n');
  const dataLine = lines.find(line => {
    return line.trim().length > 0 && 
           !line.startsWith('#') && 
           !line.startsWith('YYMM');
  });

  if (!dataLine) {
    throw new Error('날씨 데이터를 찾을 수 없습니다.');
  }

  const values = dataLine.split(/\s+/).filter(val => val.length > 0);
  
  return {
    temperature: parseFloat(values[9]) || 0,
    weather: parseInt(values[7]) <= 2 ? '맑음' : '흐림',
    humidity: parseFloat(values[12]) || 0,
    windSpeed: parseFloat(values[8]) || 0,
    location: '서울'
  };
};

const getWeatherAPIData = async (latitude: number, longitude: number): Promise<WeatherData> => {
  try {
    const response = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${latitude},${longitude}&lang=ko`
    );

    const data = response.data;
    return {
      temperature: Math.round(data.current.temp_c),
      weather: data.current.condition.text,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph / 3.6 * 10) / 10, // km/h를 m/s로 변환하고 소수점 첫째 자리까지 반올림
      location: data.location.name
    };
  } catch (error) {
    console.error('WeatherAPI 호출 실패:', error);
    throw error;
  }
};

export const getCurrentWeather = async (latitude?: number, longitude?: number): Promise<WeatherData> => {
  try {
    let coords;
    
    if (latitude !== undefined && longitude !== undefined) {
      coords = { latitude, longitude };
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('위치 권한이 거부되어 기본 위치(서울)를 사용합니다.');
        coords = DEFAULT_LOCATION;
      } else {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000,
          mayShowUserSettingsDialog: false
        });
        coords = location.coords;
      }
    }

    const response = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHERAPI_KEY}&q=${coords.latitude},${coords.longitude}&lang=ko`
    );

    const data = response.data;
    return {
      temperature: Math.round(data.current.temp_c),
      weather: data.current.condition.text,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph / 3.6 * 10) / 10, // km/h를 m/s로 변환하고 소수점 첫째 자리까지 반올림
      location: data.location.name
    };
  } catch (error) {
    console.error('날씨 데이터를 가져오는데 실패했습니다:', error);
    throw error;
  }
};

export const getWeatherForecast = async (): Promise<ForecastData[]> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    let latitude = DEFAULT_LOCATION.latitude;
    let longitude = DEFAULT_LOCATION.longitude;

    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      latitude = location.coords.latitude;
      longitude = location.coords.longitude;
    }

    const response = await axios.get(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${latitude},${longitude}&days=3&lang=ko`
    );

    return response.data.forecast.forecastday.map((day: any) => ({
      date: day.date,
      temperature: Math.round(day.day.avgtemp_c),
      weather: day.day.condition.text
    }));
  } catch (error) {
    console.error('날씨 예보를 가져오는데 실패했습니다:', error);
    return [];
  }
}; 