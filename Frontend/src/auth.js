const toggleBtn = document.querySelector("#toggle-btn");
const submitBtn = document.querySelector("#submit-btn");
const form = document.querySelector("form");

let isLogin = true;

function setFormHandler(handler) {
  form.removeEventListener("submit", login);
  form.removeEventListener("submit", signup);
  form.addEventListener("submit", handler);
}

// Set initial handler
setFormHandler(login);

toggleBtn.addEventListener("click", (e) => {
  e.preventDefault();
  form.reset();
  if (isLogin) {
    console.log("Switching to signup form " + isLogin);
    toggleBtn.innerText = "Already have an account?";
    submitBtn.innerText = "Sign up";
    form.id = "signup-form";
    setFormHandler(signup);
  } else {
    console.log("Switching to login form");
    toggleBtn.innerText = "Don't have an account?";
    submitBtn.innerText = "Log in";
    form.id = "login-form";
    setFormHandler(login);
  }
  isLogin = !isLogin;
});

async function login(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await fetch("-production-6d17.up.railway.app/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: formData.get("username"),
      password: formData.get("password"),
    }),
  });
  const jsonRes = await res.json();
  //sending to local storage
  if (res.status === 200) {
    localStorage.setItem("user", JSON.stringify(jsonRes.user));
    window.location.href = "/index.html";
  } else {
    alert(jsonRes.message);
  }
}
async function signup(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await fetch("https://chat-app-production-6d17.up.railway.app/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: formData.get("username"),
      password: formData.get("password"),
    }),
  });
  const jsonRes = await res.json();
  console.log(jsonRes);
  if (res.status === 201) {
    localStorage.setItem("user", JSON.stringify(jsonRes.user));
    window.location.href = "/index.html";
  } else {
    alert(jsonRes.message);
  }
}

window.addEventListener("load", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    return;
  }
  const res = await fetch("https://chat-app-production-6d17.up.railway.app/auth/verify", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const jsonRes = await res.json();
  if (res.status === 200) {
    console.log("Verified succsesfully");
    window.location.href = "/index.html";
  }
  console.log(jsonRes);
});
