import { prisma } from './db';
import { User, UserSettings } from '@prisma/client';

export interface AuthenticatedUserContext {
  user: User;
  settings: UserSettings;
}

export async function getAuthenticatedUserContext(req: Request): Promise<AuthenticatedUserContext | null> {
  // Check Authorization Header: "Bearer <token>" or default session user
  const authHeader = req.headers.get('Authorization');
  let email = 'alex.johnson@example.com';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.includes('@')) {
      email = token;
    }
  }

  // Find or seed default authenticated user in SQLite DB
  let user = await prisma.user.findUnique({
    where: { email },
    include: { settings: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Alex Johnson',
        settings: {
          create: {
            maxSingleItemLimit: 500.0,
            monthlySpendLimit: 2500.0,
            monthlySpent: 649.99,
            requireApprovalOver: 200.0,
            autoBuyEnabled: true,
          },
        },
      },
      include: { settings: true },
    });
  }

  if (!user.settings) {
    const settings = await prisma.userSettings.create({
      data: {
        userId: user.id,
        maxSingleItemLimit: 500.0,
        monthlySpendLimit: 2500.0,
        monthlySpent: 649.99,
        requireApprovalOver: 200.0,
        autoBuyEnabled: true,
      },
    });
    return { user, settings };
  }

  return { user, settings: user.settings };
}
