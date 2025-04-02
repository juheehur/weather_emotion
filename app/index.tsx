import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, useColorScheme, Pressable, ColorSchemeName, Modal } from 'react-native';
import { getCurrentWeather, WeatherData } from '../services/weatherService';
import * as Font from 'expo-font';
import { useColorScheme as useColorSchemeNative } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const getClothingRecommendation = (temperature: number, weather: string) => {
  let recommendation = '';
  
  if (temperature >= 28) {
    recommendation = "더운 날씨네요! 🌞\n\n" +
      "오늘은 이렇게 입으면 좋을 것 같아요:\n" +
      "• 반팔 티셔츠나 민소매\n" +
      "• 반바지나 얇은 면바지\n" +
      "• 샌들이나 슬리퍼\n\n" +
      "자외선 차단제도 꼭 잊지 마세요! 😺";
  } else if (temperature >= 23) {
    recommendation = "따뜻한 날씨예요 🌤\n\n" +
      "이런 옷차림은 어떠세요?\n" +
      "• 반팔 또는 얇은 셔츠\n" +
      "• 면바지나 얇은 긴바지\n" +
      "• 가벼운 운동화\n\n" +
      "더워지면 겉옷을 벗을 수 있게 챙기면 좋아요 😊";
  } else if (temperature >= 17) {
    recommendation = "선선하고 좋은 날씨네요 🍃\n\n" +
      "이렇게 입으면 딱 좋을 것 같아요:\n" +
      "• 얇은 니트나 맨투맨\n" +
      "• 청바지나 면바지\n" +
      "• 가벼운 자켓이나 가디건\n\n" +
      "날씨가 변할 수 있으니 겉옷 하나 챙기는 걸 추천해요! 😌";
  } else if (temperature >= 10) {
    recommendation = "쌀쌀한 날씨네요 🧥\n\n" +
      "이런 옷들을 추천해요:\n" +
      "• 두꺼운 니트나 맨투맨\n" +
      "• 코트나 자켓\n" +
      "• 목도리나 장갑\n\n" +
      "감기 조심하세요! 😊";
  } else {
    recommendation = "추운 날씨네요 ❄️\n\n" +
      "이렇게 입으면 따뜻할 거예요:\n" +
      "• 히트텍이나 내복\n" +
      "• 두꺼운 니트와 코트\n" +
      "• 목도리, 장갑, 귀마개\n\n" +
      "따뜻하게 입고 나가세요! 🧣";
  }

  if (weather.includes('비') || weather.includes('흐림')) {
    recommendation += "\n\n우산도 챙기면 좋을 것 같아요 ☔️";
  }

  return recommendation;
};

