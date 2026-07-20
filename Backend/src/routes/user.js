import { Router } from "express";
import modelUser from "../model/user.js";
import Friend from "../model/friends.js";
import mongoose from "mongoose";
const router = Router();
router.post("/friend", async (req, res) => {
  console.log(req.body);
  console.log("friend added");
  const { friend, userId } = req.body;
  const user = await modelUser.findOne({ username: friend });
  if (!user) {
    return res.status(400).json({
      message: "Couldn't find username",
    });
  }
  const friendReq = await Friend.findOne({
    user1: userId,
    user2: user._id,
  });
  if (friendReq) {
    return res.status(400).json({ message: "Request already sent" });
  }
  await Friend.create({
    user1: userId,
    user2: user._id,
  });
  return res.status(201).json({
    message: "Friend added succsesfully",
  });
});
router.get("/friend-request", async (req, res) => {
  const { userId } = req.query;
  const friends = await Friend.find({
    user2: userId,
    isAcceptted: false,
  })
    .populate("user1")
    .populate("user2");
  return res.status(200).json({
    data: friends,
    message: "Get friend succsesfully",
  });
});
router.patch("/friend-request", async (req, res) => {
  const { user1, user2 } = req.body;
  const friendReq = await Friend.findOneAndUpdate(
    { user1, user2, isAcceptted: false },
    { isAcceptted: true },
    { new: true }
  );
  if (friendReq) {
    return res.status(200).json({ message: "Friend request accepted" });
  } else {
    return res.status(404).json({ message: "Request doesn't exist" });
  }
});
router.delete("/friend-request", async (req, res) => {
  const { user1, user2 } = req.body;
  const friendReq = await Friend.findOneAndDelete({
    user1,
    user2,
    isAcceptted: false,
  });
  if (friendReq) {
    return res.status(200).json({ message: "Friend request declined" });
  }
  return res.status(400).json({ message: "Unable to decline friend request" });
});
router.get("/friend", async (req, res) => {
  const { userId } = req.query;
  const userObjectId = new mongoose.Types.ObjectId(userId)
  const friends = await Friend.aggregate([
    {
      $match: {
        $or: [{ user1: userObjectId }, { user2: userObjectId }],
        isAcceptted: true,
      },
    },
    {
      $project:{
        user:{
          $cond :[
            {$ne:[
              "$user1",userObjectId
            ]},
            "$user1","$user2"
          ]
        }
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
  ]);
  // const friends = await Friend.find({
  //   $or: [{ user1: userId }, { user2: userId }],
  //   isAcceptted: true,
  // })
  //   .populate("user1")
  //   .populate("user2");
  return res.status(200).json({
    data: friends,
    message: "Get friend succsesfully",
  });
});
export default router;
