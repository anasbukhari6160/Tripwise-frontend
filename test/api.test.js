import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";
import { validateApiUrl, validateGoogleClientId } from "../src/config/environment.js";
import { apiUrl } from "../src/config/api.js";

test("API requests resolve to same-origin relative paths", () => {
  for (const path of ["/api/auth/google", "/api/auth/me", "api/auth/login", "///api/trips/42"]) {
    const resolved = apiUrl(path);
    assert.ok(resolved.startsWith("/api/"), `expected ${resolved} to stay on the same origin`);
    assert.ok(!resolved.includes("://"), `expected ${resolved} to contain no absolute origin`);
    assert.ok(!/^https?:/i.test(resolved), `expected ${resolved} to be protocol-relative`);
  }
  assert.equal(apiUrl("/api/auth/me"), "/api/auth/me");
  assert.throws(() => apiUrl(""));
  assert.throws(() => apiUrl(null));
});

test("development proxy target and Google client ID are validated", () => {
  assert.equal(validateApiUrl(" http://localhost:3000/ "), "http://localhost:3000");
  for (const value of ["", "ftp://example.com", "https://user:password@example.com", "https://example.com?x=1"]) {
    assert.throws(() => validateApiUrl(value));
  }
  assert.throws(() => validateGoogleClientId(""));
});

test("frontend source never targets the backend origin directly", async () => {
  const services = await readFile(new URL("../src/services/api.service.js", import.meta.url), "utf8");

  assert.match(services, /credentials:\s*"include"/);
  assert.doesNotMatch(services, /railway\.app/);
  assert.doesNotMatch(services, /import\.meta\.env\.VITE_API_URL/);
  assert.doesNotMatch(services, /no-cors/);
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
    this.setExport("apiUrl", apiUrl);
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
    assert.equal(request.url, "/api/auth/" + route);
    assert.equal(request.options.credentials, "include");
    assert.equal(request.options.mode, undefined);
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

test("Vercel proxies /api to the backend before the SPA fallback", async () => {
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const [apiRewrite, spaRewrite] = vercel.rewrites;

  assert.equal(apiRewrite.source, "/api/:path*");
  assert.match(apiRewrite.destination, /^https:\/\/[^\s/]+\/api\/:path\*$/);

  for (const route of ["/api/auth/google", "/api/auth/me", "/api/trips", "/api/ai/chat"]) {
    const resolved = apiRewrite.destination.replace(":path*", route.slice("/api".length));
    assert.match(resolved, /^https:\/\/[^\s/]+\/api\//, `expected ${route} to proxy to the backend`);
  }

  // Vercel applies the first matching rewrite, so the API rule must stay first.
  assert.equal(vercel.rewrites[0].source, "/api/:path*");
  assert.equal(vercel.rewrites[1].destination, "/index.html");

  const pattern = new RegExp(`^${spaRewrite.source}$`);

  for (const route of ["/dashboard", "/login", "/trips/42", "/payment/success", "/weather"]) {
    assert.match(route, pattern, `expected ${route} to fall through to index.html`);
  }

  for (const asset of ["/assets/index-UQIkfPNI.js", "/assets/index-xuni7rHM.css", "/favicon.svg", "/icons.svg"]) {
    assert.doesNotMatch(asset, pattern, `expected ${asset} to be served as a static file`);
  }
});

test("Vercel marks proxied API responses as uncacheable", async () => {
  const vercel = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  const apiHeader = vercel.headers.find((entry) => entry.source === "/api/:path*");

  assert.equal(apiHeader.headers.find((h) => h.key === "Cache-Control").value, "no-store");
});
