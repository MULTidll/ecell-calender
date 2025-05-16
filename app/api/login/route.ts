import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '2h'; // 2 hours

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (
    username === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD &&
    JWT_SECRET
  ) {
    const token = jwt.sign({ username, isAdmin: true }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });
    const response = NextResponse.json({ success: true });
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 2, // 2 hours
    });
    return response;
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
