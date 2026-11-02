console.log("1: script begins");
async function demonstrate() {
  console.log("2: before await");
  const value = await Promise.resolve("ready");
  console.log("4:", value);
}
demonstrate();
console.log("3: script continues");
