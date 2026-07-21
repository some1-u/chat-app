import "./style.css";
import { io } from "socket.io-client";
const socket = io("https://chat-app-production-6d17.up.railway.app");
let user;
let currentRoom = null;

socket.on("connect", () => {
  if (user) {
    socket.emit("register-user", user.id);
  }
});
const form = document.querySelector(".message-form");
const input = document.querySelector("#message-input");
const messageContainer = document.querySelector("#message-container");
const chatlist = document.querySelector(".chat-list");
const friendForm = document.querySelector("#add-friend");
const chatHeader = document.querySelector(".chat-header");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!localStorage.getItem("user")) {
    window.location.href = "/auth.html";
    return;
  }
  if (!currentRoom) {
    alert("Select a friend to chat with");
    return;
  }
  const formData = new FormData(e.target);
  for (const [key, value] of formData) {
    if (value) {
      socket.emit("private-message", currentRoom, value, user.username);
      input.value = "";
      showMessage(value, user.username);
    }
  }
});

socket.on("recieve-private-message", (room, message, userId) => {
  if (room === currentRoom) {
    showMessage(message, userId);
  }
});

function showMessage(message, id) {
  const isMyMessage = user && user.username === id;
  const newMessage = document.createElement("span");
  const authorId = document.createElement("span");
  const messageHolder = document.createElement("div");
  messageHolder.classList.add("message-holder");
  newMessage.innerText = message;
  newMessage.classList.add(isMyMessage ? "my-message" : "message");
  authorId.innerText = id + ": ";
  authorId.classList.add("author-name");
  messageHolder.appendChild(authorId);
  messageHolder.appendChild(newMessage);
  messageContainer.appendChild(messageHolder);
}

function generateRoomName(userId1, userId2) {
  return [userId1, userId2].sort().join("_");
}

function joinPrivateChat(friendId, friendUsername) {
  if (currentRoom) {
    socket.emit("leave-room", currentRoom);
  }
  currentRoom = generateRoomName(user.id, friendId);
  socket.emit("join-room", currentRoom);
  messageContainer.innerHTML = "";
  chatHeader.innerText = "Chatting with " + friendUsername;
  chatHeader.style.display = "block";
}
window.addEventListener("load", async () => {
  user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    console.log("No user found, redirecting to auth page");
    window.location.href = "/auth.html";
    return;
  }
  socket.emit("register-user", user.id);

  populateFriendList(user.id);
  populateFriendReqList(user.id);

  const res = await fetch("https://chat-app-production-6d17.up.railway.app/auth/verify", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const jsonRes = await res.json();
  console.log(jsonRes);
  if (res.status === 401) {
    console.log("Unnauthoried Verification");
    window.location.href = "/auth.html";
  } else {
    const loginBtn = document.querySelector(".log-in");
    loginBtn.innerText = "Log out";
    loginBtn.classList.add("logout");
    loginBtn.addEventListener("click", () => {
      localStorage.clear();
      user = null;
      window.location.href = "/auth.html";
    });
  }
});
friendForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  for (const [key, value] of formData) {
    console.log(value + "hi");
    const userDetails = JSON.parse(localStorage.getItem("user"));
    if (value) {
      const jsonBody = JSON.stringify({
        friend: value,
        userId: userDetails.id,
      });
      console.log(jsonBody);
      const res = await fetch("https://chat-app-production-6d17.up.railway.app/user/friend", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: jsonBody,
      });
      const jsonres = await res.json();
      console.log(jsonres);
      if (res.status === 400) {
        alert(jsonres.message);
      }
      friendForm.reset();
    }
  }
});
async function populateFriendList(id) {
  chatlist.innerHTML = "";
  const res = await fetch("https://chat-app-production-6d17.up.railway.app/user/friend?userId=" + id);
  const jsonres = await res.json();
  if (res.status === 200) {
    jsonres.data.map((friend) => {
      const li = document.createElement("li");
      const friendId = friend.user[0]._id;
      const friendUsername = friend.user[0].username;
      li.innerText = friendUsername;
      li.classList.add("chat-list-item");
      li.dataset.friendId = friendId;
      li.addEventListener("click", () => {
        document.querySelectorAll(".chat-list-item").forEach((el) =>
          el.classList.remove("active-chat")
        );
        li.classList.add("active-chat");
        joinPrivateChat(friendId, friendUsername);
      });
      chatlist.appendChild(li);
    });
  }
}

async function populateFriendReqList(id) {
  const friendReqList = document.querySelector(".friend-request");
  friendReqList.innerHTML = "";
  const res = await fetch(
    "https://chat-app-production-6d17.up.railway.app/user/friend-request?userId=" + id
  );
  const jsonres = await res.json();
  if (res.status === 200) {
    jsonres.data.map((friendRequest) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      const accept = document.createElement("button");
      const decline = document.createElement("button");
      li.classList.add("friend-request-item");
      accept.addEventListener("click", async (e) => {
        e.preventDefault();
        const res = await fetch(`https://chat-app-production-6d17.up.railway.app/user/friend-request`, {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            user1: friendRequest.user1._id,
            user2: friendRequest.user2._id,
          }),
        });
        if (res.status === 200) {
          li.style.display = "none";
          populateFriendList(user.id);
        }
      });
      decline.addEventListener("click", async (e) => {
        e.preventDefault();
        const res = await fetch(`https://chat-app-production-6d17.up.railway.app/user/friend-request`, {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            user1: friendRequest.user1._id,
            user2: friendRequest.user2._id,
          }),
        });
        if (res.status === 200) {
          li.style.display = "none";
        }
      });
      span.innerText = friendRequest.user1.username;
      accept.innerText = "✅";
      decline.innerText = "❌";
      li.classList.add("friend-request-item");
      li.append(span, accept, decline);
      friendReqList.appendChild(li);
    });
  }
}