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
    title: 'With Wagmi v1',
    description: 'Wagmi playground using WalletConnect v1',
    link: '/with-wagmi/react-v1',
    color: 'secondary',
    libraries: ['@web3modal/react', '@web3modal/ethereum', 'wagmi', 'viem']
  },
  {
    title: 'With Wagmi Themed',
    description: 'Wagmi playground with themed modal',
    link: '/with-wagmi/react-themed',
    color: 'secondary',
    libraries: ['@web3modal/react', '@web3modal/ethereum', 'wagmi', 'viem']
  },
  {
    title: 'With Sign API',
    description: 'Sign modal playground',
    link: '/with-sign-api/react',
    color: 'primary',
    libraries: ['@web3modal/sign-react']
  },
  {
    title: 'With Auth Api',
    description: 'Auth modal playground',
    link: '/with-auth-api/react',
    color: 'success',
    libraries: ['@web3modal/auth-react']
  }
] as const

const htmlCards = [
  {
    title: 'With Sign API',
    description: 'Sign modal playground',
    link: '/with-sign-api/html',
    color: 'primary',
    libraries: ['@web3modal/sign-html']
  },
  {
    title: 'With Auth API',
    description: 'Auth modal playground',
    link: '/with-auth-api/html',
    color: 'success',
    libraries: ['@web3modal/auth-html']
  }
] as const

const modalCards = [
  {
    title: 'With Ethereum Provider',
    description: 'Ethereum Provider playground',
    link: '/with-ethereum-provider',
    color: 'primary',
    libraries: ['@walletconnect/ethereum-provider', '@walletconnect/modal']
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

      <Container css={{ maxWidth: '940px', margin: '50px auto 0' }}>
        <Text h3 color="gray">
          @walletconnect/modal Playgrounds
        </Text>
        <Divider />
      </Container>

      <Grid.Container gap={2} css={{ maxWidth: '940px', margin: '0 auto' }}>
        {modalCards.map(card => (
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
