import { ObjectId } from 'mongodb';

//Validation for required fields
const validateFields = (name, startDate, dueDate) => {
  if (!name || !startDate || !dueDate) {
    throw new Error('Project name, start date, and due date are required');
  }
};

//Date format validation
const validateDateFormat = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(date)) {
    throw new Error('Date format must be YYYY-MM-DD');
  }
};

//Check if startDate is before dueDate
const validateStartDate = (startDate, dueDate) => {
  if (new Date(startDate) > new Date(dueDate)) {
    throw new Error('Start date cannot be later than due date');
  }
};

//Check if the provided project ID is valid
const validateId = (id) => {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid project ID format');
  }
};

//Check name field
const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('project name is not valid');
  }
};

//Check if updateData has fields
const validateUpdateData = (updateData) => {
  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields provided for update.');
  }
};

//Check the sortBy query parameter
const validateSortParameters = (sortBy, order) => {
  if (!['startDate', 'dueDate'].includes(sortBy)) {
    throw new Error('Invalid date type. Use startDate or dueDate.');
  }

  if (order && !['asc', 'desc'].includes(order)) {
    throw new Error('Invalid order. Use asc or desc.');
  }
};

export const validateProjectCreation = (req, res, next) => {
  const { name, startDate, dueDate } = req.body;
  try {
    validateFields(name, startDate, dueDate);
    validateDateFormat(startDate, dueDate);
    validateStartDate(startDate, dueDate);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

export const validateProjectEdition = (req, res, next) => {
  const projectId = req.params.id;
  const { name, startDate, dueDate } = req.body;
  // Build the update object
  const updateData = {};

  try {
    validateId(projectId);

    if (name) {
      validateName(name);
      updateData.name = name;
    }

    if (startDate) {
      validateDateFormat(startDate);
      updateData.startDate = startDate;
    }

    if (dueDate) {
      validateDateFormat(dueDate);
      updateData.dueDate = dueDate;
    }

    validateUpdateData(updateData);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  //pass updateData to controller
  req.updateData = updateData;
  next();
};

export const validateProjectDeletion = (req, res, next) => {
  const projectId = req.params.id;

  try {
    validateId(projectId);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

export const validateTaskAssign = (req, res, next) => {
  const { taskId, projectId } = req.body;

  try {
    validateId(projectId);
    validateId(taskId);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

export const validateFilterTasksByProjectName = (req, res, next) => {
  const { projectName } = req.query;

  try {
    validateName(projectName);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

export const validateProjectSortedByDate = (req, res, next) => {
  const { sortBy, order } = req.query;

  try {
    validateSortParameters(sortBy, order);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};
