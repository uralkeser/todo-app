import express from 'express';
import { serverConfig } from './config/configConstant.js';
import { logger } from './middleware/logger.js';
import taskRouter from './route/taskRouter.js';
import projectRouter from './route/projectRouter.js';

const app = express();

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Logger middleware
app.use(logger);

//Routes
app.use('/api/task', taskRouter);

app.listen(serverConfig.PORT_NUMBER, () =>
  console.log(`Server is runing on port ${serverConfig.PORT_NUMBER}`)
);
