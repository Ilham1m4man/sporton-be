import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "Sporton123";

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid Credentials. Email not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid Credentials. Wrong password" });
      return;
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
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

    const count = await User.countDocuments({});
    if (count > 0) {
      res
        .status(400)
        .json({
          message:
            "We can only have 1 admin user, if you want to create new admin user, please delete the user manually from the database",
        });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    await newUser.save();

    res.status(201).json({ message: "Admin user created successfully!" });
  } catch (err) {
    console.error("Initiate new admin user error: ", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
