export default function Navigation() {
  return (
    <nav className="navigation">
      <ul>
        <li>
          <a href="/">V1</a>
        </li>
        <li>
          <a href="/custom">V1 Custom</a>
        </li>
        <li>
          <a href="/?version=2">V2 (All Chains)</a>
        </li>
        <li>
          <a href="/?version=2&chains=minimal">V2 (Minimal Chains)</a>
        </li>
        <li>
          <a href="/custom?version=2">V2 Custom</a>
        </li>
      </ul>
    </nav>
  )
}
