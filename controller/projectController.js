import { mongoConnection } from '../config/mongoConfig.js';

const db = await mongoConnection();
const projectCollection = db.collection('posts');

export const getProject = (req, res) => {
  res.status(200).json(projects);
};

export const createProject = (req, res) => {
  res.status(200).json(projects);
};
