# chainbeacon

A bitcoin monitor of diverse verification of blocks using multiple versions
and implementations of bitcoin to check for disparity.

## Installation

```
git clone https://github.com/braydonf/chainbeacon.git
cd chainbeacon
npm install
npm start
```

## Configuration

Each node that is monitored is defined in the configuration file. At a
configurable interval each node status is updated with the current chain
height and hash. When there is a disparity an email is sent to subscribers
giving a warning.

```json
{
  "nodes": [
    {
      "name": "bcoin-v1.0.2",
      "host": "localhost",
      "port": 8333,
      "user": "",
      "pass": "Aingoo1iFu3E",
      "https": false
    },
    {
      "name": "bitcoincore-v0.16.2",
      "host": "localhost",
      "port": 8334,
      "user": "local",
      "pass": "Gie5daepehae",
      "https": false
    },
    {
      "name": "bitcoincore-v0.16.3",
      "host": "localhost",
      "port": 8335,
      "user": "local",
      "pass": "Yohcie0Eidea",
      "https": false
    },
    {
      "name": "btcd-v0.12.0-beta",
      "host": "localhost",
      "port": 8336,
      "user": "local",
      "pass": "aeyohNgeesh8",
      "https": false
    }
  ],
  "emailer": {
    "host": "localhost",
    "port": 10000,
    "secure": true,
    "auth": {
      "user": "user",
      "pass": "pass"
    },
    "from": "user@email.com"
  },
  "subscribers": {
    "user@email.com"
  },
  "interval": 10000
}
```

## License

Copyright (c) 2018, Braydon Fuller (MIT License).

See LICENSE for more info.