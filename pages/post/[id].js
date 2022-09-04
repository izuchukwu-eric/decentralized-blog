import ReactMarkdown  from "react-markdown";
import { useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { css } from "@emotion/css";
import { ethers } from "ethers";
import { AccountContext } from "../../context";

import { contractAddress, ownerAddress } from "../../config";
import Blog from "../../utils/Blog.json";


const GOERLI_URL = process.env.NEXT_PUBLIC_GOERLI_URL;

const ipfsURI = "https://ipfs.io/ipfs/"

export default function Post({ post }) {
    const account = useContext(AccountContext)
    const router = useRouter()
    const { id } = router.query

    if(router.isFallback) {
        return <div>Loading...</div>
    }

    return (
        <div>
            {
                post && (
                    <div className={container}>
                        {
                            /**if the owner of the contract is the logged in user, then render an edit button */
                            ownerAddress === account && (
                                <div className={editPost}>
                                    <Link href={`/edit-post/${id}`}>
                                        <a>
                                            Edit Post
                                        </a>
                                    </Link>
                                </div>
                            )
                        }
                        {
                           /**if post has a cover */
                           post.coverImage && (
                               <img 
                                   src={post.coverImage}
                                   className={coverImageStyle}
                               />
                           )
                        }
                        <h1>{post.title}</h1>
                        <div className={contentContainer}>
                            <ReactMarkdown>{post.content}</ReactMarkdown>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export async function getStaticPaths() {
//fetch all blog posts
    let provider
    provider = new ethers.providers.JsonRpcProvider(GOERLI_URL)


    // if(process.env.ENVIRONMENT === 'local') {
    // provider = new ethers.providers.JsonRpcProvider()
    // } else if(process.env.ENVIRONMENT === 'testnet') {
    // provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today")
    // } else {
    // provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com')
    // }

    const contract = new ethers.Contract(contractAddress, Blog.abi, provider)
    const data = await contract.fetchPosts()

    const paths = data.map(d => ({ params: {id: d[2] } }))

    return {
        paths,
        fallback: true
    }
}

export async function getStaticProps({ params }) {
//create a single page for each post
    const { id } = params
    const ipfsUrl = `${ipfsURI}/${id}`
    const response = await fetch(ipfsUrl)
    const data = await response.json()

    if(data.coverImage) {
        let coverImage = `${ipfsURI}/${data.coverImage}`
        data.coverImage = coverImage
    }

    return {
        props: {
            post: data
        }
    }
}

const editPost = css`
  margin: 20px 0px;
`

const coverImageStyle = css`
  width: 900px;
`

const container = css`
  width: 900px;
  margin: 0 auto;
`

const contentContainer = css`
  margin-top: 60px;
  padding: 0px 40px;
  border-left: 1px solid #e7e7e7;
  border-right: 1px solid #e7e7e7;
  & img {
    max-width: 900px;
  }
`