import {useState} from 'react'
import Link from 'next/link'
import {css} from '@emotion/css'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import {AccountContext} from '../context.js'
import {ownerAddress} from '../config'
import 'easymde/dist/easymde.min.css'
import '../styles/globals.css'

function App({Component, pageProps}) {
  const [account, setAccount] = useState(null);

  async function getWeb3Modal() {
    const web3Modal = new Web3Modal({
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: "d295b94a983e4f658580ad8bf8e0e578"
          }
        }
      }
    })
    return web3Modal
  }

  //function to authenticate user
  async function connect() {
    try {
      const web3Modal = await getWeb3Modal();
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const accounts = await provider.listAccounts()
      setAccount(accounts[0])
    } catch (error) { 
      console.log('error:', error)
    }
  }


  return (
    <div>
      <nav className={nav}>
        <div className={header}>
          <Link href='/'>
            <a>
              <img 
                src='/logo.svg'
                alt='logo'
                style={{width: '50px'}}
              />
            </a>
          </Link>
          <Link href='/'>
            <a>
              <div className={titleContainer}>
                <h2 className={title}>Full Stack</h2>
                <p className={description}>WEB3</p>
              </div>
            </a>
          </Link>

          {
            !account && (
              <div className={buttonContainer}>
                <button className={buttonStyle} onClick={connect}>Connect</button>
              </div>
            ) 
          }
          {
            account && <p className={accountInfo}>{account}</p>
          }
        </div>
        <div className={linkContainer}>
          <Link href="/">
            <a className={link}>
              Home
            </a>
          </Link>
          {
            /**if the signed in uer is the contract owner, we */
            /**show the nav link to create a new post */
            (account === ownerAddress) && (
              <Link href="/create-post">
                <a className={link}>
                  Create Post
                </a>
              </Link>
            )
          }
        </div>
      </nav>
      <div className={container}>
          <AccountContext.Provider value={account}>
            <Component {...pageProps} connect={connect} />
          </AccountContext.Provider>
      </div>

    </div>
  )

}
