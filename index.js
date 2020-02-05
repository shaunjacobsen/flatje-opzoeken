const { run } = require('./src/index.js');

exports.run = (data, context) => {
  const url = data.data ? Buffer.from(data.data, 'base64').toString() : null;
  console.log('URL from push', url);
  return run(url)
    .then(() => {
      console.log('Finished');
    })
    .catch(e => {
      throw new Error('Finished with problems', e);
    });
};
