(function ($) {
  "use strict";

  // Dropdown on mouse hover
  $(document).ready(function () {
    function toggleNavbarMethod() {
      if ($(window).width() > 992) {
        $(".navbar .dropdown")
          .on("mouseover", function () {
            $(".dropdown-toggle", this).trigger("click");
          })
          .on("mouseout", function () {
            $(".dropdown-toggle", this).trigger("click").blur();
          });
      } else {
        $(".navbar .dropdown").off("mouseover").off("mouseout");
      }
    }
    toggleNavbarMethod();
    $(window).resize(toggleNavbarMethod);

    // navbar active
    $("navbar-nav")
      .find("a")
      .click(function (e) {});
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });
  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });

  // Main News carousel
  $(".main-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    items: 1,
    dots: true,
    loop: true,
    center: true,
  });

  // Tranding carousel
  $(".tranding-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 2000,
    items: 1,
    dots: false,
    loop: true,
    nav: true,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
  });

  // Carousel item 1
  $(".carousel-item-1").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    items: 1,
    dots: false,
    loop: true,
    nav: true,
    navText: [
      '<i class="fa fa-angle-left" aria-hidden="true"></i>',
      '<i class="fa fa-angle-right" aria-hidden="true"></i>',
    ],
  });

  // Carousel item 2
  $(".carousel-item-2").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    margin: 30,
    dots: false,
    loop: true,
    nav: true,
    navText: [
      '<i class="fa fa-angle-left" aria-hidden="true"></i>',
      '<i class="fa fa-angle-right" aria-hidden="true"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      576: {
        items: 1,
      },
      768: {
        items: 2,
      },
    },
  });

  // Carousel item 3
  $(".carousel-item-3").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    margin: 30,
    dots: false,
    loop: true,
    nav: true,
    navText: [
      '<i class="fa fa-angle-left" aria-hidden="true"></i>',
      '<i class="fa fa-angle-right" aria-hidden="true"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      576: {
        items: 1,
      },
      768: {
        items: 2,
      },
      992: {
        items: 3,
      },
    },
  });

  // Carousel item 4
  $(".carousel-item-4").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    margin: 30,
    dots: false,
    loop: true,
    nav: true,
    navText: [
      '<i class="fa fa-angle-left" aria-hidden="true"></i>',
      '<i class="fa fa-angle-right" aria-hidden="true"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      576: {
        items: 1,
      },
      768: {
        items: 2,
      },
      992: {
        items: 3,
      },
      1200: {
        items: 4,
      },
    },
  });
})(jQuery);

// This is a fixed version of the user profile functionality
document.addEventListener("DOMContentLoaded", function () {
  const userProfileToggle = document.getElementById("userProfileToggle");
  const userProfilePopup = document.getElementById("userProfilePopup");
  const LOCAL_STORAGE_PREFIX = "authTokenNewSL"; // Token prefix

  if (!userProfileToggle || !userProfilePopup) {
    console.error("Could not find user profile elements");
    return;
  }

  // Check if user is logged in by looking for username cookie
  function checkUserLogin() {
    const username = $.cookie("username");
    const token = $.cookie(`${LOCAL_STORAGE_PREFIX}`);

    if (username && token) {
      // User is logged in - fetch their data
      fetchUserData(username, token);
    } else {
      // User is not logged in - show login/register options
      showLoginOptions();
    }
  }

  // Fetch user data using AJAX
  function fetchUserData(username, token) {
    $.ajax({
      url: `http://localhost:8080/newsl/api/v1/user?username=${username}`,
      type: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function (userData) {
        // Update UI with user data
        updateUserInterface(userData);
      },
      error: function (xhr, status, error) {
        console.error("Error fetching user data:", error);
        // If API call fails (e.g., invalid token), show login options
        if (xhr.status === 401) {
          // Clear invalid cookies
          $.removeCookie("username", { path: "/" });
          $.removeCookie(`${LOCAL_STORAGE_PREFIX}`, { path: "/" });
          showLoginOptions();
        }
      },
    });
  }

  // Update the UI with user data
  function updateUserInterface(userData) {
    // Update toggle button
    userProfileToggle.innerHTML = `
      <img src="${userData.profilePicture || "https://via.placeholder.com/36"}" 
           alt="User" class="rounded-circle mr-2" width="36" height="36">
      <span class="font-weight-medium d-none d-md-inline">${
        userData.displayName || userData.username
      }</span>
      <i class="fas fa-chevron-down ml-2 small"></i>
    `;

    // Update popup content
    userProfilePopup.innerHTML = `
      <div class="text-center mb-3">
        <img src="${
          userData.profilePicture || "https://via.placeholder.com/80"
        }" 
             alt="User" class="rounded-circle mb-2" width="80" height="80">
        <h6 class="mb-0">${userData.displayName || userData.username}</h6>
        <p class="text-muted small">${userData.email || ""}</p>
      </div>
      <div class="border-top pt-2">
        <a href="profile.html" class="text-dark d-block py-2">
          <i class="fas fa-user mr-2"></i> My Profile
        </a>
        <a href="bookmarks.html" class="text-dark d-block py-2">
          <i class="fas fa-user mr-2"></i> Bookmarks
        </a>
        <a href="settings.html" class="text-dark d-block py-2">
          <i class="fas fa-cog mr-2"></i> Settings
        </a>
        <a href="#" id="logoutButton" class="text-danger d-block py-2">
          <i class="fas fa-sign-out-alt mr-2"></i> Logout
        </a>
      </div>
    `;

    // Add logout handler
    document
      .getElementById("logoutButton")
      .addEventListener("click", function (e) {
        e.preventDefault();
        logoutUser();
      });
  }

  // Show login/register options when user is not logged in
  function showLoginOptions() {
    // Update toggle button
    userProfileToggle.innerHTML = `
      <i class="fas fa-user-circle mr-2" style="font-size: 1.5rem;"></i>
      <span class="font-weight-medium d-none d-md-inline">Account</span>
      <i class="fas fa-chevron-down ml-2 small"></i>
    `;

    // Update popup with login/register options
    userProfilePopup.innerHTML = `
      <div class="text-center mb-3">
        <i class="fas fa-user-circle mb-2" style="font-size: 3rem;"></i>
        <h6 class="mb-0">Welcome</h6>
        <p class="text-muted small">Please login or register</p>
      </div>
      <div class="border-top pt-2">
        <a href="login.html" class="text-dark d-block py-2">
          <i class="fas fa-sign-in-alt mr-2"></i> Login
        </a>
        <a href="register.html" class="text-dark d-block py-2">
          <i class="fas fa-user-plus mr-2"></i> Register
        </a>
      </div>
    `;
  }

  // Handle user logout
  function logoutUser() {
    // Clear cookies
    $.removeCookie("username", { path: "/" });
    $.removeCookie(`${LOCAL_STORAGE_PREFIX}`, { path: "/" });

    // Show login options
    showLoginOptions();

    // Close popup
    userProfilePopup.style.display = "none";
  }

  // Toggle popup visibility with a direct click handler
  userProfileToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    // Toggle visibility
    if (userProfilePopup.style.display === "block") {
      userProfilePopup.style.display = "none";
    } else {
      userProfilePopup.style.display = "block";
    }
  });

  // Close popup when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !userProfileToggle.contains(e.target) &&
      !userProfilePopup.contains(e.target)
    ) {
      userProfilePopup.style.display = "none";
    }
  });

  // Initialize - check if user is logged in
  checkUserLogin();
});
