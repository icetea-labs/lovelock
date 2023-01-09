import IpfsHttpClient from 'ipfs-http-client';

export const createIpfsClient = (authData) => {
  return IpfsHttpClient({
    host: process.env.REACT_APP_IPFS_HOST,
    port: process.env.REACT_APP_IPFS_PORT,
    protocol: process.env.REACT_APP_IPFS_PROTOCOL,
    headers: {
      authorization: authData,
    },
  });
};

export const ipfs = IpfsHttpClient({
  host: process.env.REACT_APP_IPFS_HOST,
  port: process.env.REACT_APP_IPFS_PORT,
  protocol: process.env.REACT_APP_IPFS_PROTOCOL,
});
