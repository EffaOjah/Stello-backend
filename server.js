// server.js
const app = require("./app");
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3030;

testConnection();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});