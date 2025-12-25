# Authorization-Governed Vault Demo

A modern React-based web interface for the Authorization-Governed Vault System smart contracts.

## Features

- 🔗 **MetaMask Integration** - Connect your wallet seamlessly
- 💾 **Deposit Interface** - Easily deposit ETH to the vault
- 🔓 **Withdraw Interface** - Withdraw with authorization signatures
- 📊 **Real-time Stats** - Monitor vault metrics and balances
- 🧪 **Testnet Support** - Works with Sepolia and Localhost
- 🎨 **Modern UI** - Beautiful, responsive design

## Quick Start

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Build

```bash
npm run build
npm run preview
```

## Deployment to Vercel

### Option 1: Using Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Connect your GitHub repository
4. Vercel will automatically deploy on every push

### Option 3: Manual Build

```bash
npm run build
# Deploy the 'dist' folder to any static hosting service
```

## Configuration

Update contract addresses in your environment or components:

```javascript
const CONTRACT_ADDRESSES = {
  VAULT: '0x...',
  AUTHORIZATION_MANAGER: '0x...'
}
```

## Supported Networks

- **Sepolia Testnet** (Chain ID: 11155111)
- **Localhost** (Chain ID: 31337)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── WalletConnect.jsx       # Wallet connection component
│   │   ├── VaultDashboard.jsx      # Main dashboard
│   │   ├── StatsTab.jsx            # Vault statistics
│   │   ├── DepositTab.jsx          # Deposit interface
│   │   └── WithdrawTab.jsx         # Withdrawal interface
│   ├── App.jsx                     # Main app component
│   └── main.jsx                    # Entry point
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **Ethers.js** - Ethereum interaction
- **CSS3** - Styling

## Live Demo Links

Once deployed, you can access:

- **Production:** `https://your-vault-demo.vercel.app`
- **Preview:** Check your Vercel dashboard for preview URLs

## Security Notes

- Never expose private keys in the frontend
- Always validate user inputs
- Use environment variables for sensitive data
- Deploy contract addresses through environment configuration

## Support

For issues or questions about the vault system, see the main project README.
