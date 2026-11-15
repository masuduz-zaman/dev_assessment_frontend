export const env = {
  apiUrl: (process.env.API_URL ||"https://dev-assessment-backend.onrender.com/api/v1").replace(
    /\/$/,
    "",
  ),
};
