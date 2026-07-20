import { Router } from "express";
import modelUser from "../model/user.js";
const router = Router();
router.post("/login", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  modelUser
    .findOne({ username, password })
    .then((user) => {
      console.log("User found: ", user);
      if (user === null) {
        console.log("Username does not exist");
        res.status(401).json({
          message: "Invalid Username or Pasword",
        });
      } else {
        console.log("Login successful");
        res.status(200).json({
          message: "Login Succsesful",
          user: {
            username: user.username,
            id: user._id,
          },
        });
      }
    })
    .catch((err) => {
      console.error("Error: ", err);
      res.status(500).json({ message: "Server error during login" });
    });
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await modelUser.exists({ username });
    if (userExists) {
      return res.status(409).json({ message: "Username already used" });
    }
    const newUser = await modelUser.create({ username, password });
    res.status(201).json({
      message: "User created successfully",
      user: { username: newUser.username, id: newUser._id },
    });
  } catch (err) {
    console.error("Error in signup: ", err);
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
});
router.post("/verify", async (req, res) => {
  const { username, id } = req.body;
  modelUser.findById(id).then((user) => {
    if(!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    if (user.username === username) {
      res.status(200).json({ message: "Verified succesfully" });
    } else {
      res.status(401).json({ message: "Verification Unnauthorized" });
    }
  });
});
export default router;
