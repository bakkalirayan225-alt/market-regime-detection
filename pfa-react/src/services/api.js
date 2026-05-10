import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export const getCurrentRegime = async (model = "hmm") => {
  const response = await api.get(`/current-regime?model=${model}`);
  return response.data;
};

export const getPriceRegimes = async (model = "hmm") => {
  const response = await api.get(`/price-regimes?model=${model}`);
  return response.data;
};

export const getStatistics = async (model = "hmm") => {
  const response = await api.get(`/statistics?model=${model}`);
  return response.data;
};

export const getModelComparison = async () => {
  const response = await api.get(`/model-comparison`);
  return response.data;
};

export default api;