export default function HomeScreen() {
  const systemColorScheme = useColorSchemeNative();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    (systemColorScheme as 'light' | 'dark') || 'light'
  );
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 저장된 테마 설정 불러오기
    AsyncStorage.getItem('theme').then((savedTheme: string | null) => {
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setColorScheme(savedTheme);
      } else if (systemColorScheme === 'light' || systemColorScheme === 'dark') {
        setColorScheme(systemColorScheme);
      }
    });
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    async function loadFont() {
      try {
        await Font.loadAsync({
          'LeeSeoyun': require('../assets/fonts/LeeSeoyun.ttf'),
        });
        setFontLoaded(true);
      } catch (error) {
        console.error('폰트 로딩 실패:', error);
        setError('폰트를 불러오는데 실패했습니다. 앱을 다시 시작해주세요.');
      }
    }

    loadFont();
    fetchWeather();

    // 1분마다 날씨 정보 업데이트
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      const data = await getCurrentWeather();
      setWeather(data);
      setError(null);
    } catch (error) {
      console.error('날씨 데이터를 가져오는데 실패했습니다:', error);
      setError(error instanceof Error ? error.message : '날씨 데이터를 가져오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getCatImage = (temperature: number) => {
    try {
      if (temperature >= 30) return require('../assets/illustrations/cat_male_30C.png');
      if (temperature >= 24) return require('../assets/illustrations/cat_male_24C.png');
      if (temperature >= 15) return require('../assets/illustrations/cat_male_15C.png');
      if (temperature >= 9) return require('../assets/illustrations/cat_male_9C.png');
      return require('../assets/illustrations/cat_male_0C.png');
    } catch (error) {
      console.error('이미지 로딩 실패:', error);
      return require('../assets/illustrations/cat_male_15C.png');
    }
  };

  if (!fontLoaded || loading) {
    return (
      <View style={[styles.container, colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#666666'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
        <Text style={[styles.errorText, styles.fontParkDaHyun]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.push('/worldWeather')}
          style={[
            styles.worldWeatherButton,
            colorScheme === 'dark' ? styles.darkDetailBox : styles.lightDetailBox
          ]}
        >
          <Text style={[styles.worldWeatherText, styles.fontParkDaHyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
            세계의 날씨 🌍
          </Text>
        </Pressable>
        <Pressable 
          onPress={toggleTheme}
          style={[
            styles.themeToggle,
            colorScheme === 'dark' ? styles.darkThemeToggle : styles.lightThemeToggle
          ]}
        >
          <Text style={[styles.themeToggleText, styles.fontParkDaHyun]}>
            {colorScheme === 'dark' ? '🌙' : '☀️'}
          </Text>
        </Pressable>
      </View>

      {weather && (
        <View style={styles.contentContainer}>
          <View style={styles.weatherSection}>
            <Text style={[styles.location, styles.fontParkDaHyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
              {weather.location}
            </Text>
            <View style={styles.weatherMain}>
              <Text style={[styles.temperature, styles.fontParkDaHyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                {weather.temperature}°C
              </Text>
              <Text style={[styles.weather, styles.fontParkDaHyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                {weather.weather}
              </Text>
              <View style={styles.weatherStats}>
                <Text style={[styles.weatherStatText, styles.fontParkDaHyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                  습도 {weather.humidity}% · 풍속 {Math.round(weather.windSpeed * 10) / 10}m/s
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.outfitSection}>
            <View style={styles.imageContainer}>
              <Image
                source={getCatImage(weather.temperature)}
                style={styles.catImage}
                resizeMode="contain"
              />
            </View>
            <Pressable
              onPress={() => setShowRecommendation(true)}
              style={[
                styles.recommendButton,
                colorScheme === 'dark' ? styles.darkDetailBox : styles.lightDetailBox
              ]}
            >
              <Text style={[styles.recommendButtonText, styles.fontParkDaHyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                오늘 뭐 입을까요? 👔
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={showRecommendation}
        onRequestClose={() => setShowRecommendation(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowRecommendation(false)}
        >
          <View style={[
            styles.modalContent,
            colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer
          ]}>
            <Text style={[styles.recommendationText, styles.fontParkDaHyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
              {weather ? getClothingRecommendation(weather.temperature, weather.weather) : ''}
            </Text>
            <Pressable
              style={[styles.closeButton, colorScheme === 'dark' ? styles.darkDetailBox : styles.lightDetailBox]}
              onPress={() => setShowRecommendation(false)}
            >
              <Text style={[styles.closeButtonText, styles.fontParkDaHyun, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                확인 😊
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  lightContainer: {
    backgroundColor: '#fafaf8',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  fontParkDaHyun: {
    fontFamily: 'LeeSeoyun',
  },
  lightText: {
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  lightDetailBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  darkDetailBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  weatherSection: {
    paddingVertical: 20,
  },
  weatherMain: {
    alignItems: 'center',
  },
  location: {
    fontSize: 28,
    marginBottom: 10,
    textAlign: 'center',
  },
  temperature: {
    fontSize: 64,
    fontWeight: '600',
  },
  weather: {
    fontSize: 24,
    marginTop: 5,
  },
  weatherStats: {
    marginTop: 15,
  },
  weatherStatText: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  outfitSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catImage: {
    width: '80%',
    height: '80%',
  },
  worldWeatherButton: {
    padding: 12,
    borderRadius: 20,
  },
  worldWeatherText: {
    fontSize: 16,
  },
  themeToggle: {
    padding: 12,
    borderRadius: 20,
  },
  lightThemeToggle: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  darkThemeToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  themeToggleText: {
    fontSize: 20,
  },
  recommendButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  recommendButtonText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 25,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    borderRadius: 15,
    minWidth: 100,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 20,
  },
}); 