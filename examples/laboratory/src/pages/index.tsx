import { Button, Card, Grid, Link, Text } from '@nextui-org/react'

const cards = [
  {
    title: 'WalletConnect v2',
    description: 'Simple ethereum and polygon example that uses wagmi with WalletConnect v2',
    link: '/v2Base',
    color: 'primary'
  },
  {
    title: 'WalletConnect v2 Extended',
    description: 'Extended all chain example that uses wagmi with WalletConnect v2',
    link: '/v2Extended',
    color: 'primary'
  },
  {
    title: 'WalletConnect v1',
    description: 'Simple ethereum and polygon example that uses wagmi with WalletConnect v1',
    link: '/v1Base',
    color: 'secondary'
  },
  {
    title: 'WalletConnect v1 Extended',
    description: 'Extended all chain example that uses wagmi with WalletConnect v1',
    link: '/v1Extended',
    color: 'secondary'
  },
  {
    title: 'WalletConnect v2 Standalone',
    description: 'Standalone WalletConnect v2 example using universal-provider',
    link: '/v2Standalone',
    color: 'warning'
  },
  {
    title: 'WalletConnect v2 Custom',
    description:
      'Simple ethereum and polygon example that uses wagmi with WalletConnect v2, with some custom added wallet',
    link: '/v2Customised',
    color: 'error'
  }
] as const

export default function HomePage() {
  return (
    <Grid.Container gap={2} css={{ maxWidth: '940px', margin: '0 auto' }}>
      {cards.map(card => (
        <Grid xs={12} sm={6}>
          <Card key={card.title} variant="bordered">
            <Card.Body>
              <Text h3 color={card.color}>
                {card.title}
              </Text>
              <Text color="grey">{card.description}</Text>
            </Card.Body>
            <Card.Footer>
              <Link href={card.link}>
                <Button shadow color={card.color}>
                  Go to example
                </Button>
              </Link>
            </Card.Footer>
          </Card>
        </Grid>
      ))}
    </Grid.Container>
  )
}
