import { model, Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    minLength: [4, "Username too small"],
    maxLength: [10, "Username too long"],
  },
  password: { type: String, minLength: [4, "Pasword is too small"] },
});
const User = model("User", userSchema);
export default User;
