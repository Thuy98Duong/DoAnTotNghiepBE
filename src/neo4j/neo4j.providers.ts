import neo4j from 'neo4j-driver';

export const neo4jProviders = [
  {
    provide: 'DATABASE_CONNECTIONS',
    useFactory: async () => {
      // URI examples: 'neo4j://localhost', 'neo4j+s://xxx.databases.neo4j.io'
      const URI = 'neo4j+s://af6998f7.databases.neo4j.io';
      const USER = 'neo4j';
      const PASSWORD = 'FC_9M-5p-gU6A6ze9DTwumOs_2f1jAoCZCRhhE5FYiA';
      let driver;

      try {
        driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
        const serverInfo = await driver.getServerInfo();
        console.log('Connection established');
        console.log(serverInfo);
      } catch (err) {
        console.log(`Connection error\n${err}\nCause: ${err.cause}`);
      }
    },
    inject: [],
  },
];
