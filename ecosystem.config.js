require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "kim-thanh-jewelry-app",
      script: "node",
      args: "dist/src/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: process.env.NODE_ENV || "production",
        PORT: process.env.PORT || 3001,
      },
    },
  ],
};
