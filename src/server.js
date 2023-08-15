const app = require('./app');

init();

async function init() {
  try {
    app.listen(5555, () => {
      /* eslint-disable-next-line no-console */
      console.log('Express App Listening on Port 5555');
    });
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error(`An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}
