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
              caseStudy: true, // Include the caseStudy relation
              projectStatutes: true, // Include the projectStatutes relation
              managedBy: true,
              members: true
          }
      });

      if (!project) {
          return res.status(404).json({ message: 'Project not found' });
      }

      res.json(project);
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const newProject = await prisma.project.create({
        data: {
            name,
            description,
            managedBy: {
                connect: { id: req.user.id } // Łączymy projekt z użytkownikiem tworzącym go
            },
        },
        include: {
            managedBy: true, // Zwracamy również dane o kierowniku projektu
        },
    });

    res.status(201).json(newProject);
  } catch (error) {
      res.status(500).json({ message: 'Failed to create project', error });
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