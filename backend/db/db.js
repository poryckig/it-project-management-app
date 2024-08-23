import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const checkConnectionToDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed');
    console.log(error.message);
  }
};

export { checkConnectionToDB };