// Report startup failures rather than leaving the garage loading screen indefinitely.
(function () {
  const loading = document.getElementById("loading");
  function fail(message) {
    if (loading.hidden) return;
    loading.textContent = message;
    loading.style.padding = "28px";
    loading.style.textAlign = "center";
    loading.style.lineHeight = "1.7";
    loading.setAttribute("role", "alert");
  }
  window.addEventListener(
    "error",
    function (event) {
      if (event.target && event.target.tagName === "SCRIPT") {
        const name = event.target.getAttribute("src");
        fail(
          "Could not load " +
            name +
            ". Keep the game files and vendor folder together, then reopen this game page.",
        );
      } else if (event.message) {
        fail(
          "The garage could not start: " +
            event.message +
            ". Try Chrome or Edge with graphics acceleration enabled.",
        );
      }
    },
    true,
  );
  window.addEventListener("unhandledrejection", function () {
    fail(
      "The garage could not start. Reopen this game page in Chrome or Edge and keep all game files together.",
    );
  });
  setTimeout(function () {
    if (loading.getAttribute("role") !== "alert")
      fail(
        "The garage is taking longer than expected. Reopen this game page in Chrome or Edge with graphics acceleration enabled.",
      );
  }, 15000);
})();
