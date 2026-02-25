module.exports = {
  apps: [
    {
      name: "edit-dashboard",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
}