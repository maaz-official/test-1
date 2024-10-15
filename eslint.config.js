module.exports = [
    {
      ignores: ['node_modules'], // Ignore node_modules
    },
    {
      files: ['**/*.js', '**/*.ts'], // Lint all JS and TS files
      languageOptions: {
        ecmaVersion: 'latest', // Use latest ECMAScript version
        sourceType: 'module', // Set source type to module for ES modules
      },
      plugins: {
        import: require('eslint-plugin-import'),
        prettier: require('eslint-plugin-prettier'),
      },
      rules: {
        'no-undef': 'error', // Error on using undefined variables
        'no-unused-vars': 'warn', // Warn on unused variables
        'import/no-unresolved': 'error', // Error on unresolved imports
        'import/named': 'error', // Error if named imports do not exist
        'import/default': 'error', // Error if default imports do not exist
        'import/namespace': 'error', // Error if namespace imports do not exist
        'prettier/prettier': 'error', // Enforce Prettier code style
        'no-console': 'warn', // Warn about console usage
        'eqeqeq': 'error', // Enforce strict equality
        'no-var': 'error', // Enforce let/const instead of var
        'prefer-const': 'error', // Suggest const over let when possible
        'no-debugger': 'error', // Disallow debugger statements
        'consistent-return': 'error', // Enforce return statements consistency
        'no-shadow': 'warn', // Warn on variable shadowing
        'no-param-reassign': 'error', // Disallow parameter reassignment
      },
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'], // Resolve JS and TS file extensions
          },
        },
      },
    },
  ];
  