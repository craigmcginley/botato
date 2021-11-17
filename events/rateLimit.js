module.exports = {
  name: 'rateLimit',
  async execute(rateLimitData) {
    // TODO: Is there some way to log when the queue for the rate limit prevention has completed?
    console.log('==========================');
    console.log('Hit rate limit!');
    console.log(rateLimitData);
  },
};
