import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";

const JWT_SECRET = process.env.JWT_SECRET || "Sporton123";

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      res.status(400).json({ message: "Invalid Credentials. Email not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.hashed_pass);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid Credentials. Wrong password" });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signin Error: ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const initiateAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const count = await UserRepository.countUsers();
    if (count > 0) {
      res.status(400).json({
        message:
          "We can only have 1 admin user, if you want to create new admin user, please delete the user manually from the database",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await UserRepository.createUser(email, hashedPassword, name);

    res.status(201).json({ message: "Admin user created successfully!" });
  } catch (err) {
    console.error("Initiate new admin user error: ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
