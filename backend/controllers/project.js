import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjectsForUser = async (req, res) => {
  const { user } = req;

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { managedById: user.id },
          { members: { some: { id: user.id } } }
        ]
      },
      include: {
        managedBy: true,
        members: true,
      },
    });

    res.status(200).json(projects);
  } catch (err) {
    console.error('Error in getProjectsForUser:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        caseStudy: true,
        projectStatutes: true,
        managedBy: true,
        members: true,
        tasks: {
          include: {
            assignee: true,
            approvers: true,
            informed: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectWithManagerAsMember = {
      ...project,
      members: [...project.members, project.managedBy]
    };

    res.json(projectWithManagerAsMember);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProject = async (req, res) => {
  const { name, description } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        managedBy: {
          connect: { id: req.user.id }
        },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, caseStudy, projectStatutes, ramMatrix, members, managedById } = req.body;

  try {
    const updateData = {};

    if (name) {
      updateData.name = name;
    }

    if (description) {
      updateData.description = description;
    }

    if (caseStudy) {
      updateData.caseStudy = {
        upsert: {
          create: caseStudy,
          update: caseStudy,
        },
      };
    }

    if (projectStatutes) {
      updateData.projectStatutes = {
        upsert: {
          create: projectStatutes,
          update: projectStatutes,
        },
      };
    }

    if (ramMatrix) {
      const tasks = await prisma.task.findMany({
        where: { projectId: parseInt(id) },
      });

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const row = ramMatrix[i];

        const assigneeIndex = row.indexOf('O');
        if (assigneeIndex !== -1) {
          const assigneeId = members[assigneeIndex - 1]?.id;
          if (assigneeId) {
            await prisma.task.update({
              where: { id: task.id },
              data: { assigneeId },
            });
          }
        }

        const approvers = row.reduce((acc, cell, index) => {
          if (cell === 'Z') {
            const memberId = members[index - 1]?.id;
            if (memberId) {
              acc.push({ id: memberId });
            }
          }
          return acc;
        }, []);

        const informed = row.reduce((acc, cell, index) => {
          if (cell === 'P') {
            const memberId = members[index - 1]?.id;
            if (memberId) {
              acc.push({ id: memberId });
            }
          }
          return acc;
        }, []);

        await prisma.task.update({
          where: { id: task.id },
          data: {
            approvers: {
              set: approvers,
            },
            informed: {
              set: informed,
            },
          },
        });
      }

      updateData.ramMatrix = ramMatrix;
    }

    if (managedById) {
      updateData.managedById = managedById;
    }

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Failed to update project', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: { members: true },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

export const inviteUsers = async (req, res) => {
  const { id } = req.params;
  const { usernames } = req.body;

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: { managedBy: true },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const inviterUsername = req.user.username;
    const projectName = project.name;

    const users = await prisma.user.findMany({
      where: {
        username: {
          in: usernames,
        },
      },
    });

    const usersToInvite = users.filter(user => user.id !== req.user.id);

    const invitations = usersToInvite.map(user => ({
      projectId: parseInt(id),
      userId: user.id,
      invitedBy: req.user.id,
    }));

    const createdInvitations = await prisma.projectInvitation.createMany({
      data: invitations,
    });

    const createdInvitationsData = await prisma.projectInvitation.findMany({
      where: {
        projectId: parseInt(id),
        userId: { in: usersToInvite.map(user => user.id) },
      },
    });

    const notifications = usersToInvite.map(user => {
      const invitation = createdInvitationsData.find(inv => inv.userId === user.id);
      return {
        userId: user.id,
        projectId: parseInt(id),
        content: `${inviterUsername} invited you to join the project "${projectName}".`,
        projectInvitationId: invitation ? invitation.id : null,
      };
    });

    await prisma.notification.createMany({
      data: notifications,
    });

    res.status(200).json({ message: 'Invitations and notifications sent' });
  } catch (error) {
    console.error('Failed to invite users', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const respondToInvitation = async (req, res) => {
  const { id } = req.params;
  const { response } = req.body;

  try {
    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: parseInt(id) },
      include: { project: true, user: true },
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (response === 'accept') {
      await prisma.project.update({
        where: { id: invitation.projectId },
        data: {
          members: {
            connect: { id: invitation.userId },
          },
        },
      });

      await prisma.notification.create({
        data: {
          userId: invitation.project.managedById,
          content: `${invitation.user.username} has joined to the project "${invitation.project.name}".`,
        },
      });
    }

    await prisma.projectInvitation.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: `Invitation ${response}ed` });
  } catch (error) {
    console.error(`Failed to respond to invitation: ${error}`);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInvitationById = async (req, res) => {
  const { id } = req.params;

  try {
    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: parseInt(id) },
      include: { project: true, user: true },
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    res.status(200).json(invitation);
  } catch (error) {
    console.error('Failed to fetch invitation', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTasksForProject = async (req, res) => {
  const { id } = req.params;

  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: parseInt(id) },
      include: { assignee: true, approvers: true, informed: true },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTask = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: { members: true },
    });

    const task = await prisma.task.create({
      data: {
        name,
        projectId: parseInt(id),
        assigneeId: req.user.id,
        status: 'To Do',
        informed: {
          connect: project.members.filter(member => member.id !== req.user.id).map(member => ({ id: member.id })),
        },
      },
      include: {
        assignee: true,
        informed: true,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Failed to create task', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTaskById = async (req, res) => {
  const { projectId, taskId } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: { assignee: true, project: { include: { members: true, managedBy: true } } },
    });

    if (!task || task.projectId !== parseInt(projectId)) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const projectWithManagerAsMember = {
      ...task.project,
      members: [...task.project.members, task.project.managedBy]
    };

    res.status(200).json({ ...task, project: projectWithManagerAsMember });
  } catch (error) {
    console.error('Failed to fetch task', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  const { name, status, assigneeId, priority, description, approvers, informed } = req.body;

  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: { project: true },
    });

    if (!task || task.projectId !== parseInt(projectId)) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: {
        name: name || task.name,
        status: status || task.status,
        assigneeId: assigneeId !== undefined ? parseInt(assigneeId, 10) : task.assigneeId,
        priority: priority !== undefined ? priority : task.priority,
        description: description !== undefined ? description : task.description,
        lastChange: new Date(),
        approvers: {
          set: approvers ? approvers.map(id => ({ id: parseInt(id) })) : [],
        },
        informed: {
          set: informed ? informed.map(id => ({ id: parseInt(id) })) : [],
        },
      },
      include: { assignee: true, project: { include: { members: true, managedBy: true } } },
    });

    const projectWithManagerAsMember = {
      ...updatedTask.project,
      members: [...updatedTask.project.members, updatedTask.project.managedBy]
    };

    res.status(200).json({ ...updatedTask, project: projectWithManagerAsMember });
  } catch (error) {
    console.error('Failed to update task', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req, res) => {
  const { projectId, taskId } = req.params;

  try {
    await prisma.task.delete({
      where: { id: parseInt(taskId) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete task', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};