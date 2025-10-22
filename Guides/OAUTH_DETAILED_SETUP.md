# Detailed OAuth Configuration Guide

This guide provides in-depth explanations for each step of configuring Google and LinkedIn OAuth authentication.

---

## Step 1: Enable OAuth Providers in Clerk Dashboard

### What This Step Does
This is the **first and easiest step**. You're telling Clerk which OAuth providers you want to support. Think of it as flipping a switch to enable the feature.

### Detailed Instructions

#### 1.1 Go to Clerk Dashboard
- **URL:** https://dashboard.clerk.com
- **What you'll see:** A dashboard with your applications listed
- **If you don't have an account:** Sign up first at https://clerk.com

#### 1.2 Select Your Application
- **Look for:** Your EduTrack AI application in the list
- **If you have multiple apps:** Make sure you select the correct one
- **What to expect:** You'll see the app's settings and configuration options

#### 1.3 Navigate to Social Connections
- **Path:** Click on the left sidebar → **User & Authentication** → **Social Connections**
- **What you'll see:** A list of available OAuth providers (Google, GitHub, LinkedIn, Microsoft, etc.)
- **Current state:** Most providers will show "Disabled" or "Not configured"

#### 1.4 Enable Google and LinkedIn
- **For Google:**
  - Find the **Google** option
  - Click the toggle or **Enable** button
  - You'll see a message: "Requires custom credentials" or similar
  - Don't worry - you'll add credentials in Step 2

- **For LinkedIn:**
  - Find the **LinkedIn** option
  - Click the toggle or **Enable** button
  - Same message about custom credentials

### Why This Matters
- Clerk needs to know which providers to support
- This enables the OAuth buttons in your sign-up form
- Without this, the OAuth flow won't work

### What You'll Get
- A list of enabled providers
- Instructions to add credentials for each
- Clerk's OAuth callback URL (you'll need this for Google and LinkedIn)

---

## Step 2: Configure Google OAuth

### What This Step Does
You're creating OAuth credentials in Google Cloud Console so that:
1. Google knows your app is legitimate
2. Users can authenticate with their Google account
3. Your app can receive user information from Google

### Part A: Google Cloud Console Setup

#### 2A.1 Go to Google Cloud Console
- **URL:** https://console.cloud.google.com
- **What you'll see:** Google's cloud platform dashboard
- **If you don't have an account:** Create a Google Cloud account (free tier available)

#### 2A.2 Create a New Project or Select Existing One
- **Option 1 - Create New Project:**
  - Click the project dropdown at the top
  - Click **New Project**
  - Enter name: `EduTrack AI` or `EduTrack AI OAuth`
  - Click **Create**
  - Wait for project to be created (30 seconds)

- **Option 2 - Use Existing Project:**
  - Click the project dropdown
  - Select your existing project
  - Make sure it's the right one

**Why:** Google organizes everything by projects. Each project has its own credentials and settings.

#### 2A.3 Navigate to APIs & Services → Credentials
- **Path:** Left sidebar → **APIs & Services** → **Credentials**
- **What you'll see:** A page with options to create credentials
- **Current state:** Likely empty if this is a new project

#### 2A.4 Click "Create Credentials" → "OAuth 2.0 Client ID"
- **Step 1:** Click the blue **+ Create Credentials** button
- **Step 2:** Select **OAuth 2.0 Client ID** from the dropdown
- **What happens:** Google will ask you to configure the OAuth consent screen first

#### 2A.5 Configure OAuth Consent Screen
This is where you tell Google about your application.

**What to fill in:**

| Field | Value | Explanation |
|-------|-------|-------------|
| **Application name** | `EduTrack AI` | What users will see when they authenticate |
| **User support email** | Your email | Where users can contact you with issues |
| **Authorized domains** | Your domain (e.g., `edutrack.com`) | Which domains are allowed to use this OAuth app |
| **Scopes** | `email`, `profile` | What user data you're requesting (minimal for privacy) |

