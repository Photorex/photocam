# 🔒 Security Deployment Checklist

## Pre-Deployment Steps (On Your Local Machine)

### 1. ✅ Verify All Security Files Exist
```bash
# Check webhook_server
ls -la webhook_server/security.js

# Check simcam security
ls -la simcam/app/lib/security/fileValidation.ts

# Check updated files
ls -la webhook_server/server.js
ls -la simcam/app/api/lora/train/route.ts
ls -la simcam/next.config.js
```

### 2. ✅ Git Status
```bash
cd c:\Users\machine\Desktop\dev\ggsel\photorend
git status
git add .
git commit -m "Security: Add comprehensive file upload validation and protection"
git push origin main
```

---

## Deployment Steps (On Ubuntu Server)

### 1. Backup Current System
```bash
# Stop services
pm2 stop all

# Backup
cd /var/www/simcam/photo
tar -czf backup-before-security-$(date +%Y%m%d).tar.gz webhook_server/ simcam/

# Move backup to safe location
mv backup-before-security-*.tar.gz ~/backups/
```

### 2. Pull Updates from GitHub
```bash
cd /var/www/simcam/photo
git stash  # Save any local changes
git pull origin main
git stash pop  # Restore local changes if needed
```

### 3. Install Dependencies (If Any New)
```bash
# webhook_server (no new dependencies)
cd webhook_server
npm install

# simcam (no new dependencies)
cd ../simcam
npm install
```

### 4. Rebuild Next.js
```bash
cd /var/www/simcam/photo/simcam
pm2 stop simcam
rm -rf .next
npm run build
```

### 5. Restart Services
```bash
pm2 restart webhook_server
pm2 restart simcam
pm2 save
```

### 6. Verify Services Are Running
```bash
pm2 status
pm2 logs webhook_server --lines 20
pm2 logs simcam --lines 20
```

---

## Post-Deployment Verification

### 1. Test File Upload Security

**Test 1: Valid Image (Should Succeed)**
```bash
# Create a test PNG
curl -X POST http://localhost:4000/service/webhook/test \
  -F "id_gen=testid123" \
  -F "image=@test-image.png"
```

**Test 2: SVG File (Should Be Rejected)**
```bash
# Try uploading SVG (should fail)
curl -X POST http://localhost:4000/service/webhook/test \
  -F "id_gen=testid123" \
  -F "image=@test.svg"
# Expected: "File type .svg not allowed"
```

**Test 3: Check Logs**
```bash
pm2 logs webhook_server | grep "Security"
# Should see: "🔒 Running security validation..."
```

### 2. Check for Malicious Files
```bash
# Find non-image files in uploads
find /var/www/simcam/photo/webhook_server/uploads -type f \
  ! -name "*.png" \
  ! -name "*.jpg" \
  ! -name "*.jpeg" \
  ! -name "*.webp" \
  -ls

# Should return empty or only legitimate files
```

### 3. Verify Logo Hasn't Been Compromised
```bash
cd /var/www/simcam/photo/simcam
git diff public/images/logo/Simcam.svg
# Should show no changes
```

### 4. Test Casino Redirect Is Fixed
- Open browser
- Navigate to your site
- Click on logo
- **Should NOT redirect to casino**
- Should go to home page

### 5. Monitor Logs
```bash
# Watch for security events
pm2 logs webhook_server --lines 50 | grep -E "(Security|validation|🚨|🔒)"

# Watch for errors
pm2 logs simcam --err --lines 20
```

---

## Rollback Procedure (If Something Goes Wrong)

### Quick Rollback
```bash
pm2 stop all

cd /var/www/simcam/photo

# Restore from backup
tar -xzf ~/backups/backup-before-security-*.tar.gz

# Rebuild
cd simcam
rm -rf .next
npm run build

# Restart
pm2 restart all
```

---

## Clean Up Previous Attack

### 1. Find and Remove Suspicious Files
```bash
# Check for SVG files
find /var/www/simcam/photo -name "*.svg" \
  -not -path "*/node_modules/*" \
  -not -path "*/public/images/*" \
  -not -path "*/public/assets/*" \
  -ls

# Check for recent unauthorized modifications
find /var/www/simcam/photo/simcam/public -type f -mtime -30 -ls

# Remove malicious files from uploads
find /var/www/simcam/photo/webhook_server/uploads -name "*.svg" -delete
find /var/www/simcam/photo/webhook_server/uploads -name "*.html" -delete
find /var/www/simcam/photo/webhook_server/uploads -name "*.js" -delete
```

### 2. Verify .next Build Is Clean
```bash
cd /var/www/simcam/photo/simcam
rm -rf .next
npm run build
```

### 3. Check for Compromised Logo
```bash
cd /var/www/simcam/photo/simcam

# Show current logo content
cat public/images/logo/Simcam.svg | head -n 10

# If compromised, restore from git
git checkout public/images/logo/Simcam.svg

# Verify it's clean
git diff public/images/logo/Simcam.svg
```

---

## Ongoing Monitoring

### Daily Checks
```bash
# Check for new suspicious files
find /var/www/simcam/photo/webhook_server/uploads \
  -type f -mtime -1 \
  ! -name "*.png" \
  ! -name "*.jpg" \
  ! -name "*.jpeg" \
  ! -name "*.webp"

# Check logs for security events
pm2 logs webhook_server --lines 100 | grep "🚨"
```

### Weekly Checks
```bash
# Verify git status
cd /var/www/simcam/photo/simcam
git status
git diff

# Check for large files (potential DoS)
find webhook_server/uploads -type f -size +20M
```

### Monthly Checks
```bash
# Full security audit
cd /var/www/simcam/photo

# Check all public files
find simcam/public -type f -mtime -30

# Verify database integrity
mongosh yourdb --eval "db.users.countDocuments()"
```

---

## Success Criteria

### ✅ Deployment Successful If:
- [ ] All PM2 processes show "online"
- [ ] Logs show "🔒 Running security validation..."
- [ ] No "🚨 Security" errors in logs
- [ ] Logo click goes to home page (NOT casino)
- [ ] Valid image uploads work normally
- [ ] SVG uploads are rejected
- [ ] No suspicious files in uploads directory
- [ ] `git diff` shows no unauthorized changes

### 🚨 Rollback If:
- [ ] Services won't start
- [ ] Valid uploads are being rejected
- [ ] Site is not accessible
- [ ] Errors in PM2 logs
- [ ] Logo still redirects to casino

---

## Emergency Contacts

**If casino redirect persists after deployment:**
1. Clear browser cache completely
2. Check if it's a browser extension causing the redirect
3. Verify nginx configuration hasn't been modified
4. Check `/etc/hosts` file for malicious entries
5. Run full malware scan on server

---

## Files Modified in This Security Update

### New Files Created:
- `webhook_server/security.js` - File validation utilities
- `simcam/app/lib/security/fileValidation.ts` - TypeScript validation
- `SECURITY_README.md` - Comprehensive documentation
- `SECURITY_DEPLOYMENT_CHECKLIST.md` - This file

### Files Modified:
- `webhook_server/server.js` - Added validation to all upload endpoints
- `simcam/app/api/lora/train/route.ts` - Added input validation
- `simcam/next.config.js` - Added security headers

### Total Changes:
- ~600 lines of security code added
- 3 webhook endpoints secured
- 1 API endpoint secured
- 8+ security measures implemented

---

**Ready to deploy? Follow the steps above carefully and monitor the logs!**
