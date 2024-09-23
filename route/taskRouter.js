import express from 'express';
const router = express.Router();
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  markTaskByStatus,
  filterByStatus,
  getTaskSortedByDate,
  searchByName,
} from '../controller/taskController.js';

import {
  validateTaskCreation,
  validateTaskEdition,
  validateTaskDeletion,
  validateTaskMarkingByStatus,
  validateTaskFilterByStatus,
  validateTaskSearchByName,
  validateTaskSortedByDate,
} from '../middleware/taskValidator.js';

//Create a task
router.post('/', validateTaskCreation, createTask);

//Get all tasks
router.get('/', getAllTasks);

//Update a task
router.patch('/:id', validateTaskEdition, updateTask);

//Delete a task
router.delete('/:id', validateTaskDeletion, deleteTask);

//Mark a task as to-do/done
router.patch('/mark/:id', validateTaskMarkingByStatus, markTaskByStatus);

//Filter tasks by status
router.get('/filter', validateTaskFilterByStatus, filterByStatus);

//Search tasks by name
router.get('/search', validateTaskSearchByName, searchByName);

//Sort by dates
router.get('/sort', validateTaskSortedByDate, getTaskSortedByDate);

export default router;
