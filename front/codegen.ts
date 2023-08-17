import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://127.0.0.1:8000/graphql",
  documents: ["src/**/*.tsx"],
  generates: {
    "./src/__generated__/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
      },
      plugins: [],
    },
    "./src/__generated__/possibleTypes.json": {
      plugins: ["fragment-matcher"],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