**Important Notes:**
- **Scopes explained:**
  - `email` - Get user's email address
  - `profile` - Get user's name, picture, etc.
  - **Don't request more than needed** - Users will see what you're asking for
  - These two scopes are sufficient for sign-up

- **Authorized domains:**
  - For development: Use `localhost` or your dev domain
  - For production: Use your actual domain (e.g., `edutrack.ai`)
  - This prevents other apps from using your credentials

**After filling in:**
- Click **Save and Continue**
- You may see additional optional fields - you can skip these
- Click **Create** or **Done**

#### 2A.6 Create OAuth Client ID (Web Application)
After the consent screen is configured, you'll be back at the credentials page.

**Fill in these details:**

| Field | Value | Explanation |
|-------|-------|-------------|
| **Application type** | Web application | You're building a web app, not mobile or desktop |
| **Name** | `EduTrack AI Web Client` | Internal name to identify this credential |
| **Authorized redirect URIs** | `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback` | Where Google sends users after they authenticate |

**Important - Authorized Redirect URIs:**

This is **critical** - it must match exactly what Clerk expects.

1. Get the correct URL from Clerk:
   - Go to Clerk Dashboard
   - Navigate to **User & Authentication** → **Social Connections** → **Google**
   - Look for the callback URL (usually shows as a gray box)
   - Copy it exactly

2. Paste it in Google Cloud Console
3. Click **Add URI** if you need multiple (e.g., for dev and production)

**Example URLs:**
```
Development:  https://your-app-dev.clerk.accounts.dev/v1/oauth_callback
Production:   https://your-app.clerk.accounts.dev/v1/oauth_callback
```

**After filling in:**
- Click **Create**
- Google will show you a popup with your credentials

#### 2A.7 Copy Client ID and Client Secret
- **What you'll see:** A popup or page showing:
  - **Client ID** - A long string like `123456789-abc...xyz.apps.googleusercontent.com`
  - **Client Secret** - Another long string (keep this secret!)

**What to do:**
1. Copy the **Client ID** - paste it somewhere safe (notepad)
2. Copy the **Client Secret** - paste it somewhere safe (notepad)
3. Keep these private - never share or commit to git
4. You'll use these in the next part

**Security Note:**
- If you accidentally expose these, regenerate them immediately
- Never commit credentials to version control
- Use environment variables in production

---

### Part B: Add Google Credentials to Clerk

#### 2B.1 Go to Clerk Dashboard → Social Connections → Google
- **Path:** Clerk Dashboard → **User & Authentication** → **Social Connections** → **Google**
- **What you'll see:** A form asking for credentials

#### 2B.2 Click "Use Custom Credentials"
- **What this means:** Instead of Clerk's default credentials, you're providing your own
- **Why:** This gives you full control over the OAuth app

#### 2B.3 Paste Client ID and Client Secret
- **Field 1:** Paste your **Client ID** from Google
- **Field 2:** Paste your **Client Secret** from Google
- **Double-check:** Make sure there are no extra spaces or characters

#### 2B.4 Save Changes
- Click the **Save** or **Update** button
- **What happens:** Clerk will verify the credentials
- **If successful:** You'll see a green checkmark or success message
- **If failed:** Check that you copied the credentials correctly

**Troubleshooting:**
- **"Invalid credentials"** - Credentials are wrong or expired
  - Solution: Go back to Google Cloud Console and regenerate
- **"Redirect URI mismatch"** - The callback URL doesn't match
  - Solution: Check that the redirect URI in Google matches Clerk's exactly

---

## Step 3: Configure LinkedIn OAuth

### What This Step Does
Similar to Google, you're creating OAuth credentials in LinkedIn's Developer Portal so users can sign up with their LinkedIn account.

### Part A: LinkedIn Developer Portal Setup

#### 3A.1 Go to LinkedIn Developers
- **URL:** https://www.linkedin.com/developers
- **What you'll see:** LinkedIn's developer portal
- **If you don't have an account:** You'll need a LinkedIn account (create one if needed)

#### 3A.2 Click "Create App"
- **What you'll see:** A form to create a new LinkedIn app
- **What to fill in:**

