import { mongoConnection } from '../config/mongoConfig.js';
import { ObjectId } from 'mongodb';

const db = await mongoConnection();
const projectCollection = db.collection('projects');
const taskCollection = db.collection('tasks');

export const createProject = async (req, res) => {
  const { name, startDate, dueDate } = req.body;

  // Check if a project with the same name already exists
  const existingProject = await projectCollection.findOne({ name: name });
  if (existingProject) {
    return res.status(400).json({
      message: 'A project with the same name already exists',
    });
  }

  try {
    const newProject = {
      name,
      startDate,
      dueDate,
      tasks: [], // Initialize with an empty task array
    };

    const result = await projectCollection.insertOne(newProject);

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await projectCollection.find({}).toArray();

    if (projects.length === 0) {
      return res.status(404).json({ message: 'No projects found' });
    }

    return res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const updateData = req.updateData;

    // Update the project in the database
    const result = await projectCollection.updateOne(
      { _id: ObjectId.createFromHexString(projectId) },
      { $set: updateData }
    );

    // Check if the project was found and updated
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: `Project not found with ID: ${projectId}` });
    }

    return res.status(200).json({ message: 'Project updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    //Attempt to delete the project from the database
    const result = await projectCollection.deleteOne({
      _id: ObjectId.createFromHexString(projectId),
    });

    //If no project was found to delete
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: `Project not found with ID: ${projectId}` });
    }

    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const assignTaskToProject = async (req, res) => {
  try {
    const { taskId, projectId } = req.body;

    // Check if the task exists
    const task = await taskCollection.findOne({
      _id: ObjectId.createFromHexString(taskId),
    });
    if (!task) {
      return res
        .status(404)
        .json({ message: `Task not found with ID: ${taskId}` });
    }

    // Check if the project exists
    const project = await projectCollection.findOne({
      _id: ObjectId.createFromHexString(projectId),
    });
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project not found with ID: ${projectId}` });
    }

    // Update the task to assign it to the project
    const result = await projectCollection.updateOne(
      { _id: ObjectId.createFromHexString(projectId) },
      { $addToSet: { tasks: task._id } }
    );

    // If no task was updated, return an error
    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: `Failed to assign task with ID: ${taskId} to project`,
      });
    }

    return res
      .status(200)
      .json({ message: `Task assigned to project successfully` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const filterTasksByProjectName = async (req, res) => {
  try {
    const { projectName } = req.query;

    // Find the project by name
    const project = await projectCollection.findOne({ name: projectName });

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project not found with name: ${projectName}` });
    }

    // Find tasks that belong to the project
    const { tasks } = project;

    // Return tasks or message if none found
    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ message: `No tasks found for project: ${projectName}` });
    }

    return res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProjectSortedByDate = async (req, res) => {
  try {
    const { sortBy, order } = req.query;
    const sortOrder = order === 'asc' ? 1 : -1; //default descending order

    // Fetch and sort projects by date
    const projects = await projectCollection
      .find()
      .sort({ [sortBy]: sortOrder })
      .toArray();

    return res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
