import { EIP155_CHAINS, EIP155_SIGNING_METHODS, TEIP155Chain } from '@/data/EIP155Data'
import { eip155Addresses, eip155Wallets } from '@/utils/EIP155WalletUtil'
import {
  getSignParamsMessage,
  getSignTypedDataParamsData,
  getWalletAddressFromParams
} from '@/utils/HelperUtil'
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { ethers, providers } from 'ethers'
import axios from 'axios';

export async function approveEIP155Request(
  requestEvent: SignClientTypes.EventArguments['session_request']
) {
  const { params, id } = requestEvent
  const { chainId, request } = params
  const wallet = eip155Wallets[getWalletAddressFromParams(eip155Addresses, params)]

  switch (request.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      const message = getSignParamsMessage(request.params)
      const signedMessage = await wallet.signMessage(message)
      console.log(signedMessage);
      return formatJsonRpcResult(id, signedMessage)

    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      console.log("params : ",request.params)
      const { domain, types, message: data } = getSignTypedDataParamsData(request.params)
      // https://github.com/ethers-io/ethers.js/issues/687#issuecomment-714069471
      delete types.EIP712Domain
      const signedData = await wallet._signTypedData(domain, types, data)
      return formatJsonRpcResult(id, signedData)

    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      console.log("req : ", request.params[0])
      console.log("to : ", request.params[0].to)
      console.log(chainId);
      const provider = new providers.JsonRpcProvider(EIP155_CHAINS[chainId as TEIP155Chain].rpc)
      const sendTransaction = request.params[0]
      const connectedWallet = wallet.connect(provider)
      const { hash } = await connectedWallet.sendTransaction(sendTransaction)
      return formatJsonRpcResult(id, hash)

    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      // for test
      const unsignedTx = {
        type: 0,
        to: request.params[0].to,
        value: request.params[0].value,
        gasPrice: request.params[0].gasPrice,
        gasLimit: request.params[0].gasLimit,
        nonce: request.params[0].nonce,
        chainId: request.params[0].chainId,
        data: request.params[0].data
      }
/*
      const unsignedTx = {
        type: 2,
        to: request.params[0].to,
        value: request.params[0].value,
        maxPriorityFeePerGas: ethers.utils.hexlify(200000000000),
        maxFeePerGas: ethers.utils.hexlify(250000000000),
        gasLimit: ethers.utils.hexlify(400000),
        nonce: request.params[0].nonce,
        chainId: 80001,
        data: request.params[0].data
      }
*/
      const serializedTx = ethers.utils.serializeTransaction(unsignedTx).slice(2);

      const octet = process.env.OCTET_API_KEY;

      const options = {
        method: 'POST',
        url: 'https://octet-api.blockchainapi.io/2.0/wallets/740/transactions/sign',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + octet,
          'content-type': 'application/json'
        },
        data: {
          serializedUnsignedTransaction: serializedTx, 
          address: request.params[0].from
        }
      };

      const response = await axios.request(options)
      console.log("res1 : ", response)

      const wait = (timeToDelay: number) => new Promise((resolve) => setTimeout(resolve, timeToDelay))

      await wait(15000);

      const options2 = {
        method: 'GET',
        url: `https://octet-api.blockchainapi.io/2.0/wallets/740/transactions/sign/${response.data.uuid}`,
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + octet,
        }
      };

      const response2 = await axios.request(options2)
      console.log("res2 : ", response2.data.serializedSignedTransaction)

      return formatJsonRpcResult(id, response2.data.serializedSignedTransaction)


      //const signTransaction = request.params[0]
      //const signature = await wallet.signTransaction(signTransaction)
      //return formatJsonRpcResult(id, signature)

    default:
      throw new Error(getSdkError('INVALID_METHOD').message)
  }
}

export function rejectEIP155Request(request: SignClientTypes.EventArguments['session_request']) {
  const { id } = request

  return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message)
}