const fs = require("fs");
const h = fs.readFileSync("d:/code/309-153router/agent-tools/prod-zh.html", "utf8");
for (const k of [
  "tongjilian",
  "baidu",
  "vercel",
  "tracker",
  "reload",
  "refresh",
  "setInterval",
  "60000",
  "location.reload",
]) {
  console.log(k, h.includes(k));
}
const re = /<script[^>]*src=["']([^"']+)["']/gi;
const scripts = [];
let m;
while ((m = re.exec(h))) scripts.push(m[1]);
console.log(
  "external:",
  scripts.filter((s) => s.startsWith("http"))
);
console.log("inline script count:", (h.match(/<script/gi) || []).length);
