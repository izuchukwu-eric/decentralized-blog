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

//css using emotion css
const accountInfo = css`
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-end;
  font-size: 12px;
`
const container = css`
  padding: 40px;
`

const linkContainer = css`
  padding: 30px 60px;
  background-color: #fafafa;
`

const nav = css`
  background-color: white;
`

const header = css`
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, .075);
  padding: 20px 30px;
`

const description = css`
  margin: 0;
  color: #999999;
`

const titleContainer = css`
  display: flex;
  flex-direction: column;
  padding-left: 15px;
`

const title = css`
  margin-left: 30px;
  font-weight: 500;
  margin: 0;
`

const buttonContainer = css`
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-end;
`

const buttonStyle = css`
  background-color: #fafafa;
  outline: none;
  border: none;
  font-size: 18px;
  padding: 16px 70px;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 7px 7px rgba(0, 0, 0, .1);
`

const link = css`
  margin: 0px 40px 0px 0px;
  font-size: 16px;
  font-weight: 400;
` 

export default App
