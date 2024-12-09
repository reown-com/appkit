export function Zorb({ height = '56', width = '56' }: { height?: string; width?: string }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="24" fill="url(#paint0_radial_2249_7)" />
      <circle cx="24" cy="24" r="23.5" stroke="white" stroke-opacity="0.1" />
      <defs>
        <radialGradient
          id="paint0_radial_2249_7"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(31.1802 11.6916) scale(36.1395)"
        >
          <stop offset="0.00520833" stop-color="white" />
          <stop offset="0.3125" stop-color="#F5CCFC" />
          <stop offset="0.515625" stop-color="#DBA4F5" />
          <stop offset="0.65625" stop-color="#9A8EE8" />
          <stop offset="0.822917" stop-color="#6493DA" />
          <stop offset="1" stop-color="#6EBDEA" />
        </radialGradient>
      </defs>
    </svg>
  )
}
