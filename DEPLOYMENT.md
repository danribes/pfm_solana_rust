# Deployment Guide

## GitHub Pages Deployment

This project supports automatic deployment to GitHub Pages for the public landing page.

### Setup

1. **Enable GitHub Pages:**
   - Go to your repository Settings
   - Navigate to "Pages" section
   - Under "Source", select "GitHub Actions"

2. **Push changes:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment workflow"
   git push origin main
   ```

3. **Monitor deployment:**
   - Go to the "Actions" tab in your GitHub repository
   - Watch the "Deploy to GitHub Pages" workflow

### Access Your Site

After successful deployment, your site will be available at:
```
https://[your-username].github.io/[repository-name]/
```

For example: `https://danribes.github.io/pfm_solana_rust/`

### Configuration

The deployment workflow:
- Builds the `frontend/public` Next.js application
- Generates static files using Next.js export
- Deploys to GitHub Pages automatically on push to main branch

### Environment Variables

For GitHub Pages deployment, the following environment variables are automatically set:
- `NEXT_PUBLIC_BASE_PATH`: Set to repository name for proper asset paths
- `GITHUB_ACTIONS`: Enables static export mode

### Manual Deployment

To manually deploy:

1. Build the static site:
   ```bash
   cd frontend/public
   npm run build
   ```

2. The static files will be in the `out` directory

### Troubleshooting

**Common Issues:**

1. **404 errors**: Check that `basePath` is correctly set in `next.config.js`
2. **Asset loading issues**: Ensure `assetPrefix` matches your GitHub Pages URL
3. **Build failures**: Check the Actions tab for detailed error logs

**Local Testing:**

```bash
cd frontend/public
npm run build
npx serve out
```

### Multiple Frontend Deployment

If you want to deploy other frontends:

1. **Member Frontend**: Deploy to a subfolder by modifying the workflow
2. **Admin Frontend**: Same approach, different build path

Example for member frontend deployment:
```yaml
working-directory: ./frontend/member
```

### Production Deployment

For production deployment (not GitHub Pages):
- Use Docker with the existing `docker-compose.yml`
- Deploy to cloud platforms (AWS, Digital Ocean, etc.)
- Use the standalone output mode in `next.config.js`