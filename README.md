To install PlayCraze locally on your device:

- Git clone both the playcraze repository and the playcraze-server repository.
- Install the dependencies in both folders.
- Create a database in mysql to store the users and game_matches data.
- Create a .env in the server folder file based off of the example file contained in the repository.
- Run npx knex migrate:latest to create the necessary tables.
- Run the server with "npm start" and run the client-side with "npm run dev".
