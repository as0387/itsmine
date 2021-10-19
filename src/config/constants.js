export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://itsmine.ngrok.io"
    : "http://localhost:8001";