| Field | Value | Explanation |
|-------|-------|-------------|
| **App name** | `EduTrack AI` | Name of your application |
| **LinkedIn Page** | Your company page | Your LinkedIn company page (required) |
| **App logo** | Your logo | Upload your app's logo (128x128 px) |
| **Privacy policy URL** | Your privacy policy | Link to your privacy policy |
| **Terms of service URL** | Your terms | Link to your terms of service |

**Important Notes:**
- **LinkedIn Page:** You need a LinkedIn company page to create an app
  - If you don't have one, create it first at https://www.linkedin.com/company/
  - It takes a few minutes to set up
- **Logo:** Should be square and at least 128x128 pixels
- **Privacy Policy & Terms:** Required for production apps

#### 3A.3 Complete the Application
- Fill in all required fields
- Accept LinkedIn's terms
- Click **Create app**
- **What happens:** LinkedIn creates your app and shows you the settings page

#### 3A.4 Navigate to "Auth" Tab
- **What you'll see:** OAuth configuration options
- **Look for:** 
  - **Client ID** - Already generated by LinkedIn
  - **Client Secret** - Already generated by LinkedIn
  - **Authorized redirect URLs** - Where you'll add your Clerk callback URL

#### 3A.5 Add Authorized Redirect URLs
This is **critical** - LinkedIn will only accept authentication from these URLs.

**Steps:**
1. Find the **Authorized redirect URLs** section
2. Click **Add redirect URL** or similar button
3. Paste the Clerk callback URL:
   ```
   https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback
   ```
4. Get this URL from Clerk Dashboard:
   - Go to **User & Authentication** → **Social Connections** → **LinkedIn**
   - Copy the callback URL shown there

**Example:**
```
https://edutrack-ai.clerk.accounts.dev/v1/oauth_callback
```

5. Click **Add** or **Save**
6. You can add multiple URLs (e.g., for dev and production)

#### 3A.6 Request Access to "Sign In with LinkedIn" Product
This is a LinkedIn requirement - you need to request access to the Sign In product.

**Steps:**
1. Look for a section called **Products** or **Requested access**
2. Click **Request access** or **+ Add product**
3. Find and select **Sign In with LinkedIn**
4. Click **Request**
5. **What happens:** LinkedIn will review your request (usually instant for legitimate apps)

**Why this step:**
- LinkedIn wants to ensure apps using their OAuth are legitimate
- It's a security measure to prevent abuse
- Usually approved immediately

#### 3A.7 Copy Client ID and Client Secret
- **What you'll see:** On the Auth tab, your credentials are displayed
- **Client ID** - A string like `1234567890abcdef`
- **Client Secret** - A string (keep this secret!)

**What to do:**
1. Copy the **Client ID** - paste it somewhere safe
2. Copy the **Client Secret** - paste it somewhere safe
3. Keep these private - never share or commit to git

---

### Part B: Add LinkedIn Credentials to Clerk

#### 3B.1 Go to Clerk Dashboard → Social Connections → LinkedIn
- **Path:** Clerk Dashboard → **User & Authentication** → **Social Connections** → **LinkedIn**
- **What you'll see:** A form asking for credentials

#### 3B.2 Click "Use Custom Credentials"
- **What this means:** You're providing your own LinkedIn OAuth credentials
- **Why:** Full control over the OAuth app

#### 3B.3 Paste Client ID and Client Secret
- **Field 1:** Paste your **Client ID** from LinkedIn
- **Field 2:** Paste your **Client Secret** from LinkedIn
- **Double-check:** No extra spaces or characters

#### 3B.4 Save Changes
- Click **Save** or **Update**
- **What happens:** Clerk verifies the credentials
- **If successful:** Green checkmark or success message
- **If failed:** Check credentials are correct

---

## Summary Table

