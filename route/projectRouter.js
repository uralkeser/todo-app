import express from 'express';
const router = express.Router();
import { getProject, createProject } from '../controller/projectController.js';

//Get all projects
router.get('/', getProject);

//Create a project
router.post('/', createProject);

export default router;
