const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const CURRENT_WEATHER_URL = 'https://apihub.kma.go.kr/api/typ01/url/gts_syn1.php';
const FORECAST_URL = 'https://apihub.kma.go.kr/api/typ01/url/fct_shrt_reg.php';

app.get('/api/weather/current', async (req, res) => {
  try {
    const response = await axios.get(CURRENT_WEATHER_URL, {
      params: {
        authKey: 'MIgxK1f5QjaIMStX-dI2PQ'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('날씨 데이터를 가져오는데 실패했습니다:', error);
    res.status(500).json({ error: '날씨 데이터를 가져오는데 실패했습니다.' });
  }
});

app.get('/api/weather/forecast', async (req, res) => {
  try {
    const response = await axios.get(FORECAST_URL, {
      params: {
        authKey: 'xt8GKubTSfyfBirm0yn8TQ',
        tmfc: '0',
        tmef1: '1'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('날씨 예보를 가져오는데 실패했습니다:', error);
    res.status(500).json({ error: '날씨 예보를 가져오는데 실패했습니다.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`프록시 서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 