import IpfsHttpClient from 'ipfs-http-client';

const signature = 'teat1m7tgu3mywkqkn36fdgfmsngy4xgsr2ncvca7jc';

const ipfs = IpfsHttpClient({
  host: process.env.REACT_APP_IPFS_HOST,
  port: process.env.REACT_APP_IPFS_PORT,
  protocol: process.env.REACT_APP_IPFS_PROTOCOL,
  headers: {
    Authorization: `Bearer ${signature}`,
  },
});

export default ipfs;
