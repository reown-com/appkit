export default {
  '*.(ts|tsx)': ['prettier --check', 'eslint', 'tsc --noEmit']
}
