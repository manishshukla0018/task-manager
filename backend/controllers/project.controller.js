import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const project = new Project({
      name,
      description,
      adminId: req.user._id,
      members: members || [req.user._id],
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    // If admin, they see projects they created or are part of. If member, projects they are part of.
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find({ $or: [{ adminId: req.user._id }, { members: req.user._id }] }).populate('members', 'name email');
    } else {
      projects = await Project.find({ members: req.user._id }).populate('members', 'name email');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email')
      .populate('adminId', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is part of project or is admin of project
    const isMember = project.members.some(member => member._id.toString() === req.user._id.toString());
    const isAdmin = project.adminId._id.toString() === req.user._id.toString();

    if (!isMember && !isAdmin && req.user.role !== 'Admin') {
       return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   PUT /api/projects/:id/members
// @access  Private/Admin
export const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.adminId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to modify this project' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    if (project.members.includes(userToAdd._id)) {
       return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    const updatedProject = await Project.findById(req.params.id).populate('members', 'name email');
    res.json(updatedProject);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
