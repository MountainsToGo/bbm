# GitHub Deployment Guide - Bogus Basin Interactive Map

## Prerequisites
- GitHub account (different from your current signed-in account)
- Git installed on your computer

---

## Step 1: Create a New GitHub Repository

1. **Sign out of your current GitHub account** (if signed in to browser)
2. **Sign in to the account** you want to use for hosting
3. Go to https://github.com/new
4. Create a new repository:
   - **Repository name:** `bbm` (or your preferred name)
   - **Description:** "Interactive learning map for Bogus Basin Ski Resort locations"
   - **Visibility:** 
     - ✅ **Public** (required for free GitHub Pages hosting)
     - Or Private (requires GitHub Pro for Pages)
   - ❌ **Do NOT** initialize with README, .gitignore, or license
5. Click **"Create repository"**

---

## Step 2: Prepare Your Local Files

### Option A: Using Command Line (Recommended)

Open PowerShell in `C:\Users\cbernier\BB` and run:

```powershell
# Initialize git repository
git init

# Configure git with the OTHER account's credentials
git config user.name "Your Name"
git config user.email "other-account@example.com"

# Add all files
git add learn.html location_manager.html bogus_basin_config.json location_names.js trail_map.png mobile_testing_guide.md

# Create initial commit
git commit -m "Initial commit: Bogus Basin Interactive Map"

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/bbm.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Desktop

1. Download and install **GitHub Desktop** from https://desktop.github.com/
2. Sign in with the **different GitHub account**
3. Click **File → Add Local Repository**
4. Browse to `C:\Users\cbernier\BB`
5. Click **"Create a repository"** if prompted
6. Select files to commit:
   - learn.html
   - location_manager.html
   - bogus_basin_config.json
   - location_names.js
   - trail_map.png
   - mobile_testing_guide.md
7. Write commit message: "Initial commit"
8. Click **"Commit to main"**
9. Click **"Publish repository"**
10. Choose the account and repository name
11. Click **"Publish Repository"**

---

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Scroll to **"Pages"** in the left sidebar
4. Under **"Source"**:
   - Select branch: `main`
   - Select folder: `/ (root)`
5. Click **"Save"**
6. Wait 1-2 minutes for deployment
7. Your site will be live at: `https://USERNAME.github.io/bbm/learn.html`

---

## Step 4: Create a Custom Landing Page (Optional)

Create an `index.html` file to redirect to `learn.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=learn.html">
    <title>Bogus Basin Interactive Map</title>
</head>
<body>
    <p>Redirecting to <a href="learn.html">Bogus Basin Interactive Map</a>...</p>
</body>
</html>
```

Then your site will work at: `https://USERNAME.github.io/bbm/`

---

## Step 5: Update Files Later

When you make changes:

```powershell
# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push
```

GitHub Pages will automatically update within 1-2 minutes.

---

## Handling Different GitHub Account

### Method 1: Use Git Credential Manager (Recommended)

When you first push, Windows will prompt for credentials. Enter the **other account's** credentials, and it will save them for this repository.

### Method 2: Use Personal Access Token

