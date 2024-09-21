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
        members: true
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Ensure the managedBy user is included in the members list
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
    console.error('Failed to create project', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { caseStudy, projectStatutes } = req.body;

  try {
    const updateData = {};

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
          userId: invitation.userId,
          content: `You have been invited to project ${invitation.project.name}`,
          projectId: invitation.projectId,
          projectInvitationId: invitation.id // Include the project invitation ID
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
