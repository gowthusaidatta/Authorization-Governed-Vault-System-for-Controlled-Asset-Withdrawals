# ✅ Deployment Checklist

Use this checklist to deploy your live demo step by step.

## Pre-Deployment (5 minutes)

- [ ] Node.js installed (`node --version` shows v16+)
- [ ] MetaMask installed in browser
- [ ] GitHub account ready
- [ ] Vercel account created (free at vercel.com)

## Local Setup (10 minutes)

- [ ] Navigate to `frontend` folder
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update contract addresses in `.env.local`
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000`
- [ ] MetaMask connects successfully
- [ ] No console errors shown (F12)

## Local Testing (10 minutes)

- [ ] Wallet connection shows account address
- [ ] Network indicator shows correct network
- [ ] Deposit tab loads without errors
- [ ] Withdraw tab loads without errors
- [ ] Stats tab displays correctly
- [ ] Can switch between tabs smoothly
- [ ] Message notifications work

## Build & Optimization (5 minutes)

- [ ] Run `npm run build`
- [ ] No build errors appear
- [ ] `dist/` folder is created
- [ ] `dist/` folder contains `index.html`
- [ ] Run `npm run preview`
- [ ] Preview build works locally

## Vercel Deployment (5 minutes)

### Method A: CLI
- [ ] Run `npm install -g vercel`
- [ ] Run `vercel` (first time)
- [ ] Select project setup
- [ ] Run `vercel --prod`
- [ ] Note down production URL

### Method B: GitHub
- [ ] Push code to GitHub
- [ ] Go to vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Select GitHub repository
- [ ] Set root directory: `frontend/`
- [ ] Add environment variables
- [ ] Click "Deploy"
- [ ] Note down production URL

## Post-Deployment (10 minutes)

- [ ] Production URL is accessible
- [ ] Page loads without 404 errors
- [ ] No console errors (F12)
- [ ] MetaMask connection works
- [ ] Wallet connection shows account
- [ ] All tabs accessible
- [ ] Mobile view is responsive
- [ ] No layout issues

## Final Testing (5 minutes)

- [ ] Test on desktop browser
- [ ] Test on mobile browser
- [ ] Test on different network (if applicable)
- [ ] Refresh page - connection persists
- [ ] Disconnect and reconnect wallet
- [ ] Share URL with someone else - they can access it
- [ ] URL works from incognito window

## Documentation (5 minutes)

- [ ] README.md in frontend folder is up to date
- [ ] Contract addresses documented
- [ ] Environment variables documented
- [ ] Deployment instructions saved

## Submission Preparation (5 minutes)

- [ ] Copy live demo URL
- [ ] Test URL one more time
- [ ] Prepare video URL (if created)
- [ ] Prepare description of skills used
- [ ] Prepare description of tools used

## Partnr Submission

### Required Fields

**Live Demo URL** *
```
https://your-vault-demo-xxxxx.vercel.app
```
- [ ] Filled in
- [ ] URL is accessible
- [ ] URL works with MetaMask

### Optional Fields

**Video Demo URL**
- [ ] Created 2-3 minute video (optional)
- [ ] Uploaded to YouTube or Vimeo
- [ ] URL added to form

**Skills Used**
- [ ] Selected: Smart Contract Development
- [ ] Selected: Frontend Development
- [ ] Selected: Access Control Patterns
- [ ] Selected: Web3 Integration
- [ ] Selected: (other relevant skills)

**Tools Used**
- [ ] Selected: Solidity
- [ ] Selected: React
- [ ] Selected: Hardhat
- [ ] Selected: Ethers.js
- [ ] Selected: Vercel
- [ ] Selected: (other relevant tools)

**Document** (optional)
- [ ] Added link to GitHub repo
- [ ] Added link to any supporting docs

## Troubleshooting Checklist

If something goes wrong:

### Build Issues
- [ ] Clear `node_modules`: `rm -rf node_modules`
- [ ] Clear cache: `npm cache clean --force`
- [ ] Reinstall: `npm install`
- [ ] Try again: `npm run build`

### Deployment Issues
- [ ] Check Vercel dashboard for error logs
- [ ] Verify environment variables are set
- [ ] Check that root directory is correct
- [ ] Verify no .env secrets in code

### Runtime Issues
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab for errors
- [ ] Check Network tab for failed requests
- [ ] Check if contract addresses are valid
- [ ] Verify MetaMask is connected to correct network

### Performance Issues
- [ ] Run `npm run build`
- [ ] Verify `dist/` folder size is reasonable
- [ ] Check Vercel Analytics for bottlenecks
- [ ] Ensure images are optimized

## Success Criteria

Your deployment is successful when:

✅ Live URL is accessible from any browser  
✅ MetaMask connection works  
✅ All pages load without errors  
✅ Responsive design works on mobile  
✅ No console errors or warnings  
✅ Page loads in under 3 seconds  
✅ URL can be shared and accessed by others  

## Timeline Summary

| Phase | Time | Status |
|-------|------|--------|
| Pre-deployment | 5 min | [ ] |
| Local setup | 10 min | [ ] |
| Local testing | 10 min | [ ] |
| Build | 5 min | [ ] |
| Deploy | 5 min | [ ] |
| Post-deploy test | 10 min | [ ] |
| Final testing | 5 min | [ ] |
| Documentation | 5 min | [ ] |
| Submission | 5 min | [ ] |
| **TOTAL** | **60 min** | [ ] |

## When Complete

- [ ] Mark all items above as complete
- [ ] Copy live URL
- [ ] Submit to Partnr
- [ ] Celebrate! 🎉

---

## Quick Command Reference

```bash
# Install dependencies
npm install

# Test locally
npm run dev

# Build for production
npm run build

# Test production build
npm run preview

# Deploy to Vercel
vercel --prod

# View deployment logs
vercel logs --prod

# Redeploy if needed
vercel --prod --force
```

---

## Help & Support

If you get stuck:

1. Check **VISUAL_GUIDE.md** for overview
2. Check **QUICK_START_DEMO.md** for fast path
3. Check **HOW_TO_GET_LIVE_DEMO.md** for detailed help
4. Check **LIVE_DEMO_DEPLOYMENT.md** for specific issues
5. Check browser console (F12) for error messages

---

**Version:** 1.0  
**Last Updated:** 2025-12-25  
**Status:** Ready to Deploy! 🚀
