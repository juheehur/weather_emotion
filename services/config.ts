export const WEATHERAPI_KEY = '952a43360c6943aba79112404250204';
export const KMA_API_KEY = 'MIgxK1f5QjaIMStX-dI2PQ';

export const isKoreaLocation = (latitude: number, longitude: number): boolean => {
  // 대한민국의 대략적인 좌표 범위
  return latitude >= 33 && latitude <= 39 && longitude >= 124 && longitude <= 132;
}; 