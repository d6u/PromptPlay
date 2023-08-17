# "Front" is a React App

_This was created by using `create-react-app`._ The creation command used is:

```sh
# In repo root directory
npx create-react-app front --template typescript
```

_`npx` is a tool comes with Node.js environment._

## Setup

**Every command runs in current directory, i.e. `front`, unless otherwise mentioned.**

_Making sure first to finish the setup steps mentioned in repo root README._

1. **(Every time for new repo clone and there are changes in npm dependencies.)** Install npm dependencies.
   ```sh
   npm i
   ```

## Workflow

**Every command runs in current directory, i.e. `front`, unless otherwise mentioned.**

Set up development server and open the frontend page in browser.

```sh
npm start
```

- To access frontend page: [localhost:3000](http://localhost:3000)
- The page will hot reload if you make edits to any JS files.

In a seperate terminal:

```sh
npm run watch
```

This will start GraphQL codegen process and watch for changes in client side GraphQL usage.

**Make sure the Studio Server is started and `127.0.0.1:8000/graphql` is accessible.** This command depends on the server side GraphQL schema.

You can also run codegen command on demand:

```sh
npm run compile
```

### `npm test`

**There is no tests for now.**

Launches the test runner in the interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

**There is no deployment for now.**

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.
