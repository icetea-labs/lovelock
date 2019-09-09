import IpfsHttpClient from 'ipfs-http-client';
// const ipfs = IpfsHttpClient("ipfs.infura.io", "5001", { protocol: "https" });
const ipfs = IpfsHttpClient('localhost', '5001', { protocol: 'http' });
export default ipfs;
