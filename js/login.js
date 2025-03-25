// Authentication and Registration Script

// Constants and Configuration
const API_BASE_URL = "http://localhost:8080/newsl/api/v1/auth";
const LOCAL_STORAGE_PREFIX = "authTokenNewSL";

// Utility Functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password, confirmPassword) {
  const errors = [];

  if (!password) {
    errors.push("Password is required.");
  }

  if (password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  return errors;
}

function displayErrors(container, errors) {
  // Clear previous errors
  const existingErrors = container.querySelectorAll(".error-message");
  existingErrors.forEach((el) => el.remove());

  if (errors.length > 0) {
    const errorContainer = document.createElement("div");
    errorContainer.className = "error-message text-danger mb-3";
    errorContainer.innerHTML = errors.map((error) => `${error}<br>`).join("");
    container.insertBefore(errorContainer, container.firstChild);
  }
}

// Authentication Service
const AuthService = {
  login(email, password) {
    const payload = { email, password };

    return $.ajax({
      url: `${API_BASE_URL}/authenticate`,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
    });
  },

  requestOTP(email, username) {
    return $.ajax({
      url: `${API_BASE_URL}/otp?option=0&email=${email}&username=${username}`,
      type: "POST",
      processData: false,
      contentType: false,
    });
  },

  register(formData) {
    return $.ajax({
      url: `${API_BASE_URL}/register`,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
    });
  },
};

// UI Management
const UIManager = {
  showTab(tabId) {
    $(`#${tabId}`).tab("show");
  },

  setupProfilePicturePreview(inputId, previewId) {
    const profileInput = document.getElementById(inputId);
    const profilePreview = document.getElementById(previewId);

    if (profileInput && profilePreview) {
      profileInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function () {
            profilePreview.src = this.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  },

  setupOTPInputs(otpInputs) {
    otpInputs.forEach((input, index) => {
      input.addEventListener("keyup", function (e) {
        if (e.key >= 0 && e.key <= 9) {
          if (index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
          }
        } else if (e.key === "Backspace") {
          if (input.value === "" && index > 0) {
            otpInputs[index - 1].focus();
          }
        }
      });

      input.addEventListener("click", function () {
        this.select();
      });
    });
  },

  startOTPTimer(timerElement, resendActionElement, duration = 180) {
    let timer = duration;
    const interval = setInterval(function () {
      const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
      const seconds = String(timer % 60).padStart(2, "0");

      timerElement.textContent = `${minutes}:${seconds}`;

      if (--timer < 0) {
        clearInterval(interval);
        resendActionElement.style.display = "block";
      }
    }, 1000);
  },
};

// Event Listeners and Page Initialization
document.addEventListener("DOMContentLoaded", function () {
  // Login Form
  $("#login-form").on("submit", function (e) {
    e.preventDefault();
    const email = $("#login-email").val();
    const password = $("#login-password").val();
    const loginErrorElement = $("#login-error");

    AuthService.login(email, password)
      .done(function (response) {
        if (response.token) {
          $.cookie("username", response.username, { path: "/" });
          $.cookie(`${LOCAL_STORAGE_PREFIX}`, response.token, {
            path: "/",
            expires: 7,
          });
          window.location.href = "index.html";
        }
      })
      .fail(function () {
        loginErrorElement
          .text("Invalid email or password. Please try again.")
          .show();
      });
  });

  // Registration Form
  const registerForm = $("#register-form");
  const otpVerification = $("#otp-verification");
  const otpInputs = $(".otp-input");
  const timerElement = $("#timer");
  const resendActionElement = $(".resend-action");

  // Profile Picture Preview
  UIManager.setupProfilePicturePreview("profile-picture", "profile-preview");

  // OTP Input Setup
  UIManager.setupOTPInputs(otpInputs.toArray());

  registerForm.on("submit", function (e) {
    e.preventDefault();

    const username = $("#username").val().trim();
    const email = $("#email").val().trim();
    const password = $("#password").val();
    const confirmPassword = $("#confirm-password").val();
    const role = $('input[name="user-type"]:checked').val()?.toUpperCase();
    const profilePictureInput = document.getElementById("profile-picture");

    const errors = [];

    if (!username) errors.push("Username is required.");
    if (!email) errors.push("Email is required.");
    else if (!validateEmail(email)) errors.push("Invalid email format.");

    const passwordErrors = validatePassword(password, confirmPassword);
    errors.push(...passwordErrors);

    displayErrors(registerForm[0], errors);

    if (errors.length > 0) return;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);

    if (profilePictureInput.files.length > 0) {
      formData.append("profilePicture", profilePictureInput.files[0]);
    }

    // Request OTP
    AuthService.requestOTP(email, username)
      .done(() => {
        $("#register .form-container").hide();
        otpVerification.show();
        UIManager.startOTPTimer(timerElement[0], resendActionElement[0]);
      })
      .fail((xhr) => {
        const errorMessage =
          xhr.responseJSON?.message || "OTP request failed. Please try again.";
        alert(errorMessage);
      });
  });

  // Verify OTP
  $("#verify-otp-btn").on("click", function () {
    const otp = otpInputs
      .map(function () {
        return this.value;
      })
      .get()
      .join("");
    const otpError = $("#otp-error");

    if (otp.length !== otpInputs.length) {
      otpError.text("Please enter all digits of the verification code.").show();
      return;
    }

    const formData = new FormData();
    formData.append("username", $("#username").val());
    formData.append("email", $("#email").val());
    formData.append("password", $("#password").val());
    formData.append(
      "role",
      $('input[name="user-type"]:checked').val()?.toUpperCase()
    );
    formData.append("otp", otp);

    AuthService.register(formData)
      .done((response) => {
        if (response.token) {
          $.cookie("username", response.username, { path: "/" });
          $.cookie(`${LOCAL_STORAGE_PREFIX}`, response.token, {
            path: "/",
            expires: 7,
          });
          window.location.href = "index.html";
        }
      })
      .fail((xhr) => {
        const errorMessage =
          xhr.responseJSON?.message || "Registration failed. Please try again.";
        alert(errorMessage);
      });
  });

  // Tab Navigation
  $("#showRegister").on("click", function (e) {
    e.preventDefault();
    UIManager.showTab("register-tab");
  });

  $("#showLogin").on("click", function (e) {
    e.preventDefault();
    UIManager.showTab("login-tab");
  });

  // Back to Register Button
  $("#back-to-register").on("click", function (e) {
    e.preventDefault();
    $("#otp-verification").hide();
    $("#register .form-container").show();
  });

  // Resend OTP
  $("#resend-otp").on("click", function (e) {
    e.preventDefault();
    $(".resend-action").hide();
    $(".otp-input").val("");
    $(".otp-input:first").focus();

    const email = $("#email").val();
    const username = $("#username").val();

    AuthService.requestOTP(email, username)
      .done(() => {
        UIManager.startOTPTimer(timerElement[0], resendActionElement[0]);
      })
      .fail((xhr) => {
        const errorMessage =
          xhr.responseJSON?.message || "OTP request failed. Please try again.";
        alert(errorMessage);
      });
  });
});