| Step | What | Where | Why |
|------|------|-------|-----|
| **1** | Enable providers | Clerk Dashboard | Tells Clerk which OAuth providers to support |
| **2A** | Create Google OAuth app | Google Cloud Console | Get credentials from Google |
| **2B** | Add Google to Clerk | Clerk Dashboard | Connect Google credentials to your app |
| **3A** | Create LinkedIn OAuth app | LinkedIn Developer Portal | Get credentials from LinkedIn |
| **3B** | Add LinkedIn to Clerk | Clerk Dashboard | Connect LinkedIn credentials to your app |

---

## Key Concepts Explained

### What is OAuth?
- **OAuth** = Open Authorization
- Allows users to sign in using existing accounts (Google, LinkedIn, etc.)
- Users don't share passwords with your app
- More secure and faster than traditional sign-up

### What is a Redirect URI?
- **Redirect URI** = Where the provider sends users after authentication
- Must be exact match (including `https://`, domain, path)
- Prevents attackers from redirecting users to malicious sites
- Clerk provides the exact URL you need

### What is Client ID and Client Secret?
- **Client ID** = Public identifier for your app
- **Client Secret** = Private key (like a password) - keep it secret!
- Together they prove your app is legitimate
- Never expose Client Secret in frontend code

### What are Scopes?
- **Scopes** = Permissions you're requesting
- `email` = Access to user's email
- `profile` = Access to user's name, picture, etc.
- Request only what you need (privacy best practice)

---

## Common Issues and Solutions

### Issue: "Redirect URI mismatch"
**Cause:** The callback URL in Google/LinkedIn doesn't match what Clerk expects

**Solution:**
1. Go to Clerk Dashboard
2. Copy the exact callback URL shown
3. Paste it exactly in Google Cloud Console / LinkedIn Developer Portal
4. Check for typos, extra spaces, or different protocols (http vs https)

### Issue: "Invalid credentials"
**Cause:** Client ID or Client Secret is wrong

**Solution:**
1. Go back to Google Cloud Console / LinkedIn Developer Portal
2. Verify you copied the correct credentials
3. If unsure, regenerate new credentials
4. Paste the new ones into Clerk

### Issue: "App not approved" (LinkedIn)
**Cause:** You haven't requested access to Sign In with LinkedIn product

**Solution:**
1. Go to LinkedIn Developer Portal
2. Find your app
3. Look for "Products" section
4. Request access to "Sign In with LinkedIn"
5. Wait for approval (usually instant)

### Issue: OAuth button doesn't work
**Cause:** Credentials not properly configured in Clerk

**Solution:**
1. Check that both Google and LinkedIn are enabled in Clerk
2. Verify credentials are saved (look for green checkmarks)
3. Check browser console for error messages
4. Clear browser cache and try again

---

## Testing Your Setup

### Test Google OAuth
1. Go to your sign-up page: `http://localhost:3000/sign-up`
2. Click **"Continue with Google"**
3. You should be redirected to Google login
4. Sign in with your Google account
5. You should be redirected back to your app
6. Check that user was created in database

### Test LinkedIn OAuth
1. Go to your sign-up page: `http://localhost:3000/sign-up`
2. Click **"Continue with LinkedIn"**
3. You should be redirected to LinkedIn login
4. Sign in with your LinkedIn account
5. You should be redirected back to your app
6. Check that user was created in database

### If Tests Fail
1. Check browser console for error messages
2. Check Clerk Dashboard for error logs
3. Verify redirect URIs are correct
4. Verify credentials are saved in Clerk
5. Try incognito/private browsing (clears cache)

---

## Security Best Practices

### Do's ✅
- Keep Client Secret private
- Use environment variables for credentials
- Regularly rotate credentials
- Use HTTPS in production
- Request minimal scopes
- Validate redirect URIs

### Don'ts ❌
- Don't commit credentials to git
- Don't expose Client Secret in frontend code
- Don't request unnecessary scopes
- Don't use HTTP in production
- Don't share credentials with team members
- Don't use same credentials for dev and production

---

## Next Steps

After completing all steps:
1. Test OAuth flow on your sign-up page
2. Verify users are created in database
3. Check that role selection works
4. Test profile setup flow
5. Deploy to production with production credentials

---

**Last Updated:** 2025-01-22  
**Version:** 1.0.0
