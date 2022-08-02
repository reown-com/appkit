function color(alpha = 1) {
  return {
    light: {
      foreground: {
        accent: `rgba(51, 150, 255, ${alpha})`,
        inverse: `rgba(255, 255, 255, ${alpha})`,
        1: `rgba(20, 20, 20, ${alpha})`,
        2: `rgba(121, 134, 134, ${alpha})`,
        3: `rgba(158, 169, 169, ${alpha})`
      },
      background: {
        accent: `rgba(232, 242, 252, ${alpha})`,
        1: `rgba(255, 255, 255, ${alpha})`,
        2: `rgba(241, 243, 243, ${alpha})`,
        3: `rgba(228, 231, 231, ${alpha})`
      },
      overlay: {
        thin: 'rgba(0, 0, 0, 0.1)',
        thick: 'rgba(0, 0, 0, 0.4)'
      }
    },

    dark: {
      foreground: {
        accent: `rgba(71, 161, 255, ${alpha})`,
        inverse: `rgba(255, 255, 255, ${alpha})`,
        1: `rgba(228, 231, 231, ${alpha})`,
        2: `rgba(148, 158, 158, ${alpha})`,
        3: `rgba(110, 119, 119, ${alpha})`
      },
      background: {
        accent: `rgba(21, 38, 55, ${alpha})`,
        1: `rgba(20, 20, 20, ${alpha})`,
        2: `rgba(39, 42, 42, ${alpha})`,
        3: `rgba(59, 64, 64, ${alpha})`
      },
      overlay: {
        thin: 'rgba(0, 0, 0, 0.1)',
        thick: 'rgba(0, 0, 0, 0.4)'
      }
    }
  }
}

export default color
