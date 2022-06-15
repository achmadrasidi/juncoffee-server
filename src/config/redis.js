const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_CLIENT_URL,
  auth_pass: process.env.REDIS_CLIENT_PASS,
});
const redisConn = async () => {
  try {
    client.on("error", (err) => console.log(err));
    await client.connect();

    console.log("redis connected");
  } catch (err) {
    console.log(`Error:${err.message}`);
  }
};

module.exports = { redisConn, client };
