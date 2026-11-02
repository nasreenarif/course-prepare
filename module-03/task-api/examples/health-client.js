try {
  const response = await fetch("http://localhost:3000/api/health");
  console.log("HTTP status:", response.status);
  console.log("Body:", await response.text());
  if (!response.ok) process.exitCode = 1;
} catch (error) {
  console.error("No complete HTTP response:", error.name);
  process.exitCode = 1;
}
