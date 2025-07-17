import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
console.log('📦 PrismaClient instance created');


export default prisma;