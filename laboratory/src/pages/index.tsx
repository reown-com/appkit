import { Badge, Button, Card, Container, Divider, Grid, Link, Text } from '@nextui-org/react'

const reactCards = [
  {
    title: 'Managed',
    description: 'Fully managed modal playground',
    link: '/ManagedReact',
    color: 'primary',
    libraries: ['@web3modal/react', '@web3modal/ethereum', 'wagmi']
  },
  {
    title: 'Managed v1',
    description: 'Full managed modal playground, v1',
    link: '/v1ManagedReact',
    color: 'secondary',
    libraries: ['@web3modal/react', '@web3modal/ethereum', 'wagmi']
  },
  {
    title: 'Standalone',
    description: 'Standalone modal playground',
    link: '/StandaloneReact',
    color: 'warning',
    libraries: ['@web3modal/standalone', '@walletconnect/sign-client']
  },
  {
    title: 'Customised',
    description: 'Customised modal playground',
    link: '/CustomisedReact',
    color: 'error',
    libraries: ['@web3modal/react', '@web3modal/ethereum', 'wagmi']
  },
  {
    title: 'Auth',
    description: 'Auth modal playground',
    link: '/AuthReact',
    color: 'success',
    libraries: ['@web3modal/auth-react']
  }
] as const

const htmlCards = [
  {
    title: 'Auth',
    description: 'Auth modal playground',
    link: '/AuthHtml',
    color: 'success',
    libraries: ['@web3modal/auth-html']
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

      <Container css={{ maxWidth: '940px', margin: '50px auto 0' }}>
        <Text h3 color="gray">
          Html Playgrounds
        </Text>
        <Divider />
      </Container>

      <Grid.Container gap={2} css={{ maxWidth: '940px', margin: '0 auto' }}>
        {htmlCards.map(card => (
          <Grid xs={12} sm={6} key={card.title}>
            <Card key={card.title} variant="bordered">
              <Card.Body>
                <Text h3 color={card.color}>
                  {card.title}
                </Text>
                <Text color="grey">{card.description}</Text>
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
