process.env.NODE_ENV = 'test';
// Other global setup, e.g., database connection for testing, global mocks
require('dotenv').config({ path: '.env.test' });

const { JUnitXmlReporter } = require('jasmine-reporters');

// Set up the reporter
jasmine.getEnv().addReporter(
    new JUnitXmlReporter({
        savePath: 'test-results', // Directory where report files are saved
        consolidateAll: false     // If true, save all test results in one file, otherwise save each spec result in its own file
    })
);