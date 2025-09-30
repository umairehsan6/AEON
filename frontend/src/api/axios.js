import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000", // backend root (change if your backend runs elsewhere)
  headers: {
    "Content-Type": "application/json",
  },
});

// ensure no stale auth header for public endpoints
delete API.defaults.headers.common["Authorization"];

export default API;