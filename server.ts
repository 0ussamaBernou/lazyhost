const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") {
      return new Response("Hello from Bun! This is the root path.");
    }
    if (url.pathname === "/test") {
      return new Response("This is a test path.");
    }
    return new Response("404 Not Found", { status: 404 });
  },
});

console.log(`Bun test server is running on http://localhost:${server.port}`);
