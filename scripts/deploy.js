const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // We get the contract to deploy
  const Blog = await hre.ethers.getContractFactory("Blog");
  const blog = await Blog.deploy("My web3 blog");

  await blog.deployed();

  console.log("Blog deployed to:", blog.address);

  fs.writeFileSync('./config.js', `
    export const contractAddress = "${blog.address}"
    export const ownerAddress = "${blog.signer.address}"
  `)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
