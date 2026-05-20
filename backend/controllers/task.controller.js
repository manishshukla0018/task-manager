import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, projectId, assigneeId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only Admin or members of the project can create tasks
    const isMember = project.members.includes(req.user._id);
    const isAdmin = project.adminId.toString() === req.user._id.toString() || req.user.role === 'Admin';

    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
    }

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      projectId,
      assigneeId: assigneeId || null,
      createdBy: req.user._id,
    });

    const createdTask = await task.save();
    
    const populatedTask = await Task.findById(createdTask._id)
      .populate('assigneeId', 'name email')
      .populate('projectId', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks (with filtering)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { projectId, status, assigneeId, isOverdue } = req.query;

    let query = {};

    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (assigneeId) query.assigneeId = assigneeId;
    if (isOverdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'Done' };
    }

    // If not admin, restrict to tasks in projects they are part of
    if (req.user.role !== 'Admin') {
       const userProjects = await Project.find({ members: req.user._id }).select('_id');
       const projectIds = userProjects.map(p => p._id.toString());
       
       if (query.projectId) {
         if (!projectIds.includes(query.projectId.toString())) {
           return res.json([]); // Return empty if they request a project they aren't part of
         }
       } else {
         query.projectId = { $in: userProjects.map(p => p._id) };
       }
    }

    const tasks = await Task.find(query)
      .populate('assigneeId', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization: Admin or Assigned User
    if (req.user.role !== 'Admin' && (!task.assigneeId || task.assigneeId.toString() !== req.user._id.toString())) {
       return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(req.params.id)
      .populate('assigneeId', 'name email')
      .populate('projectId', 'name');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only Admin can delete tasks
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
