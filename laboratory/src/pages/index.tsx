import { Badge, Button, Card, Container, Divider, Grid, Link, Text } from '@nextui-org/react'

const reactCards = [
  {
    title: 'With Wagmi',
    description: 'Wagmi playground',
    link: '/with-wagmi/react',
    color: 'secondary',
    libraries: ['@web3modal/react', '@web3modal/ethereum', 'wagmi', 'viem']
  },
  {
    title: 'With Wagmi Themed',
    description: 'Wagmi playground with themed modal',
    link: '/with-wagmi/react-themed',
    color: 'secondary',
    libraries: ['@web3modal/react', '@web3modal/ethereum', 'wagmi', 'viem']
  }
] as const

export default function HomePage() {
  return (
    <>
      <Container css={{ maxWidth: '940px', margin: '50px auto 0' }}>
        <Text h3 color="gray">
          React Playgrounds
        </Text>
        <Divider />
      </Container>
      <Grid.Container gap={2} css={{ maxWidth: '940px', margin: '0 auto' }}>
        {reactCards.map(card => (
          <Grid xs={12} sm={6} key={card.title}>
            <Card key={card.title} variant="bordered">
              <Card.Body>
                <Text h3 color={card.color}>
                  {card.title}
                </Text>
                <Text color="grey">{card.description}</Text>
                <Divider y={1} />
                <Grid.Container alignItems="center" gap={0.5}>
                  {card.libraries.map(library => (
                    <Grid key={library}>
                      <Badge variant="bordered" color={card.color} size="sm">
                        {library}
                      </Badge>
                    </Grid>
                  ))}
                </Grid.Container>
              </Card.Body>
              <Card.Footer>
                <Link href={card.link}>
                  <Button color={card.color}>Go to playground</Button>
                </Link>
              </Card.Footer>
            </Card>
          </Grid>
        ))}
      </Grid.Container>
    </>
  )
}
