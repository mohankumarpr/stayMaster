import axios from 'axios';

const api = axios.create({
  baseURL: 'https://staymaster.in',
  headers: {
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImVtYWlsIjoiaG9zdF9hcGlAdGhlc3RheW1hc3Rlci5jb20iLCJpZCI6MjF9LCJpYXQiOjE3Mzk3OTA5MTV9.XdgD08NiBQM6sf7bIXZlan93QebohKgOOsRilwXrClA'
  }
});

export default api;