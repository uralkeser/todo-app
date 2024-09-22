import { mongoConnection } from '../config/mongoConfig.js';
import { ObjectId } from 'mongodb';

const db = await mongoConnection();
const taskCollection = db.collection('tasks');

export const createTask = async (req, res) => {
  const { status, name, startDate, dueDate, doneDate } = req.body;

  //Check necessary fields
  if (!status || !name || !startDate || !dueDate) {
    return res
      .status(400)
      .json({ message: 'status, name, start date, due date are required' });
  }

  //Check if status is to-do or done
  if (!['to-do', 'done'].includes(status)) {
    return res.status(400).json({ message: 'status must be done or to-do' });
  }

  //Date format validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(dueDate)) {
    return res.status(400).json({ message: 'date format must be YYYY-DD-MM' });
  }

  //Check if start date later than due date or done date
  if (
    new Date(startDate) > new Date(dueDate) ||
    (doneDate && new Date(startDate) > new Date(doneDate))
  ) {
    return res
      .status(400)
      .json({ message: 'Start date cannot be later than due date' });
  }

  //Check by name provided if task exists
  if (name) {
    const possibleTask = await taskCollection.find({ name: name }).toArray();
    if (possibleTask.length !== 0) {
      return res
        .status(400)
        .json({ message: 'Another task exists having given name' });
    }
  }

  try {
    const result = await taskCollection.insertOne(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskCollection.find().toArray();
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found.' });
    } else {
      return res.status(200).json(tasks);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const { name, status, startDate, dueDate, doneDate } = req.body;

    if (!ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task Id format' });
    }

    //Create the update object depending on given valid fields
    const updateData = {};
    if (name) {
      if (typeof name === 'string') {
        updateData.status = status;
      } else {
        return res.status(400).json({ message: 'task name must be a string' });
      }
      updateData.name = name;
    }

    if (status) {
      if (['to-do', 'done'].includes(status)) {
        updateData.status = status;
      } else {
        return res
          .status(400)
          .json({ message: 'status must be done or to-do' });
      }
    }

    //Date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate) {
      if (dateRegex.test(startDate)) {
        updateData.startDate = startDate;
      } else {
        return res
          .status(400)
          .json({ message: 'date format must be YYYY-DD-MM' });
      }
    }

    if (dueDate) {
      if (dateRegex.test(dueDate)) {
        updateData.dueDate = dueDate;
      } else {
        return res
          .status(400)
          .json({ message: 'date format must be YYYY-DD-MM' });
      }
    }

    if (doneDate) {
      if (dateRegex.test(doneDate)) {
        updateData.doneDate = doneDate;
      } else {
        return res
          .status(400)
          .json({ message: 'date format must be YYYY-DD-MM' });
      }
    }

    //Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid fields provided for update.' });
    }

    // Update the task in the database
    const result = await taskCollection.updateOne(
      { _id: ObjectId.createFromHexString(taskId) },
      { $set: updateData }
    );

    // Check if the task was found and updated
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: `Task not found belonging to given id: ${taskId}.` });
    }

    // return res.status(200).json(doc);
    return res.status(200).json({ message: 'Task updated successfully.' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTask = async (req, res) => {
  const taskId = req.params.id;

  if (!ObjectId.isValid(taskId)) {
    return res
      .status(400)
      .json({ message: 'Task id query parameter is invalid' });
  }
  try {
    const result = await taskCollection.deleteOne({
      _id: ObjectId.createFromHexString(taskId),
    });
    if (result.deletedCount === 0) {
      return res
        .status(400)
        .json({ message: `Task not found belonging to given id: ${taskId}.` });
    } else {
      return res.status(200).json({ message: 'Task deleted successfully.' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const markTaskByStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    //Validate status
    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    //Validate taskId
    if (!ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID format.' });
    }

    //Validate status field
    if (!['to-do', 'done'].includes(status)) {
      return res
        .status(400)
        .json({ message: 'Invalid status. Must be to-do or done.' });
    }

    // Fetch the current task from the database
    const currentTask = await taskCollection.findOne({
      _id: ObjectId.createFromHexString(taskId),
    });

    // Check if task exists
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // If the task already has the requested status, do nothing
    if (currentTask.status === status) {
      return res.status(200).json({
        message: `Task is already marked as ${status}. No changes has been made.`,
      });
    }

    const updateData = {}; //Create the update object depending on status
    const currentDate = new Date().toISOString().split('T')[0]; //Get current date in YYYY-MM-DD format

    if (status === 'to-do') {
      updateData.status = 'to-do';
      updateData.doneDate = null; //Reset doneDate when marked as to-do
      updateData.startDate = null; //Reset startDate when marked as to-do
    }

    if (status === 'done') {
      updateData.status = 'done';
      updateData.doneDate = currentDate; //Set the doneDate to the current date
      updateData.startDate = updateData.startDate || currentDate; //Ensure startDate exists
    }

    //Update the task in the database
    const result = await taskCollection.updateOne(
      { _id: ObjectId.createFromHexString(taskId) },
      { $set: updateData }
    );

    // Check if the task was found
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res
      .status(200)
      .json({ message: `Task marked as ${status} successfully.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const filterByStatus = async (req, res) => {
  const { status } = req.query;

  // Validate the status query parameter
  if (!status || !['to-do', 'done'].includes(status)) {
    return res.status(400).json({
      message: 'Invalid or missing status. Must be to-do or done.',
    });
  }

  try {
    const tasks = await taskCollection.find({ status }).toArray();
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found.' });
    } else {
      return res.status(200).json(tasks);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const searchByName = async (req, res) => {
  let { name } = req.query;
  name = name.trim(); // trim for white space control

  if (name) {
    try {
      const tasks = await taskCollection
        .find({ name: { $regex: new RegExp(name, 'i') } }) // regex for better search results
        .toArray();

      if (tasks.length === 0) {
        return res
          .status(404)
          .json({ message: 'No tasks found by given name.' });
      } else {
        return res.status(200).json(tasks);
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(400)
      .json({ message: 'Task name query parameter is required' });
  }
};

export const getTaskSortedByDate = async (req, res) => {
  const { sortBy, order } = req.query;

  // Validate the sortBy query parameter
  const validSortFields = ['startDate', 'dueDate', 'doneDate'];
  if (!sortBy || !validSortFields.includes(sortBy)) {
    return res.status(400).json({
      message: `Invalid or missing sort field. Must be one of: ${validSortFields.join(
        ', '
      )}.`,
    });
  }

  const sortOrder = order === 'asc' ? 1 : -1; //default descending order

  try {
    const tasks = await taskCollection
      .find()
      .sort({ [sortBy]: sortOrder })
      .toArray();
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found.' });
    }

    return res.status(200).json(tasks);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};
