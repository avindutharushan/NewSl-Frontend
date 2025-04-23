$(document).ready(function () {
  console.log("Payment script loaded");

  // Set up payment constants - THESE SHOULD BE VERIFIED WITH YOUR PAYMENT PROVIDER
  // DO NOT USE THESE VALUES IN PRODUCTION - REPLACE WITH YOUR ACTUAL CREDENTIALS
  const merchantId = "1230230";
  const merchantSecret =
    "MTE5Mzg1MzE4MDIzNzgyMjIwOTQzOTA5MjA4ODA4MjIzMTI4ODgzMA==";

  // Generate hash for secure payment - revised to match PayHere requirements
  function generateHash(orderId, amount, currency, merchantSecret) {
    // Make sure to use the exact hashing algorithm required by PayHere
    const hashedSecret = CryptoJS.MD5(merchantSecret).toString().toUpperCase();
    const amountFormatted = parseFloat(amount).toFixed(2); // Ensure two decimal places
    const rawHash =
      merchantId + orderId + amountFormatted + currency + hashedSecret;
    return CryptoJS.MD5(rawHash).toString().toUpperCase();
  }

  // Handle monthly subscription
  $("#premium-month").on("click", function () {
    initiatePayment("monthly", 900);
  });

  // Handle yearly subscription
  $("#premium-year").on("click", function () {
    initiatePayment("yearly", 9000);
  });

  function initiatePayment(planType, amount) {
    // First check if user is logged in
    const token = $.cookie("authTokenNewSL");
    if (!token) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to subscribe to premium plans",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#4a6cf7",
        cancelButtonColor: "#d33",
        confirmButtonText: "Login Now",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          // Store intended plan for after login
          localStorage.setItem("pendingPlan", planType);
          localStorage.setItem("pendingAmount", amount);
          window.location.href = "login.html";
        }
      });
      return;
    }

    // Get user data
    getUserData(function (userData) {
      console.log("User data:", userData);

      if (!userData) {
        Swal.fire("Error", "Could not retrieve user information", "error");
        return;
      }
      const amount = 900;
      const currency = "LKR";
      const orderId = "SUB-" + Date.now();
      const hash = generateHash(orderId, amount, currency, merchantSecret);

      // Configure payment
      const payment = {
        sandbox: true, // Set to false for production
        merchant_id: merchantId,
        return_url: "http://localhost:8080/newsl/api/v1/home",
        cancel_url: "http://localhost:8080/newsl/api/v1/home",
        notify_url: "http://localhost:8080/newsl/api/v1/payment/notify",
        order_id: orderId,
        items: "monthly",
        amount: amount,
        currency: currency,
        first_name: "User",
        last_name: userData.username,
        email: userData.email,
        owner: "newsl.newscraft@gmail.com",
        phone: "0779028078",
        address: "No. 1, Galle Road",
        city: "Colombo",
        country: "Sri Lanka",
        hash: hash,
      };

      console.log("Payment configuration:", payment); // Log payment details for debugging

      // Initialize PayHere events
      payhere.onCompleted = function (orderId) {
        console.log("Payment completed for:", orderId);
        // Call the backend to verify the payment status
        $.ajax({
          type: "POST",
          url: "http://localhost:8080/newsl/api/v1/payment/notify",
          data: { order_id: orderId },
          success: function (response) {
            if (response.code === 200) {
              Swal.fire("Payment completed successfully!");
              window.location.href = "my_bids.html";
            } else {
              Swal.fire("Payment verification failed: " + response.message);
            }
          },
          error: function (error) {
            console.error("Error verifying payment:", error);
            Swal.fire(
              "Failed to verify payment: " +
                (error.responseJSON?.message || "Unknown error")
            );
          },
        });
        // Call backend to verify payment and activate subscription
        $.ajax({
          type: "POST",
          url: "http://localhost:8080/newsl/api/v1/payment/confirm",
          headers: {
            Authorization: "Bearer " + token,
          },
          data: JSON.stringify({
            user: userData.username,
            tier: "PREMIUM",
            startDate: new Date(),
            amount: amount,
          }),
          contentType: "application/json",
          success: function (response) {
            console.log("Subscription activated:", response);
            Swal.fire({
              title: "Subscription Activated!",
              text: "Your premium " + planType + " plan is now active",
              icon: "success",
              confirmButtonColor: "#4a6cf7",
            }).then(() => {
              window.location.href = "/dashboard.html";
            });
          },
          error: function (error) {
            console.error("Activation error:", error);
            Swal.fire({
              title: "Activation Error",
              text: "Your payment was received but we couldn't activate your account. Our team will contact you soon.",
              icon: "warning",
            });
          },
        });
      };

      payhere.onDismissed = function () {
        console.log("Payment dismissed");
        Swal.fire(
          "Payment Cancelled",
          "You cancelled the payment process",
          "info"
        );
      };

      payhere.onError = function (error) {
        console.error("Payment error:", error);
        Swal.fire(
          "Payment Failed",
          "Error processing payment: " + error.message,
          "error"
        );
      };

      // Start payment process
      try {
        payhere.startPayment(payment);
      } catch (e) {
        console.error("Payment initialization error:", e);
        Swal.fire(
          "Payment Error",
          "There was an error initializing the payment. Please try again later.",
          "error"
        );
      }
    });
  }

  // Function to get user data
  function getUserData(callback) {
    const token = $.cookie("authTokenNewSL");
    const username = $.cookie("username");
    if (!token) {
      callback(null);
      return;
    }

    $.ajax({
      type: "GET",
      url: "http://localhost:8080/newsl/api/v1/user?username=" + username,
      headers: {
        Authorization: "Bearer " + token,
      },
      success: function (response) {
        console.log("User data:", response);
        callback(response);
      },
      error: function (error) {
        console.error("Error fetching user data:", error);
        callback(null);
      },
    });
  }

  // Check for redirect from login with pending subscription
  const pendingPlan = localStorage.getItem("pendingPlan");
  const pendingAmount = localStorage.getItem("pendingAmount");

  if (pendingPlan && pendingAmount) {
    // Clear pending data
    localStorage.removeItem("pendingPlan");
    localStorage.removeItem("pendingAmount");

    // Ask user if they want to continue with subscription
    Swal.fire({
      title: "Continue with Subscription?",
      text: "Would you like to complete your " + pendingPlan + " subscription?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4a6cf7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Subscribe Now",
      cancelButtonText: "No, Maybe Later",
    }).then((result) => {
      if (result.isConfirmed) {
        initiatePayment(pendingPlan, parseFloat(pendingAmount));
      }
    });
  }

  // Add logout functionality
  $(".logout-btn").on("click", function () {
    confirmLogout();
  });

  function confirmLogout() {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4a6cf7",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        $.removeCookie("authTokenNewSL");
        $.removeCookie("username");
        window.location.href = "login.html";
      }
    });
  }
});
