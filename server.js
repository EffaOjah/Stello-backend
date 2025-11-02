// server.js
const app = require("./app");
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3030;

testConnection();

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});