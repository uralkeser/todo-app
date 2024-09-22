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

//Create a task
router.post('/', createTask);

//Get all tasks
router.get('/', getAllTasks);

//Update a task
router.patch('/:id', updateTask);

//Delete a task
router.delete('/:id', deleteTask);

//Mark a task as to-do/done
router.patch('/status/:id', markTaskByStatus);

//Filter tasks by status
router.get('/filter', filterByStatus);

//Search tasks by name
router.get('/search', searchByName);

//Sort by dates
router.get('/sort', getTaskSortedByDate);

export default router;
