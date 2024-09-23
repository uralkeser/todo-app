import express from 'express';
const router = express.Router();
import {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  assignTaskToProject,
  filterTasksByProjectName,
  getProjectSortedByDate,
} from '../controller/projectController.js';

import {
  validateProjectCreation,
  validateProjectEdition,
  validateProjectDeletion,
  validateTaskAssign,
  validateFilterTasksByProjectName,
  validateProjectSortedByDate,
} from '../middleware/projectValidator.js';

//Create a project
router.post('/', validateProjectCreation, createProject);

//Get all projects
router.get('/', getAllProjects);

//Update a project
router.patch('/:id', validateProjectEdition, updateProject);

//Delete a project
router.delete('/:id', validateProjectDeletion, deleteProject);

//Assign a task to a project
router.post('/assignTask', validateTaskAssign, assignTaskToProject);

//Filter projects by project name
router.get(
  '/filter',
  validateFilterTasksByProjectName,
  filterTasksByProjectName
);

//Sort projects by dates
router.get('/sort', validateProjectSortedByDate, getProjectSortedByDate);

export default router;
