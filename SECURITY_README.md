# Security Implementation Guide

## 🔒 Security Fixes Applied

This document outlines the comprehensive security measures implemented to protect against file upload attacks, path traversal, XSS, and other vulnerabilities.

---

## ✅ Implemented Security Measures

### 1. File Upload Validation (webhook_server)

**Location:** `webhook_server/security.js`

**Protections:**
- ✅ **File Type Whitelist**: Only allows `.png`, `.jpg`, `.jpeg`, `.webp`
- ✅ **Magic Byte Validation**: Verifies file contents match declared type
- ✅ **MIME Type Validation**: Checks Content-Type headers
- ✅ **File Size Limits**: 20MB per file, prevents DoS attacks
- ✅ **Path Traversal Prevention**: Sanitizes all file paths and IDs
- ✅ **Input Sanitization**: Validates userId, id_gen, and all user inputs

**Applied to:**
- `/service/webhook/lora/image` - LORA training results
- `/service/webhook/gen/image` - Generated image uploads
- `/service/webhook/skin/default/image` - Model default images

**What This Prevents:**
- ❌ SVG files with embedded JavaScript
- ❌ Executable files (.exe, .sh, .bin)
- ❌ HTML files with redirects
- ❌ Path traversal attacks (../../etc/passwd)
- ❌ File size bombs
- ❌ MIME type spoofing

---

### 2. File Upload Validation (simcam API)

**Location:** `simcam/app/lib/security/fileValidation.ts`

**Protections:**
- ✅ **TypeScript Type Safety**: Strong typing for all validation functions
- ✅ **Client-Side Validation**: Validates files before upload
- ✅ **Batch Upload Validation**: Checks total size for multiple files (200MB limit)
- ✅ **Field Sanitization**: Validates and sanitizes all form inputs

**Applied to:**
- `/api/lora/train` - Model training photo uploads (10 photos)

**What This Prevents:**
- ❌ Malicious files disguised as images
- ❌ Oversized uploads causing memory exhaustion
- ❌ SQL injection through model names
- ❌ XSS through unsanitized inputs

---

### 3. Security Headers

**Location:** `simcam/next.config.js`

**Headers Applied:**
```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: (specific for user uploads)
```

**What This Prevents:**
- ❌ Clickjacking attacks
- ❌ MIME sniffing vulnerabilities
- ❌ XSS attacks
- ❌ Information leakage through referrers
- ❌ Unauthorized camera/microphone access

---

### 4. Path Traversal Protection

**All file operations now validate paths to ensure they stay within allowed directories.**

**Example Attack Prevented:**
```javascript
// ❌ BEFORE (VULNERABLE):
userId = "../../var/www/simcam/public/images/logo"
id_gen = "Simcam"
// Result: Overwrites logo file

// ✅ AFTER (PROTECTED):
// Validation rejects userId with "../" patterns
// Error: "Path traversal detected"
```

---

## 🚨 Attack Scenarios Prevented

### Scenario 1: Malicious SVG Upload
**Before:**
1. Attacker uploads SVG with embedded `<script>` tag
2. File saved as `.svg` without validation
3. When image loads in browser, JavaScript executes
4. Redirect to casino site or steal session tokens

**Now:**
- ✅ SVG files are **completely blocked**
- ✅ Only PNG, JPG, WEBP allowed
- ✅ Magic bytes verified - file must be real image

---

### Scenario 2: Path Traversal Attack
**Before:**
```javascript
POST /webhook/lora/image
id_gen: ../../../../public/images/logo/Simcam.svg
file: malicious_redirect.svg
```

**Now:**
- ✅ ID sanitization rejects "../" patterns
- ✅ Path validation ensures file stays in user folder
- ✅ Error returned, malicious file deleted

---

### Scenario 3: MIME Type Spoofing
**Before:**
```http
Content-Type: image/png
[Actual file: executable malware]
```

**Now:**
- ✅ MIME type checked against whitelist
- ✅ **Magic bytes validated** - file content must match
- ✅ If mismatch detected, file rejected

---

### Scenario 4: File Size Bomb
**Before:**
- Attacker uploads 500MB file
- Server runs out of memory
- DoS attack successful

**Now:**
- ✅ 20MB per file limit
- ✅ 200MB total batch upload limit
- ✅ File rejected before processing

---

## 📋 Validation Flow

### Webhook Server (External Uploads)
```
1. Check Content-Type header
2. Validate file extension (whitelist)
3. Sanitize id_gen and userId
4. Stream file to temp location
5. ⚠️ CRITICAL: Validate magic bytes
6. ⚠️ CRITICAL: Check file size
7. ⚠️ CRITICAL: Validate path safety
8. Move to final location
9. Update database
10. Cleanup temp files if validation fails
```

### Simcam API (User Uploads)
```
1. Extract FormData
2. Validate field count and types
3. Sanitize all input fields
4. Convert to File objects
5. ⚠️ CRITICAL: Validate each file
   - Check MIME type
   - Check extension
   - Check size
   - Validate magic bytes
6. Check total batch size
7. Send to external API (already validated)
```

---

## 🔧 Configuration

### File Size Limits
```javascript
// webhook_server/security.js
MAX_FILE_SIZE = 20MB          // Per file
MAX_VIDEO_SIZE = 100MB        // For videos

// simcam/app/lib/security/fileValidation.ts
MAX_FILE_SIZE = 20MB          // Per file
MAX_TOTAL_SIZE = 200MB        // Batch total
```

