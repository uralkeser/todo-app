import { mongoConnection } from '../config/mongoConfig.js';
const db = await mongoConnection();
const projectCollection = db.collection('projects');
const taskCollection = db.collection('tasks');

const bonus1 = async () => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  const res = await projectCollection
    .aggregate([
      {
        $lookup: {
          from: 'tasks', // The collection to join
          localField: 'tasks', // Field from the local collection
          foreignField: '_id', // Field from the other collection
          as: 'DueDateTask', // Output array field for matched tasks
        },
      },
      { $unwind: '$DueDateTask' }, // Flatten the orders array
      {
        $match: {
          'DueDateTask.dueDate': todayString, // Filter by item
        },
      },
    ])
    .toArray();
  console.log('bonus1: ', res);
};

const bonus2 = async () => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  const res = await taskCollection
    .aggregate([
      {
        $lookup: {
          from: 'projects', // The collection to join
          localField: '_id', // Field from the local collection
          foreignField: 'tasks', // Field from the other collection
          as: 'DueDateProjects', // Output array field for matched projects
        },
      },
      { $unwind: '$DueDateProjects' }, // Flatten the orders array
      {
        $match: {
          'DueDateProjects.dueDate': todayString, // Filter by item
        },
      },
    ])
    .toArray();
  console.log('bonus2: ', res);
};

bonus1();
bonus2();
setTimeout(() => {
  process.exit(0);
}, 10000);
