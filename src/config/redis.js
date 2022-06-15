const { createClient } = require("redis");

const client = createClient();
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
