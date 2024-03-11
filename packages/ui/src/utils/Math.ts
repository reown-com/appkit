/**
 * Interpolates a value from one range to another
 * @param inputRange - number array of length 2 that represents the original range
 * @param outputRange - number array of length 2 that represents the new range
 * @param value - the value to interpolation
 * @returns
 */
export function interpolate(inputRange: number[], outputRange: number[], value: number) {
  const originalRangeMin = inputRange[0] as number
  const originalRangeMax = inputRange[1] as number
  const newRangeMin = outputRange[0] as number
  const newRangeMax = outputRange[1] as number

  if (value < originalRangeMin) return newRangeMin
  if (value > originalRangeMax) return newRangeMax

  return (
    ((newRangeMax - newRangeMin) / (originalRangeMax - originalRangeMin)) *
      (value - originalRangeMin) +
    newRangeMin
  )
}
