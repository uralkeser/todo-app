import { mongoConnection } from '../config/mongoConfig.js';
import { ObjectId } from 'mongodb';

const db = await mongoConnection();
const taskCollection = db.collection('tasks');

export const createTask = async (req, res) => {
  const { status, name, startDate, dueDate, doneDate } = req.body;

  //Check by name provided if task exists
  const possibleTask = await taskCollection.find({ name: name }).toArray();
  if (possibleTask.length !== 0) {
    return res
      .status(400)
      .json({ message: 'Another task exists having same name' });
  }

  try {
    const result = await taskCollection.insertOne(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const getAllTasks = async (req, res) => {
  try {
    //Check any tasks exist
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
    const updateData = req.updateData;
    const taskId = req.params.id;

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

    return res.status(200).json({ message: 'Task updated successfully.' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTask = async (req, res) => {
  const taskId = req.params.id;

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
      return res.status(404).json({
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

  try {
    const tasks = await taskCollection
      .find({ name: { $regex: new RegExp(name, 'i') } }) // regex for better search results
      .toArray();

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found by given name.' });
    } else {
      return res.status(200).json(tasks);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const getTaskSortedByDate = async (req, res) => {
  const { sortBy, order } = req.query;

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
