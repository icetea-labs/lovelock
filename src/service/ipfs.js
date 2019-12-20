import IpfsHttpClient from 'ipfs-http-client';

export const createIpfsClient = signature => {
  return IpfsHttpClient({
    host: process.env.REACT_APP_IPFS_HOST,
    port: process.env.REACT_APP_IPFS_PORT,
    protocol: process.env.REACT_APP_IPFS_PROTOCOL,
    headers: {
      Authorization: `Bearer ${signature}`,
    },
  })
}

export const ipfs = IpfsHttpClient({
  host: process.env.REACT_APP_IPFS_HOST,
  port: process.env.REACT_APP_IPFS_PORT,
  protocol: process.env.REACT_APP_IPFS_PROTOCOL
})
