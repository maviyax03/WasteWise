import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

export const classifyImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axios.post(`${API_URL}/classify`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getStats = async () => {
  const response = await axios.get(`${API_URL}/stats`);
  return response.data;
};
