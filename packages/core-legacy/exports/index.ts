if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.warn(
    'Importing from @reown/appkit-core is deprecated. Please import from @reown/appkit-controllers instead.'
  )
}
export * from '@reown/appkit-controllers'
