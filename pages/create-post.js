import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/router"
import dynamic from 'next/dynamic'
import { css } from '@emotion/css'
import { ethers } from 'ethers'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer';
import { contractAddress } from '../config'
import Blog from '../utils/Blog.json'

const ipfsID = process.env.NEXT_PUBLIC_IPFS_ID;
const ipfsSecret = process.env.NEXT_PUBLIC_IPFS_SECRET;

const projectID = ipfsID;
const projectSecret = ipfsSecret;
const auth = 'Basic ' + Buffer.from(projectID + ':' + projectSecret).toString('base64');

console.log(projectID);

const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
        authorization: auth
    },
});


const SimpleMDE = dynamic(
    () => import('react-simplemde-editor'),
    { ssr: false }
)

const initialState = { title: '', content: ''}

function CreatePost() {
    const [post, setPost] = useState(initialState)
    const [image, setImage] = useState(null)
    const [loaded, setLoaded] = useState(false)
    
    const fileRef = useRef(null)
    const { title, content } = post
    const router = useRouter()

    useEffect(() => {
        setTimeout(() => {
            /** delay rendering buttons until the dynamic import is complete */
            setLoaded(true)
        }, 500)
    }, [])

    

    function onChange(e) {
        setPost(() => ({...post, [e.target.name]: e.target.value }))
    }

    async function savePostToIpfs() {
        /**save post metadata to ipfs */
        try {
            const added = await client.add(JSON.stringify(post))
            return added.path
        } catch (err) {
            console.log('error:', err)
        }
    }

    async function savePost(hash) {
        /**save post to smart contract */
        if(typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, Blog.abi, signer)
            console.log('contract:', contract)
            try {
                const val = await contract.createPost(post.title, hash)
                /** optional - wait for transaction to be confirmed before rerouting */
                await provider.waitForTransaction(val.hash) 
                console.log('val:', val)
            } catch (error) {
                console.log('Error:', error)
            }
        }
    }

    async function createNewPost() {
        /**saves post to ipfs then anchor to smart contract */
        if (!title || !content) return
        const hash = await savePostToIpfs()
        await savePost(hash)
        router.push(`/`)
    }

    async function handleFileChange(e) {
        /**upload cover image to ipfs and save hash to store */
        const uploadedFile = e.target.files[0]
        if(!uploadedFile) return
        const added = await client.add(uploadedFile)
        setPost(state => ({ ...state, coverImage: added.path }))
        setImage(uploadedFile)
    }

    function triggerOnChange() {
        /** trigger handleFileChange handler of hidden file input */
        fileRef.current.click()
    }

    return (
        <div className={container}>
            {
                image && (
                    <img className={coverImageStyle} src={URL.createObjectURL(image)} />
                )
            }

            <input 
                onChange={onChange}
                name="title"
                placeholder="Give it a title"
                value={post.title}
                className={titleStyle}
            />
            <SimpleMDE 
                className={mdEditor}
                placeholder="What's on your mind"
                value={post.content}
                onChange={value => setPost({...post, content: value})}
            />
            {
                loaded && (
                    <>
                        <button
                            className={button}
                            type='button'
                            onClick={createNewPost}
                        >
                            Publish
                        </button>
                        <button className={button} onClick={triggerOnChange}>
                            Add cover image
                        </button>
                    </>
                )
            }
            <input 
                id="selectImage"
                className={hiddenInput}
                type='file'
                onChange={handleFileChange}
                ref={fileRef}
            />
        </div>
    )
}

const hiddenInput = css`
  display: none;
`

const coverImageStyle = css`
  max-width: 800px;
`

const mdEditor = css`
  margin-top: 40px;
`

const titleStyle = css`
  margin-top: 40px;
  border: none;
  outline: none;
  background-color: inherit;
  font-size: 44px;
  font-weight: 600;
  &::placeholder {
    color: #999999;
  }
`

const container = css`
  width: 800px;
  margin: 0 auto;
`

const button = css`
  background-color: #fafafa;
  outline: none;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-right: 10px;
  font-size: 18px;
  padding: 16px 70px;
  box-shadow: 7px 7px rgba(0, 0, 0, .1);
`

export default CreatePost