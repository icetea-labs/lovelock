import IpfsHttpClient from 'ipfs-http-client';

const ipfs = IpfsHttpClient(process.env.REACT_APP_IPFS_HOST, process.env.REACT_APP_IPFS_PORT, {
  protocol: process.env.REACT_APP_IPFS_PROTOCOL,
});
export default ipfs;
