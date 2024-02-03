import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: `${process.env.VITE_API_SERVER_BASE_URL}/graphql`,
  documents: ['./src/**/*.tsx', './src/**/*.ts', '!(./src/gql/*.ts)'],
  ignoreNoDocuments: true,
  generates: {
    './src/gencode-gql/': {
      preset: 'client',
      plugins: [],
    },
  },
};

export default config;
