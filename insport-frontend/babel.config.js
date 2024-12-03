// babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@assets': './assets',
          '@components': './components',
          '@navigation': './navigation',
          '@services': './services',
          '@state': './state',
        },
      },
    ],
  ],
};
