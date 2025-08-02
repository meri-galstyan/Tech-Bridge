// 🔄 Toggle between login and register forms
const container = document.getElementById("container");
const registerbtn = document.getElementById("register");
const loginbtn = document.getElementById("login");

registerbtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginbtn.addEventListener("click", () => {
  container.classList.remove("active");
});

// ✅ SIGNUP: Handle form submission
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;

    try {
      const res = await fetch("http://localhost:5050/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Account created successfully!");
        signupForm.reset();
        container.classList.remove("active"); // Switch to login view
      } else {
        alert(`❌ Signup failed: ${data.message}`);
      }
    } catch (err) {
      console.error("❌ Signup error:", err);
      alert("❌ Server error. Please try again later.");
    }
  });
}

// 🔐 LOGIN: Handle form submission
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    try {
      const res = await fetch("http://localhost:5050/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("🎉 Logged in successfully!");
        loginForm.reset();
        // Optional: redirect to dashboard or home
      } else {
        alert(`❌ Login failed: ${data.message}`);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      alert("❌ Server error. Please try again later.");
    }
  });
}
