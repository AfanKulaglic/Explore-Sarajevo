module.exports = {
  apps: [
    { name: 'accountsystem', cwd: './accountsystem', script: 'npm', args: 'start', env: { PORT: 3005, NODE_ENV: 'production' } },
    { name: 'cms', cwd: './cms', script: 'npm', args: 'start', env: { PORT: 3003, NODE_ENV: 'production' } },
    { name: 'exploresarajevo', cwd: './exploresarajevo', script: 'npm', args: 'start', env: { PORT: 3002, NODE_ENV: 'production' } },
    { name: 'pametnoodabrano', cwd: './pametnoodabrano', script: 'npm', args: 'start', env: { PORT: 3010, NODE_ENV: 'production' } },
    { name: 'playnwin', cwd: './playnwin', script: 'npm', args: 'start', env: { PORT: 3006, NODE_ENV: 'production' } },
    { name: 'rewardscenter', cwd: './RewardsCenter', script: 'npm', args: 'start', env: { PORT: 3004, NODE_ENV: 'production' } },
    { name: 'sarayaquiz', cwd: './SarayaQuiz', script: 'npm', args: 'start', env: { PORT: 3001, NODE_ENV: 'production' } },
    { name: 'hotspot', cwd: './hotspot', script: 'npm', args: 'start', env: { PORT: 3008, NODE_ENV: 'production' } }
  ]
}
