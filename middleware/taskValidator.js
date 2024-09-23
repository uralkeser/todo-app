import { ObjectId } from 'mongodb';

//Check necessary fields existence for the request
const validateFields = (status, name, startDate, dueDate) => {
  if (!status || !name || !startDate || !dueDate) {
    throw new Error('status, name, start date, due date are required');
  }
};

//Check name field
const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    throw new Error('task name is not valid');
  }
};

//Check if status is to-do or done
const validateStatus = (status) => {
  if (!status || !['to-do', 'done'].includes(status)) {
    throw new Error('status must be done or to-do');
  }
};

//Check if done task have done date
const validateDoneTask = (status, doneDate) => {
  if (status === 'done' && !doneDate) {
    throw new Error('done task must have done date');
  }
};

//Check if to-do task have done date
const validateTodoTask = (status, doneDate) => {
  if (status === 'to-do' && doneDate) {
    throw new Error('to-do task must not have done date');
  }
};

//Check if given date in YYYY-DD-MM format
const validateDateFormat = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(date)) {
    throw new Error('date format must be YYYY-DD-MM');
  }
};

//Check if all dates in YYYY-DD-MM format
const validateAllDateFormat = (startDate, dueDate, doneDate) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(startDate) || !dateRegex.test(dueDate)) {
    throw new Error('date format must be YYYY-DD-MM');
  }
  if (doneDate && !dateRegex.test(doneDate)) {
    throw new Error('date format must be YYYY-DD-MM');
  }
};

//Check if start date later than due date or done date
const validateStartDate = (startDate, dueDate, doneDate) => {
  if (
    new Date(startDate) > new Date(dueDate) ||
    (doneDate && new Date(startDate) > new Date(doneDate))
  ) {
    throw new Error('Start date cannot be later than due date or done date');
  }
};

//Check if start date later than due date or done date
const validateTaskId = (taskId) => {
  if (!ObjectId.isValid(taskId)) {
    throw new Error('Invalid task Id format');
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
  const validSortFields = ['startDate', 'dueDate', 'doneDate'];
  if (!sortBy || !validSortFields.includes(sortBy)) {
    throw new Error(
      `Invalid or missing sort field. Must be one of: ${validSortFields.join(
        ','
      )}`
    );
  }

  if (order && !['asc', 'desc'].includes(order)) {
    throw new Error('Invalid order. Use asc or desc.');
  }
};

export const validateTaskCreation = (req, res, next) => {
  const { status, name, startDate, dueDate, doneDate } = req.body;
  try {
    validateFields(status, name, startDate, dueDate);
    validateStatus(status);
    validateDoneTask(status, doneDate);
    validateTodoTask(status, doneDate);
    validateAllDateFormat(startDate, dueDate, doneDate);
    validateStartDate(startDate, dueDate, doneDate);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

export const validateTaskEdition = (req, res, next) => {
  const { status, name, startDate, dueDate, doneDate } = req.body;
  const taskId = req.params.id;

  // Build the update object
  const updateData = {};

  try {
    validateTaskId(taskId);

    if (name) {
      validateName(name);
      updateData.name = name;
    }

    if (status) {
      validateStatus(status);
      updateData.status = status;
    }

    if (startDate) {
      validateDateFormat(startDate);
      updateData.startDate = startDate;
    }

    if (dueDate) {
      validateDateFormat(dueDate);
      updateData.dueDate = dueDate;
    }

    if (doneDate) {
      validateDateFormat(doneDate);
      updateData.doneDate = doneDate;
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

export const validateTaskDeletion = (req, res, next) => {
  const taskId = req.params.id;

  try {
    validateTaskId(taskId);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

export const validateTaskMarkingByStatus = (req, res, next) => {
  const taskId = req.params.id;
  const { status } = req.body;

  try {
    validateTaskId(taskId);
    validateStatus(status);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

export const validateTaskFilterByStatus = (req, res, next) => {
  const { status } = req.query;
  try {
    validateStatus(status);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

export const validateTaskSearchByName = (req, res, next) => {
  let { name } = req.query;
  name = name.trim(); // trim for white space control
  try {
    validateName(name);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

export const validateTaskSortedByDate = (req, res, next) => {
  const { sortBy, order } = req.query;

  try {
    validateSortParameters(sortBy, order);
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};
