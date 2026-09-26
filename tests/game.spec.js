import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator("#loading")).toBeHidden();
  await expect(page.locator("#game canvas")).toHaveCount(1);
  page.runtimeErrors = errors;
});
test.afterEach(async ({ page }) => {
  expect(page.runtimeErrors).toEqual([]);
});
test("React lobby retains navigation, vehicle selection, and paint", async ({
  page,
}) => {
  await expect(page.locator("#steps")).toBeVisible();
  const oldName = await page.locator("#carName").textContent();
  await page.locator("#nextVehicle").click();
  await expect(page.locator("#carName")).not.toHaveText(oldName);
  for (const name of ["vehicle", "maps", "weather", "mode", "ready", "home"]) {
    await page.locator('#steps [data-page="' + name + '"]').click();
    await expect(page.locator('[data-screen="' + name + '"]')).toBeVisible();
    await expect(page.locator("#vehicleCaption")).toBeVisible();
  }
  await page.locator('#steps [data-page="vehicle"]').click();
  await page.locator('[data-color="#2373d7"]').click();
  await expect(page.locator("#paintName")).toHaveText("Atlantic blue");
  const panel = await page.locator("#lobbyPanel").boundingBox();
  const caption = await page.locator("#vehicleCaption").boundingBox();
  expect(panel.x + panel.width).toBeLessThan(caption.x);
});
test("driving keeps distance, weather selection, pause, and return to lobby", async ({
  page,
}) => {
  await page.locator('#steps [data-page="weather"]').click();
  await page.locator("#nextWeather").click();
  await expect(page.locator("#weatherTitle")).toContainText("Rain");
  await page.locator('#steps [data-page="ready"]').click();
  await page.locator("#startBtn").click();
  await expect(page.locator("#hud")).toBeVisible();
  await expect(page.locator("#speedBox #tripDistance")).toHaveText("0 m");
  await expect(page.locator("#sceneLabel")).toBeHidden();
  await expect(page.locator("#liveMapControl")).toBeHidden();
  await page.keyboard.down("ArrowUp");
  await expect(page.locator("#tripDistance")).not.toHaveText("0 m");
  await page.keyboard.up("ArrowUp");
  await page.locator("#lobbyBtn").click();
  await expect(page.locator("#pauseOverlay")).toBeVisible();
  await page.locator("#resumeBtn").click();
  await expect(page.locator("#pauseOverlay")).toBeHidden();
  await page.locator("#lobbyBtn").click();
  await page.locator("#pauseHomeBtn").click();
  await expect(page.locator("#lobby")).toBeVisible();
  await expect(page.locator("#game canvas")).toHaveCount(1);
});
test("mobile rotates to landscape and uses compact icons", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#rotateDevice")).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator("#rotateDevice")).toBeHidden();
  await expect(page.locator("#steps")).toBeVisible();
  const icon = await page
    .locator('#steps [data-page="weather"]')
    .evaluate((el) => getComputedStyle(el, "::after").content);
  expect(icon).not.toContain("?");
  expect(icon).not.toBe("none");
  await page.locator('#steps [data-page="ready"]').click();
  await page.locator("#startBtn").click();
  for (const id of ["left", "right", "accel", "brake", "reverse", "turbo"]) {
    const box = await page.locator("#" + id).boundingBox();
    expect(box.width).toBeLessThanOrEqual(46);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(390);
  }
  await expect(page.locator("#speedBox #tripDistance")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#rotateDevice")).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator("#pauseOverlay")).toBeVisible();
});
