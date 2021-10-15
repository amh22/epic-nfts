import './styles/App.css'
import twitterLogo from './assets/twitter-logo.svg'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import myEpicNft from './utils/MyEpicNFT.json'

// Constants
const TWITTER_HANDLE = 'andrewmhenry22'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
const OPENSEA_COLLECTION_LINK = 'https://testnets.opensea.io/collection/minftys'

const CONTRACT_ADDRESS = '0x2Cd192F3620b278F767b6F17BB8c48558a2126e3'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('') // A state variable we use to store our user's public wallet
  const [currentTotalMinted, setCurrentTotalMinted] = useState(0)
  const [currentTotalSupply, setCurrentTotalSupply] = useState(0)
  const [correctNetwork, setCorrectNetwork] = useState(false)
  const [openWallet, setOpenWallet] = useState(false)
  const [mining, setMining] = useState(false)
  const [buttonLabel, setButtonLabel] = useState('Mint NFT')
  const [mintMessage, setMintMessage] = useState('')
  const [openSeaLink, setOpenSeaLink] = useState('')
  const [showMintMessage, setShowMintMessage] = useState(false)

  console.log('🚀 ~ file: App.js ~ line 23 ~ App ~ mintMessage', mintMessage)
  // Gotta make sure this is async
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window

    if (!ethereum) {
      console.log('Make sure you have metamask!')
      return
    } else {
      console.log('We have the ethereum object', ethereum)
    }

    // Check if the user is on the correct network

    let chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log('Connected to chain ' + chainId)

    // // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = '0x4'
    if (chainId !== rinkebyChainId) {
      // alert("You are not connected to the Rinkeby Test Network!");
      setCorrectNetwork(false)
    }

    setCorrectNetwork(true)

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' })

    // User can have multiple authorized accounts, we grab the first one if its there!

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Found an authorized account:', account)
      setCurrentAccount(account)

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener()
    } else {
      console.log('No authorized account found')
    }
  }

  // Implement your connectWallet method here

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      // console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0])

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          // console.log(from, tokenId.toNumber())
          // alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)

          setMintMessage(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link:`
          )
          setOpenSeaLink(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })

        // Get the total number that have been minted
        let nftMintedCount = await connectedContract.totalMinted()
        // console.log(nftMintedCount)
        // console.log((nftMintedCount.toNumber()))

        setCurrentTotalMinted(nftMintedCount.toNumber())

        // connectedContract.totalMinted()
        //   .then((data) => {
        //     console.log('totalMinted');
        //     console.log(data);
        //     if (data)
        //       setCurrentTotalMinted(data.toNumber());
        //   })

        // Get the total supply
        let nftSupplyCount = await connectedContract.totalSupply()
        // console.log(nftSupplyCount)
        // console.log((nftSupplyCount.toNumber()))

        setCurrentTotalSupply(nftSupplyCount.toNumber())

        // console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        // console.log("Going to pop wallet now to pay gas...")
        setOpenWallet(true)
        setButtonLabel('Please authorise your wallet...')
        let nftTxn = await connectedContract.makeAnEpicNFT()

        // console.log("Mining...please wait.")
        setOpenWallet(false)
        setMining(true)
        setButtonLabel('Minting your NFT...')
        await nftTxn.wait()

        // console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setShowMintMessage(true)
        setMining(false)
        setButtonLabel('Mint NFT')
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Check if the user is on the correct network
  const checkCorrectNetwork = async () => {
    const { ethereum } = window
    let chainId = await ethereum.request({ method: 'eth_chainId' })
    // console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = '0x4'
    if (chainId !== rinkebyChainId) {
      alert('You are not connected to the Rinkeby Test Network!')
      setCorrectNetwork(false)
    } else setCorrectNetwork(true)
  }

  // const getNumberMintedVsSupply = async () => {
  //   // Most of this looks the same as our function askContractToMintNft
  //   try {
  //     const { ethereum } = window;

  //     if (ethereum) {
  //       // Same stuff again
  //       const provider = new ethers.providers.Web3Provider(ethereum);
  //       const signer = provider.getSigner();
  //       const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

  //       // Get the total number that have been minted
  //       let nftMintedCount = await connectedContract.totalMinted()
  //       console.log(nftMintedCount)
  //       console.log((nftMintedCount.toNumber()))

  //       setCurrentTotalMinted(nftMintedCount.toNumber());

  //       // Get the total supply
  //       let nftSupplyCount = await connectedContract.totalSupply()
  //       console.log(nftSupplyCount)
  //       console.log((nftSupplyCount.toNumber()))

  //       setCurrentTotalSupply(nftSupplyCount.toNumber());

  //       console.log("Checked mint number vs supply!")

  //     } else {
  //       console.log("Ethereum object doesn't exist!");
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  useEffect(() => {
    checkIfWalletIsConnected()
    checkCorrectNetwork()
    // getNumberMintedVsSupply();
  }, [])

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className='cta-button connect-wallet-button' style={{ margin: '40px auto' }}>
      {correctNetwork ? 'Connect to Wallet' : 'You need to connect to the Rinkeby Network'}
    </button>
  )

  // const renderOpenWalletUI = () =>
  //   currentTotalMinted === currentTotalSupply ? (
  //     <p style={{ color: 'white', margin: '40px auto' }}>Sorry, sold out</p>
  //   ) : (
  //     <button onClick={askContractToMintNft} className='cta-button connect-wallet-button' disabled={openWallet}>
  //       Authorise wallet...
  //     </button>
  //   )

  const renderMintUI = () => (
    <button
      onClick={askContractToMintNft}
      className='cta-button connect-wallet-button'
      style={{
        cursor: mining || openWallet || currentTotalMinted === currentTotalSupply ? 'not-allowed' : 'pointer',
        margin: '40px auto',
      }}
      disabled={mining || openWallet}
    >
      {currentTotalMinted === currentTotalSupply ? 'Sorry, all sold out!' : buttonLabel}
    </button>
  )

  const renderCloseAndMintAnotherUI = () => (
    <button
      onClick={() => setShowMintMessage(false)}
      className='cta-button connect-wallet-button'
      style={{ margin: '60px auto 0px' }}
    >
      Close this message to mint another
    </button>
  )

  return (
    <div className='App'>
      <div className='container'>
        <div className='header-container '>
          <p className='header gradient-text' style={{ letterSpacing: '0.03em' }}>
            MINfTY
          </p>
          <p className='sub-text' style={{ letterSpacing: '0.03em' }}>
            Each unique and very refreshing. Go ahead, treat yourself.
          </p>
        </div>

        <div>
          {showMintMessage ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '50%',
                background: '#fff',
                padding: '40px',
                margin: '40px auto',
                borderRadius: '8px',
              }}
            >
              <p style={{ color: '#180e1d', fontSize: '20px' }}>{mintMessage}</p>
              <a
                href={openSeaLink}
                target='_blank'
                rel='noopener noreferrer'
                style={{ color: '#35aee2', fontSize: '20px', fontWeight: 'bold' }}
              >
                <span>View Your NFT on OpenSea</span>
              </a>

              {renderCloseAndMintAnotherUI()}
            </div>
          ) : !correctNetwork ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '50%',
                background: '#fff',
                padding: '40px',
                margin: '40px auto',
                borderRadius: '8px',
              }}
            >
              <p className='sub-text' style={{ color: 'green' }}>
                You need to connect your wallet to the Rinkeby network.
              </p>
              <p className='sub-text' style={{ color: 'green' }}>
                Refresh this page once you've done so.
              </p>
            </div>
          ) : (
            <div>{currentAccount === '' ? renderNotConnectedContainer() : renderMintUI()}</div>
          )}
        </div>

        <div className='' style={{ margin: '40px auto' }}>
          {correctNetwork && (
            <div>
              <p
                style={{ color: 'white', letterSpacing: '0.03em' }}
              >{`MINfTYs minted: ${currentTotalMinted} of ${currentTotalSupply}`}</p>
            </div>
          )}
        </div>

        <div className='' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div>
            <a
              href={OPENSEA_COLLECTION_LINK}
              target='_blank'
              rel='noopener noreferrer'
              style={{
                color: '#fff',
                border: '1px solid white',
                borderRadius: '4px',
                padding: '6px',
                textDecoration: 'none',
              }}
            >
              <span>View collection on OpenSea</span>
            </a>
          </div>

          <div className='footer-container '>
            <img alt='Twitter Logo' className='twitter-logo' src={twitterLogo} />
            <a
              className='footer-text'
              href={TWITTER_LINK}
              target='_blank'
              rel='noopener noreferrer'
            >{`by @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
