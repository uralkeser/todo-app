export const serverConfig = {
  PORT_NUMBER: process.env.PORT || 8000,
};

export const databaseConfig = {
  DATABASE_URI: process.env.DATABASE_URI || 'mongodb://localhost:27017/',
  DATABASE_NAME: process.env.DATABASE_NAME || 'todoList',
};
