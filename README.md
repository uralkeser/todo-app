# Simple Tasks & Projects API

Simple RESTful Api with using Node.js, Express, MongoDB. All codes were written for the purpose of OnlineFilings coding exercise.

## Before Get Started

This repo contains local MongoDB credentials. You may provide manually as an .env file given the format below or write your URL and Database name to configConstant.js under the folder config. Do not forget to remove brachets. For bonus cases use separate.js under the folder public also you may find db creation script dbCreation.js under the same folder .

```yaml
# .env
DATABASE_URI = [write your uri]
DATABASE_NAME = [write your db name]
```

OR

```js
// ./config/configConstant.js
...

databaseConfig = {
  DATABASE_URI: [write your uri],
  DATABASE_NAME: [write your db name],
};
```

The standard URI connection scheme has the form:

```
mongodb://[username:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb][?options]]
```

## Tech

- [node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)

## Installation

Be sure that node has been installed on your machine. Open your Terminal and run these commands.

Install the dependencies

```bash
npm install
```

Start the server.

```bash
npm run dev
```

## Bonus

```bash
cd public
node separate.js
```

## License

MIT
