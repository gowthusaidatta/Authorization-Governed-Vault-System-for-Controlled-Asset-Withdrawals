# How to Get a Live Demo

This document explains how to create and deploy a live demo for your Authorization-Governed Vault System.

## What You Get

A fully functional web interface that allows users to:
- 🔗 Connect MetaMask wallet
- 💾 Deposit ETH to vault
- 🔓 Initiate withdrawals with authorization
- 📊 View vault statistics in real-time

## Quick Deploy (5 minutes)

### 1. **Install Dependencies**

```bash
cd frontend
npm install
```

### 2. **Run Locally**

```bash
npm run dev
```

Visit `http://localhost:3000` and connect MetaMask.

### 3. **Deploy to Vercel (FREE)**

**Option A - CLI Method:**
```bash
npm install -g vercel
vercel --prod
```

**Option B - GitHub Method:**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Connect GitHub account
4. Select your repository
5. Set `frontend/` as root directory
6. Click Deploy

## Your Live Demo URLs

After deployment:

| Platform | URL Format |
|----------|-----------|
| **Vercel** | `https://vault-demo-<random>.vercel.app` |
| **GitHub Pages** | `https://<username>.github.io/vault-demo` |
| **Netlify** | `https://<project>.netlify.app` |

## Complete Step-by-Step Guide

### Step 1: Deploy Smart Contracts

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

Save the deployed addresses:
```
AuthorizationManager: 0x...
SecureVault: 0x...
```

### Step 2: Configure Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` with your contract addresses:
```env
VITE_VAULT_ADDRESS=0x<your-vault>
VITE_AUTHORIZATION_MANAGER_ADDRESS=0x<your-manager>
VITE_SIGNER_ADDRESS=0x<signer>
```

### Step 3: Test Locally

```bash
npm run dev
```

- Open `http://localhost:3000`
- Connect with MetaMask
- Switch to Sepolia testnet
- Get test ETH from [faucet](https://sepoliafaucet.com/)
- Test deposit/withdraw flows

### Step 4: Deploy

```bash
npm run build
```

Choose one deployment option:

#### **Vercel (Recommended)**
```bash
vercel --prod
```

#### **GitHub Pages**
```bash
npm run build
# Push dist folder to gh-pages branch
```

#### **Netlify**
```bash
netlify deploy --prod --dir=dist
```

### Step 5: Share Your Demo

Your submission should include:

**Live Demo URL:**
```
https://your-vault-demo.vercel.app
```

**Video Demo (Optional):**
- Record a 2-3 minute walkthrough
- Show: Connection → Deposit → Stats → Withdrawal
- Upload to YouTube or Vimeo
- Include link in submission

## What's Included

### Frontend Components

```
frontend/
├── src/
│   ├── components/
│   │   ├── WalletConnect.jsx      ← Wallet integration
│   │   ├── VaultDashboard.jsx     ← Main dashboard
│   │   ├── StatsTab.jsx           ← Vault stats
│   │   ├── DepositTab.jsx         ← Deposit UI
│   │   └── WithdrawTab.jsx        ← Withdrawal UI
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── vercel.json                    ← Vercel config
└── README.md
```

### Features

✅ **MetaMask Integration** - Connect & manage accounts  
✅ **Multi-Network Support** - Sepolia & Localhost  
✅ **Responsive Design** - Works on desktop & mobile  
✅ **Real-time Updates** - Live vault statistics  
✅ **Error Handling** - User-friendly error messages  
✅ **Professional UI** - Beautiful gradient design  

## Deployment Comparison

| Service | Cost | Setup Time | Custom Domain |
|---------|------|-----------|---|
| **Vercel** | Free | 2 min | Yes (paid) |
| **Netlify** | Free | 3 min | Yes (free) |
| **GitHub Pages** | Free | 5 min | Yes (free) |
| **AWS** | Paid | 10 min | Yes |

## Troubleshooting

### Issue: "Contract Not Found"
**Solution:** 
- Verify contract addresses in `.env.local`
- Make sure you deployed to Sepolia
- Check RPC URL is accessible

### Issue: "MetaMask not detected"
**Solution:**
- Install MetaMask extension
- Refresh page and allow connection
- Check browser console for errors

### Issue: "Invalid network"
**Solution:**
- Switch MetaMask to Sepolia testnet
- Check chain ID in component (11155111 for Sepolia)
- Verify RPC endpoint is correct

### Issue: "Deployment failed"
**Solution:**
- Check that `dist/` folder was created
- Verify no build errors: `npm run build`
- Check Vercel logs for specific errors

## Next Steps

1. ✅ **Deploy Frontend** - Get your live URL
2. ✅ **Test Thoroughly** - Try all features
3. ✅ **Record Video** - Optional but impressive
4. ✅ **Submit** - Add URLs to Partnr submission

## Submission Template

```
Live Demo URL: https://vault-demo-xxxxx.vercel.app

Video Demo URL: https://youtube.com/watch?v=xxxxx (optional)

Technologies Used:
- React
- Ethers.js
- Solidity
- Hardhat
- Vite
- Vercel

Skills Demonstrated:
- Smart Contract Development
- Frontend Development
- Web3 Integration
- Security (Reentrancy Guard, ECDSA)
- Blockchain Architecture
```

## Additional Resources

- 📚 [Vercel Docs](https://vercel.com/docs)
- 🔧 [Ethers.js Docs](https://docs.ethers.org/v6/)
- 💡 [React Documentation](https://react.dev)
- 🧪 [Sepolia Faucet](https://sepoliafaucet.com/)
- 🎬 [Recording Tools](https://obsproject.com/)

---

**Need help?** Check the `LIVE_DEMO_DEPLOYMENT.md` file for detailed deployment instructions.