1. On GitHub (signed in as other account):
   - Go to **Settings → Developer settings → Personal access tokens → Tokens (classic)**
   - Click **"Generate new token (classic)"**
   - Give it a name: "Bogus Basin Map"
   - Check: `repo` (all repo permissions)
   - Click **"Generate token"**
   - **COPY THE TOKEN** (you won't see it again!)

2. When pushing, use token as password:
   ```powershell
   git push https://USERNAME:TOKEN@github.com/USERNAME/bbm.git main
   ```

### Method 3: Use SSH Key

1. Generate SSH key for the other account:
   ```powershell
   ssh-keygen -t ed25519 -C "other-account@example.com" -f ~/.ssh/id_ed25519_other
   ```

2. Add SSH key to GitHub:
   - Copy public key: `cat ~/.ssh/id_ed25519_other.pub`
   - Go to GitHub → Settings → SSH and GPG keys
   - Click **"New SSH key"**
   - Paste and save

3. Use SSH remote:
   ```powershell
   git remote set-url origin git@github.com:USERNAME/bbm.git
   ```

---

## Files to Include in Repository

✅ **Required:**
- `learn.html` - Main app
- `bogus_basin_config.json` - Location data
- `location_names.js` - Location names
- `trail_map.png` - Map image (15.5 MB)

✅ **Optional:**
- `location_manager.html` - Admin interface
- `mobile_testing_guide.md` - Documentation
- `README.md` - Project description

❌ **Exclude:**
- `BACKUP_*` folders
- `DEL_*` files
- `.DS_Store`, `Thumbs.db`

---

## Create a .gitignore File

Create `.gitignore` in your project folder:

```
# Backups
BACKUP_*/

# Temporary files
DEL_*
*.tmp
*.bak

# OS files
.DS_Store
Thumbs.db

# Python
__pycache__/
*.pyc
```

---

## Create a README.md

Create `README.md` for your repository:

```markdown
# Bogus Basin Interactive Map

An interactive learning tool for memorizing the locations of all lifts, runs, lodges, and terrain features at Bogus Basin Ski Resort.

## Features

- 🎿 **117 Locations** - All lifts, runs, and landmarks
- 📱 **Fully Responsive** - Works on phones, tablets, and desktops
- 🎯 **Auto-Zoom** - Automatically zoom to current location
- 🔍 **Zoom Controls** - Pan and zoom the map
- 📊 **Progress Tracking** - Track completed locations and streaks
- ⛷️ **Custom Cursors** - Ski and snowboard cursor options
- 🏷️ **Toggle Labels** - Show/hide location names

## Live Demo

Visit: [https://USERNAME.github.io/bbm/](https://USERNAME.github.io/bbm/)

## Local Development

1. Clone the repository
2. Run a local server:
   ```bash
   python -m http.server 8000
   ```
3. Open http://localhost:8000/learn.html

## Technology Stack

- HTML5 Canvas
- Vanilla JavaScript (ES6)
- CSS3 with responsive design
- No frameworks or dependencies

## License

MIT License - Feel free to use and modify!
```

---

## Troubleshooting

### Issue: "Permission denied" when pushing
**Solution:** You're still authenticated with the wrong account.
- Clear credentials: `git credential-wsl erase` or use Windows Credential Manager
- Re-authenticate when prompted

### Issue: GitHub Pages not updating
**Solution:** 
- Check Settings → Pages to confirm it's enabled
- Wait 2-5 minutes after push
- Hard refresh browser (Ctrl+Shift+R)
- Check Actions tab for build errors

### Issue: 404 on GitHub Pages
**Solution:**
- Ensure branch is `main` not `master`
- Check that `learn.html` is in root directory
- Verify repository is public

### Issue: Map image not loading
**Solution:**
- Confirm `trail_map.png` is committed and pushed
- Check file size (15.5 MB should be fine)
- GitHub has 100 MB file limit

---

## Quick Command Reference

```powershell
# Clone your repo
git clone https://github.com/USERNAME/bbm.git

# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Update message"

# Push to GitHub
git push

# Pull latest changes
git pull

# Check remote
git remote -v

# Switch accounts
git config user.name "Other Name"
git config user.email "other@email.com"
```

---

## Current Project Structure

```
C:\Users\cbernier\BB\
├── learn.html                  (Main app - 1,304 lines)
├── location_manager.html       (Admin interface)
├── bogus_basin_config.json     (117 locations)
├── location_names.js           (Location data)
├── trail_map.png              (15.5 MB map image)
├── mobile_testing_guide.md    (Testing guide)
├── BACKUP_20251015_110041/    (Latest backup)
└── [other backup folders]     (Don't commit these)
```

---

## Next Steps After Deployment

1. ✅ Test the live site on GitHub Pages
2. ✅ Test on actual mobile devices
3. ✅ Share the link with friends/family
4. ✅ Consider adding Google Analytics (optional)
5. ✅ Add custom domain (optional, requires DNS setup)

---

## Support

For issues with:
- **Git/GitHub:** https://docs.github.com/
- **GitHub Pages:** https://pages.github.com/
- **This project:** Open an issue on GitHub

---

**Ready to deploy?** Follow Steps 1-5 above! 🚀
