import prisma from "../config/prisma";

interface GetUsersParams {
  isVerified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const getUsersService = async ({
  isVerified,
  search,
  page = 1,
  limit = 10,
}: GetUsersParams) => {
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

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        avatar: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    pageCount: Math.ceil(total / limit),
  };
};
