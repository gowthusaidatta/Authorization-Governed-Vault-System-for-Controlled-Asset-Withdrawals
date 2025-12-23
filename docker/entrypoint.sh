#!/bin/sh
set -euo pipefail

RPC_URL="${RPC_URL:-http://blockchain:8545}"
export RPC_URL

until npx hardhat --network localhost accounts >/dev/null 2>&1; do
  echo "Waiting for blockchain node at $RPC_URL..."
  sleep 2
done

echo "Compiling contracts..."
npx hardhat compile

echo "Deploying contracts..."
node scripts/deploy.js
