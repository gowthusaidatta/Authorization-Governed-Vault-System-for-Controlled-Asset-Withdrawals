# Live Demo Deployment Guide

This guide will help you deploy your Authorization-Governed Vault System live demo to the internet.

## Prerequisites

- GitHub account
- Vercel account (free at vercel.com)
- Your frontend code in the `frontend/` directory

## Step 1: Deploy Contracts to Testnet

First, deploy your smart contracts to Sepolia testnet:

```bash
# In the root directory
npm install
npx hardhat run scripts/deploy.js --network sepolia
```

Save the deployed addresses:
- AuthorizationManager address
- SecureVault address

## Step 2: Update Frontend Configuration

Update your frontend with contract addresses:

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_VAULT_ADDRESS=0x<your-vault-address>
VITE_AUTHORIZATION_MANAGER_ADDRESS=0x<your-manager-address>
VITE_SIGNER_ADDRESS=0x<signer-address>
```

## Step 3: Push to GitHub

```bash
git add .
git commit -m "Add live demo frontend"
git push origin main
```

## Step 4: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Vercel auto-detects the React app
5. Set Root Directory to `frontend/`
6. Add environment variables from `.env.example`
7. Click "Deploy"

### Option B: Using Vercel CLI

```bash
npm install -g vercel

cd frontend
vercel --prod
```

Follow the prompts and select your project.

## Step 5: Configure Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain or use the provided `*.vercel.app` URL

## Deployment URLs

Once deployed, you'll get:

- **Live Demo URL:** `https://<project-name>.vercel.app`
- **GitHub Integration:** Auto-deploys on every push

## Monitoring & Maintenance

- **Vercel Analytics:** Track pageviews and performance
- **Error Tracking:** Check Function logs for issues
- **Auto Rollback:** Vercel automatically rolls back failed deployments

## Sharing Your Demo

### Live Demo URL

Share this URL for your submission:
```
https://your-vault-demo.vercel.app
```

### Video Demo (Optional but Recommended)

Create a walkthrough video:

1. Record your screen using OBS or Loom
2. Show:
   - Wallet connection
   - Vault stats display
   - Deposit flow
   - Authorization process
   - Withdrawal flow
3. Upload to YouTube or Vimeo
4. Share link in submission

Example video intro script:
```
"This is the Authorization-Governed Vault System live demo. 
Here we're connecting MetaMask to the Sepolia testnet. 
Let me show you the vault statistics, deposit interface, 
and how withdrawals are authorized..."
```

## Troubleshooting

### Demo shows "Contract Not Found"
- Verify contract addresses in `.env.local`
- Ensure you're connected to the correct network
- Check the RPC URL is accessible

### MetaMask connection fails
- User must have MetaMask installed
- Check if connected to supported network
- Check browser console for errors

### Balance shows 0
- Make sure you have test ETH on Sepolia (use faucet)
- Deposit some test ETH to the vault first
- Verify vault address is correct

## Next Steps

1. ✅ Deploy frontend to Vercel
2. ✅ Share live demo URL
3. 📹 Create and share video walkthrough
4. 📝 Submit to Partnr with demo link

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [React Vite Guide](https://vitejs.dev/guide/)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
