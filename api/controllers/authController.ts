import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from "../prisma/client";
import { validationResult } from 'express-validator';

export const registerController = async (req: Request, res: Response) => {
  // console.log("Request body:", req.body);

  const { username, email, password, role } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      errors: firstError,
    });
  } else {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ errors: "Email atau username sudah digunakan" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role,
        },
      });

      return res.status(201).json({ message: 'User created', user });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  // identifier = username atau email

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ]
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid password' });

    // console.log('JWT_SECRET:', process.env.JWT_SECRET);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.cookie('cookiesSebatik', token, {
      domain: "localhost",
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.status(200).json({
      message: 'Login sukses!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Terjadi kesalahan server saat login." });
  }
};