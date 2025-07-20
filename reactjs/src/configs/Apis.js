import axios from "axios";
import Cookies from 'js-cookie';

export const BASE_URL = "http://localhost:8080/api";

export const endpoints = {
  login: "/login"
}

export const authApis = () => {
  const token = Cookies.get("token")
  console.log(token);
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export default axios.create({
  baseURL: BASE_URL,
});
