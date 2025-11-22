import { serialize, parse } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';

const TOKEN_NAME = 'sudoku_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionData {
  userId: string;
  isGuest: boolean;
}

export function setSessionCookie(res: NextApiResponse, sessionData: SessionData) {
  const cookie = serialize(TOKEN_NAME, JSON.stringify(sessionData), {
    maxAge: MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function getSessionFromCookie(req: NextApiRequest): SessionData | null {
  const cookies = parse(req.headers.cookie || '');
  const sessionCookie = cookies[TOKEN_NAME];

  if (!sessionCookie) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie);
  } catch {
    return null;
  }
}

export function clearSessionCookie(res: NextApiResponse) {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}
