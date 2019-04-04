module.exports = {
  parser: 'babel-eslint',
  extends: 'eslint:recommended',
  rules: {
    'space-before-function-paren': ['error', 'never'],
    semi: ['error', 'never'],
    'no-underscore-dangle': 0,
    quotes: ['error', 'single']
  }
}
