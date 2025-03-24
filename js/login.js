$(document).ready(function () {
  $("#showRegister").click(function (e) {
    e.preventDefault();
    $("#register-tab").tab("show");
  });

  $("#showLogin").click(function (e) {
    e.preventDefault();
    $("#login-tab").tab("show");
  });

  // Login
  $("#login-form").submit(function (e) {
    e.preventDefault();

    const email = $("#login-email").val();
    const password = $("#login-password").val();

    const payload = {
      email: email,
      password: password,
    };

    $.ajax({
      url: "http://localhost:8080/newsl/api/v1/auth/authenticate",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function (response) {
        console.log("Login successful!", response);

        if (response.token) {
          localStorage.setItem(
            `authTokenNewSL-${response.username}`,
            response.token
          );
        }

        window.location.href = "index.html";
      },
      error: function (xhr, status, error) {
        console.error("Login failed:", error);

        $("#login-error")
          .text("Invalid email or password. Please try again.")
          .show();
      },
    });
  });

  // Register
});
