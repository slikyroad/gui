import SilkRoad from "../contract-abis/SilkRoad.json";
import Nft from "../contract-abis/RandomizedCollection.json";

import { ethers } from "ethers";

export const getSilkRoadContract = (address: string, ethereum: any) => {
  const abi = SilkRoad.abi;
  return getContract(address, ethereum, abi);
};

export const getNftContract = (address: string, ethereum: any) => {
  const abi = Nft.abi;
  return getContract(address, ethereum, abi);
};


const getContract = (address: string, ethereum: any, abi: any) => {
  const provider = new ethers.providers.Web3Provider(ethereum); //providers.Web3Provider(web3.currentProvider);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(address, abi, signer);
  const contractWithSigner = contract.connect(signer);
  return contractWithSigner;
};

export const isTransactionMined = async (
  ethereum: any,
  hash: string,
  numberOfBlocks: number
): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      let blockCount = 0;
      provider.on("block", async (_blockNumber) => {
        blockCount++;
        if (blockCount > numberOfBlocks) {
          provider.removeAllListeners("block");
          resolve(false);
        }
        const txReceipt = await provider.getTransactionReceipt(hash);
        if (txReceipt && txReceipt.blockNumber) {
          provider.removeAllListeners("block");
          resolve(true);
        }
      });
    } catch (error) {
      console.log(`waiting for transaction rejected with error`, error);
      reject(error);
    }
  });
};
