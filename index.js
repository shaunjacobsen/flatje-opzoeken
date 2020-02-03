const { run } = require('./src/index.js');

exports.run = (data, context) => {
  const url = data.data ? Buffer.from(data.data, 'base64').toString() : null;
  console.log('URL from push', url);
  return run(url)
    .then(() => {
      console.log('Finished');
      // process.exit(0);
    })
    .catch(() => {
      console.log('Finished with problems');
      // process.exit(1);
    });
};
