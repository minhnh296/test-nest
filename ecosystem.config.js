module.exports = {
  apps: [
    {
      name: 'kim-thanh-jewelry-app',
      script: 'yarn build && yarn start:prod',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 3001,
      },
    },
  ],
};
