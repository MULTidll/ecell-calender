import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(token: string) {
  if (!JWT_SECRET) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && (decoded as any).isAdmin === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const valid = verifyToken(token);
  return NextResponse.json({ valid });
}
