import { model, Schema } from "mongoose";

const friendSchema = new Schema({
    user1:{
        type:Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    user2:{
        type:Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isAcceptted: {
        type: Boolean,
        required: true,
        default: false
    }
},{
    timestamps:true
});
const Friend = model("Friend", friendSchema);
export default Friend;
