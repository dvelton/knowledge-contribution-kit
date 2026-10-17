const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const test = require("node:test");

const puppeteer = require("puppeteer-core");

const projectRoot = path.resolve(__dirname, "../..");
const chromePath =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function contentType(filePath) {
  return {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".md": "text/markdown"
  }[path.extname(filePath)] || "application/octet-stream";
}

function startServer() {
  const server = http.createServer((request, response) => {
    const requestPath = request.url === "/" ? "/index.html" : request.url;
    const filePath = path.resolve(projectRoot, `.${requestPath}`);
    if (!filePath.startsWith(projectRoot) || !fs.existsSync(filePath)) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": contentType(filePath) });
    fs.createReadStream(filePath).pipe(response);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function openPage(browser, port) {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/index.html`);
  return page;
}

async function completeForm(page) {
  await page.type("#project-name", "Support escalation assistant");
  await page.select("#project-type", "agent");
  await page.type(
    "#project-purpose",
    "Help frontline teams prepare complete escalation summaries."
  );
  await page.type(
    "#project-materials",
    "Read the attached agent instructions and support guide."
  );
  await page.type(
    "#preserve-behavior",
    "Keep concise outputs and the current human escalation boundary."
  );
  await page.type(
    "#contributor-focus",
    "This contributor sees unusual operational exceptions."
  );
}

test("builder generates project-shaped contributor and synthesis prompts", async (context) => {
  const server = await startServer();
  const address = server.address();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox"]
  });
  context.after(async () => {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  });

  const page = await openPage(browser, address.port);
  await completeForm(page);
  await page.click('button[type="submit"]');
  await page.waitForSelector("#generated-result:not([hidden])");

  const prompt = await page.$eval("#prompt-output", (element) =>
    element.textContent
  );
  const synthesis = await page.$eval("#synthesis-output", (element) =>
    element.textContent
  );

  assert.match(prompt, /Support escalation assistant/);
  assert.match(prompt, /REVIEW SUPPORT ESCALATION ASSISTANT FIRST/);
  assert.match(
    prompt,
    /KEEP ONLY CONTRIBUTIONS THAT IMPROVE SUPPORT ESCALATION ASSISTANT/
  );
  assert.match(prompt, /human lawyer at my organization/i);
  assert.match(synthesis, /Do not resolve disagreement by majority vote/i);
});

test("required project details prevent vague prompt generation", async (context) => {
  const server = await startServer();
  const address = server.address();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox"]
  });
  context.after(async () => {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  });

  const page = await openPage(browser, address.port);
  await page.type("#project-name", "Incomplete project");
  await page.click('button[type="submit"]');

  assert.equal(
    await page.$eval("#generated-result", (element) => element.hidden),
    true
  );
});

test("site makes no network requests and works from downloaded files", async (context) => {
  childProcess.execFileSync("python3", ["scripts/build_release.py"], {
    cwd: projectRoot,
    stdio: "pipe"
  });
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox"]
  });
  context.after(async () => {
    await browser.close();
  });

  const page = await browser.newPage();
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto(
    `file://${path.join(projectRoot, "dist", "site", "index.html")}`
  );
  await completeForm(page);
  await page.click('button[type="submit"]');
  await page.waitForSelector("#generated-result:not([hidden])");
  await page.click("#copy-prompt");
  await page.waitForFunction(
    () => document.querySelector("#copy-prompt").textContent.trim() !== "Copy"
  );

  assert(requests.every((url) => url.startsWith("file:")));
  assert.match(
    await page.$eval("#copy-prompt", (element) => element.textContent),
    /Copied|Select and copy manually/
  );
  assert.match(
    await page.$eval("#prompt-output", (element) => element.textContent),
    /Support escalation assistant/
  );
});

test("builder can download prompts and copy synthesis text", async (context) => {
  const downloadPath = path.join(projectRoot, "test-results", "downloads");
  fs.rmSync(downloadPath, { recursive: true, force: true });
  fs.mkdirSync(downloadPath, { recursive: true });

  const server = await startServer();
  const address = server.address();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox"]
  });
  context.after(async () => {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  });

  const page = await openPage(browser, address.port);
  const client = await page.createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath
  });
  await completeForm(page);
  await page.click('button[type="submit"]');
  await page.click("#download-prompt");

  const expectedPath = path.join(
    downloadPath,
    "support-escalation-assistant-contributor-prompt.txt"
  );
  const deadline = Date.now() + 3000;
  while (!fs.existsSync(expectedPath) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  assert(fs.existsSync(expectedPath));
  assert.match(
    fs.readFileSync(expectedPath, "utf8"),
    /REVIEW SUPPORT ESCALATION ASSISTANT FIRST/
  );

  await page.click(".synthesis summary");
  await page.click("#copy-synthesis");
  await page.waitForFunction(
    () => document.querySelector("#copy-synthesis").textContent.trim() !== "Copy synthesis prompt"
  );
  assert.match(
    await page.$eval("#copy-status", (element) => element.textContent),
    /copied|unavailable/i
  );
});

test("generated mobile layout does not overflow", async (context) => {
  const server = await startServer();
  const address = server.address();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox"]
  });
  context.after(async () => {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  });

  const page = await openPage(browser, address.port);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await completeForm(page);
  await page.click('button[type="submit"]');
  await page.waitForSelector("#generated-result:not([hidden])");

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    content: document.documentElement.scrollWidth
  }));
  assert(dimensions.content <= dimensions.viewport);
});

test("builder can reset and create another prompt", async (context) => {
  const server = await startServer();
  const address = server.address();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox"]
  });
  context.after(async () => {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  });

  const page = await openPage(browser, address.port);
  await completeForm(page);
  await page.click('button[type="submit"]');
  await page.click("#start-over");

  assert.equal(
    await page.$eval("#project-name", (element) => element.value),
    ""
  );
  assert.equal(
    await page.$eval("#generated-result", (element) => element.hidden),
    true
  );
});
