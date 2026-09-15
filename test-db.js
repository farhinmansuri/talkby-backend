require("dotenv").config();
const dns = require("dns");
const mongoose = require("mongoose");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("URI exists:", !!process.env.MONGOOSE_URL);

mongoose.connect(process.env.MONGOOSE_URL)
    .then(() => {
        console.log("✅ CONNECTED TO MONGODB ATLAS");
        process.exit(0);
    })
    .catch((error) => {
        console.log("❌ CONNECTION FAILED");
        console.error(error);
        process.exit(1);
    });