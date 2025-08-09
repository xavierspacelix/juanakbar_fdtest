import prisma from "../config/prisma";

export const getUsers = async ({
  isVerified,
  search,
}: {
  isVerified?: boolean;
  search?: string;
}) => {
  const where: any = {};

  if (isVerified !== undefined) {
    where.emailVerified = isVerified ? { not: null } : null;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
    },
  });

  return users;
};