### Allowed File Types
```javascript
ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']
ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']

// ❌ BLOCKED: .svg, .gif, .bmp, .tiff, .html, .js, .exe, etc.
```

---

## 🔍 Security Checklist

### Before Deploying:

- [ ] Verify `webhook_server/security.js` exists
- [ ] Verify `simcam/app/lib/security/fileValidation.ts` exists
- [ ] Check `next.config.js` has security headers
- [ ] Test file upload with:
  - [ ] Valid PNG (should succeed)
  - [ ] Valid JPG (should succeed)
  - [ ] SVG file (should be rejected)
  - [ ] Renamed .exe to .png (should be rejected via magic bytes)
  - [ ] File with "../" in filename (should be rejected)
  - [ ] 25MB file (should be rejected)

### After Deploying:

- [ ] Check PM2 logs for "🔒 Running security validation..."
- [ ] Verify uploaded files are only images
- [ ] Check nginx/server headers include security headers
- [ ] Test that existing images still load correctly
- [ ] Monitor for "🚨 Security:" messages in logs

---

## 🚨 Emergency Procedures

### If Malicious File Detected:

1. **Immediately stop webhook_server:**
   ```bash
   pm2 stop webhook_server
   ```

2. **Find malicious files:**
   ```bash
   cd /var/www/simcam/photo
   find webhook_server/uploads -type f -mtime -1 -ls
   find webhook_server/uploads -name "*.svg" -delete
   find webhook_server/uploads -name "*.html" -delete
   find webhook_server/uploads -name "*.js" -delete
   ```

3. **Check for path traversal:**
   ```bash
   find simcam/public -type f -mtime -1 -ls
   git diff simcam/public/
   ```

4. **Restore clean logo:**
   ```bash
   cd simcam
   git checkout public/images/logo/Simcam.svg
   ```

5. **Rebuild and restart:**
   ```bash
   pm2 stop simcam
   rm -rf simcam/.next
   cd simcam && npm run build
   pm2 start webhook_server
   pm2 start simcam
   ```

---

## 📊 Monitoring

### Key Log Messages

**✅ Success:**
```
🔒 Running security validation...
✅ Security validation passed
✅ All images validated successfully
```

**🚨 Security Events:**
```
🚨 Security: Rejected file type .svg
🚨 Security: File validation failed
🚨 Security: Path traversal detected
🚨 Image validation failed
```

### Monitor These:
```bash
# Webhook server logs
pm2 logs webhook_server | grep "Security"

# Simcam logs
pm2 logs simcam | grep "validation"

# Check for suspicious files
find webhook_server/uploads -type f ! -name "*.png" ! -name "*.jpg" ! -name "*.jpeg" ! -name "*.webp"
```

---

## 🔐 Additional Recommendations

### 1. Nginx Configuration (If Serving Files Directly)

Add to nginx config:
```nginx
# Serve user uploads with security headers
location /user-uploads/ {
    add_header Content-Security-Policy "default-src 'none'; img-src 'self'; style-src 'unsafe-inline';" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Content-Disposition "inline" always;
    
    # Never serve as executable
    types {
        image/png png;
        image/jpeg jpg jpeg;
        image/webp webp;
    }
    default_type image/png;
}
```

### 2. MongoDB Security

Ensure MongoDB is not publicly accessible:
```bash
# Check bindIp is localhost
grep bindIp /etc/mongod.conf
# Should show: bindIp: 127.0.0.1
```

### 3. Firewall Rules

```bash
# Only allow necessary ports
sudo ufw status
# Should show: 22 (SSH), 80 (HTTP), 443 (HTTPS)
# Block: 27017 (MongoDB), 4000 (webhook internal)
```

### 4. Regular Security Audits

```bash
# Weekly: Scan for suspicious files
find webhook_server/uploads -type f ! \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \)

# Monthly: Check for large files
find webhook_server/uploads -type f -size +20M

# Check git status for unauthorized changes
cd /var/www/simcam/photo/simcam
git status
git diff
```

---

## 📝 Code Examples

### How to Add Validation to New Endpoint

```typescript
// Import security functions
import { validateImageFile, sanitizeId } from "@/app/lib/security/fileValidation";

export async function POST(req: Request) {
  const formData = await req.formData();
  
  // Sanitize IDs
  const userIdValidation = sanitizeId(userId, 'userId');
  if (!userIdValidation.valid) {
    return NextResponse.json({ error: userIdValidation.error }, { status: 400 });
  }
  
  // Validate file
  const file = formData.get('file') as File;
  const validation = await validateImageFile(file);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  
  // Process validated file...
}
```

---

## 🆘 Support

If you encounter security issues:

1. **Check logs first:**
   ```bash
   pm2 logs webhook_server --lines 100 | grep Security
   ```

2. **Verify files exist:**
   ```bash
   ls -la webhook_server/security.js
   ls -la simcam/app/lib/security/fileValidation.ts
   ```

3. **Test validation manually:**
   ```bash
   cd webhook_server
   node -e "const {validateFileExtension} = require('./security'); console.log(validateFileExtension('test.svg'))"
   ```

---

## 📚 References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- File Upload Security: https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload
- Path Traversal: https://owasp.org/www-community/attacks/Path_Traversal
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

---

**Last Updated:** January 2026
**Security Level:** ✅ HARDENED
