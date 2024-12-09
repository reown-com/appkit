import * as styles from './touchableStyles.css'

export interface TouchableStylesParameters {
  hover?: keyof typeof styles.hover
  active?: keyof typeof styles.active
}

export function touchableStyles({ active = 'shrink', hover }: TouchableStylesParameters) {
  return [styles.base, hover && styles.hover[hover], styles.active[active]]
}
