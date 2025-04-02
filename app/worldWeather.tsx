import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { getCurrentWeather, WeatherData } from '../services/weatherService';
import { useRouter } from 'expo-router';

const POPULAR_CITIES = [
  { name: '서울', coords: { latitude: 37.5665, longitude: 126.9780 } },
  { name: '도쿄', coords: { latitude: 35.6762, longitude: 139.6503 } },
  { name: '베이징', coords: { latitude: 39.9042, longitude: 116.4074 } },
  { name: '뉴욕', coords: { latitude: 40.7128, longitude: -74.0060 } },
  { name: '런던', coords: { latitude: 51.5074, longitude: -0.1278 } },
  { name: '파리', coords: { latitude: 48.8566, longitude: 2.3522 } },
  { name: '시드니', coords: { latitude: -33.8688, longitude: 151.2093 } },
  { name: '두바이', coords: { latitude: 25.2048, longitude: 55.2708 } },
];

const getCatImage = (temperature: number): any => {
  try {
    if (temperature >= 30) {
      return require('../assets/illustrations/cat_male_30C.png');
    } else if (temperature >= 24) {
      return require('../assets/illustrations/cat_male_24C.png');
    } else if (temperature >= 15) {
      return require('../assets/illustrations/cat_male_15C.png');
    } else if (temperature >= 9) {
      return require('../assets/illustrations/cat_male_9C.png');
    } else {
      return require('../assets/illustrations/cat_male_0C.png');
    }
  } catch (error) {
    console.error('이미지 로딩 실패:', error);
    return require('../assets/illustrations/cat_male_15C.png');
  }
};

export default function WorldWeatherScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCityPress = async (city: typeof POPULAR_CITIES[0]) => {
    setLoading(true);
    setError(null);
    try {
      const weatherData = await getCurrentWeather(city.coords.latitude, city.coords.longitude);
      setWeather(weatherData);
    } catch (error) {
      console.error('날씨 데이터를 가져오는데 실패했습니다:', error);
      setError('날씨 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <View style={styles.header}>
        <Pressable
          style={[styles.backButton, colorScheme === 'dark' ? styles.darkButton : styles.lightButton]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, styles.fontLeeSeoyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
            ← 돌아가기
          </Text>
        </Pressable>
        <Text style={[styles.title, styles.fontLeeSeoyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
          세계의 날씨 🌍
        </Text>
      </View>

      <ScrollView style={styles.citiesContainer} contentContainerStyle={styles.citiesContent}>
        <Text style={[styles.sectionTitle, styles.fontLeeSeoyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
          주요 도시
        </Text>
        <View style={styles.cityGrid}>
          {POPULAR_CITIES.map((city) => (
            <Pressable
              key={city.name}
              style={[
                styles.cityButton,
                colorScheme === 'dark' ? styles.darkButton : styles.lightButton
              ]}
              onPress={() => handleCityPress(city)}
            >
              <Text style={[styles.cityButtonText, styles.fontLeeSeoyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                {city.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {weather && (
          <View style={styles.weatherInfo}>
            <Text style={[styles.weatherTitle, styles.fontLeeSeoyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
              {weather.location}의 날씨
            </Text>
            <View style={styles.weatherContent}>
              <View style={styles.weatherTextContainer}>
                <Text style={[styles.weatherText, styles.fontLeeSeoyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                  {weather.temperature}°C, {weather.weather}
                </Text>
                <View style={styles.weatherStatsContainer}>
                  <View style={styles.weatherStat}>
                    <Text style={[styles.weatherStatLabel, styles.fontLeeSeoyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                      습도
                    </Text>
                    <Text style={[styles.weatherStatValue, styles.fontLeeSeoyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                      {weather.humidity}%
                    </Text>
                  </View>
                  <View style={styles.weatherStat}>
                    <Text style={[styles.weatherStatLabel, styles.fontLeeSeoyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                      풍속
                    </Text>
                    <Text style={[styles.weatherStatValue, styles.fontLeeSeoyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                      {Math.round(weather.windSpeed * 10) / 10}m/s
                    </Text>
                  </View>
                </View>
              </View>
              <Image
                source={getCatImage(weather.temperature)}
                style={styles.catImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        {error && (
          <Text style={[styles.errorText, styles.fontLeeSeoyun]}>
            {error}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  lightContainer: {
    backgroundColor: '#fafaf8',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  fontLeeSeoyun: {
    fontFamily: 'LeeSeoyun',
  },
  lightText: {
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  backButton: {
    padding: 10,
    borderRadius: 10,
  },
  lightButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  darkButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    fontSize: 16,
  },
  citiesContainer: {
    flex: 1,
  },
  citiesContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cityButton: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  cityButtonText: {
    fontSize: 16,
  },
  weatherInfo: {
    marginTop: 20,
  },
  lightWeatherInfo: {
    backgroundColor: 'transparent',
  },
  darkWeatherInfo: {
    backgroundColor: 'transparent',
  },
  weatherTitle: {
    fontSize: 24,
    marginBottom: 15,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherTextContainer: {
    flex: 1,
  },
  weatherText: {
    fontSize: 18,
    marginBottom: 8,
  },
  catImage: {
    width: 100,
    height: 100,
    marginLeft: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  weatherStatsContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  weatherStat: {
    marginRight: 30,
  },
  weatherStatLabel: {
    fontSize: 16,
    marginBottom: 4,
    opacity: 0.8,
  },
  weatherStatValue: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 