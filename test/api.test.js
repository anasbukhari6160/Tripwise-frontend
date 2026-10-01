import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";
import { validateApiUrl, validateGoogleClientId } from "../src/config/environment.js";

test("API configuration normalizes URLs and rejects invalid production settings", () => {
  assert.equal(validateApiUrl(" https://api.example.com/// ", true), "https://api.example.com");
  for (const value of ["", "http://localhost:3000", "https://localhost", "ftp://example.com", "https://user:password@example.com", "https://example.com?x=1"]) {
    assert.throws(() => validateApiUrl(value, true));
  }
  assert.throws(() => validateGoogleClientId(""));
  for (const value of ["http://0.0.0.0:3000", "https://api.local", "https://[::1]:3000"]) {
    assert.throws(() => validateApiUrl(value, true));
  }
  assert.equal(validateApiUrl("http://localhost:3000", false), "http://localhost:3000");
});

test("API requests preserve credentials, routes, error metadata and bounded failure handling", async () => {
  let response = Response.json({ success: true });
  const requests = [];
  const context = vm.createContext({
    AbortController, setTimeout, clearTimeout, TypeError,
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (response === "network") throw new TypeError("fetch failed");
      if (response === "timeout") return new Promise((resolve, reject) => {
        options.signal.addEventListener("abort", () => reject(new Error("aborted")));
      });
      return response.clone();
    },
  });
  const config = new vm.SyntheticModule(["apiUrl"], function () {
    this.setExport("apiUrl", (path) => "https://api.example.com" + path);
  }, { context });
  const helper = new vm.SourceTextModule(await readFile(new URL("../src/services/api.service.js", import.meta.url), "utf8"), { context });
  await helper.link(() => config);
  await helper.evaluate();
  const { apiRequest } = helper.namespace;
  const auth = new vm.SourceTextModule(await readFile(new URL("../src/services/auth.service.js", import.meta.url), "utf8"), { context });
  await auth.link(() => helper);
  await auth.evaluate();
  const calls = [
    ["registerUser", [{}], "register"], ["loginUser", [{}], "login"],
    ["googleLogin", ["test-token"], "google"], ["logoutUser", [], "logout"],
    ["getCurrentUser", [], "me"], ["verifyEmail", ["test@example.com", "012345"], "verify-email"],
    ["resendVerificationCode", ["test@example.com"], "resend-verification"],
    ["forgotPassword", ["test@example.com"], "forgot-password"],
    ["resetPassword", ["test@example.com", "012345", "test-password"], "reset-password"],
  ];
  for (const [name, args, route] of calls) {
    await auth.namespace[name](...args);
    const request = requests.at(-1);
    assert.equal(request.url, "https://api.example.com/api/auth/" + route);
    assert.equal(request.options.credentials, "include");
    assert.equal(request.options.method || "GET", route === "me" ? "GET" : "POST");
  }
  assert.equal(JSON.parse(requests[5].options.body).code, "012345");
  response = Response.json({ message: "Email unavailable", canResend: true, email: "test@example.com" }, { status: 502 });
  await assert.rejects(apiRequest("/test"), (error) => error.status === 502 && error.canResend && error.email === "test@example.com");
  response = Response.json({ message: "Not authenticated" }, { status: 401 });
  await assert.rejects(auth.namespace.getCurrentUser(), (error) => error.status === 401);
  response = new Response(null, { status: 204 });
  assert.equal(Object.keys(await apiRequest("/test")).length, 0);
  response = new Response("<html>Bad gateway</html>", { status: 502 });
  await assert.rejects(apiRequest("/test"), /Invalid response/);
  response = "network";
  await assert.rejects(apiRequest("/test"), /Unable to reach TripWise/);
  response = "timeout";
  await assert.rejects(apiRequest("/test", { timeout: 10 }), /timed out/);
});

test("Vercel SPA rewrites serve deep links without shadowing static assets", async () => {
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const rewrites = vercel.rewrites;

  assert.ok(Array.isArray(rewrites) && rewrites.length > 0, "expected at least one rewrite");

  const [rewrite] = rewrites;
  const pattern = new RegExp(`^${rewrite.source}$`);

  for (const route of ["/dashboard", "/login", "/trips/42", "/payment/success", "/weather"]) {
    assert.match(route, pattern, `expected ${route} to fall through to index.html`);
  }

  for (const asset of ["/assets/index-UQIkfPNI.js", "/assets/index-xuni7rHM.css", "/favicon.svg", "/icons.svg"]) {
    assert.doesNotMatch(asset, pattern, `expected ${asset} to be served as a static file`);
  }
});
