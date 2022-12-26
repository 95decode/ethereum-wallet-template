import SignClient from '@walletconnect/sign-client'

export let signClient: SignClient

export async function createSignClient() {
    signClient = await SignClient.init({
        projectId: process.env.PUBLIC_PROJECT_ID,
        relayUrl: process.env.PUBLIC_RELAY_URL ?? 'wss://relay.walletconnect.com',
        metadata: {
            name: 'React Wallet Connect Test',
            description: 'React Wallet for WalletConnect',
            url: 'https://walletconnect.com/',
            icons: ['https://avatars.githubusercontent.com/u/37784886']
        }
    })
  }