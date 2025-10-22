# Disable CAPTCHA in Clerk

## 🎯 **Quick Steps**

1. Go to https://dashboard.clerk.com
2. Select your application (sunny-moccasin-66)
3. **User & Authentication** → **Attack Protection**
4. **Bot Protection** → Toggle OFF or set to "Disabled"
5. **Save changes**
6. Refresh your app

**Result:** No CAPTCHA, faster sign-up flow ✅

---

## ⚠️ **Security Note**

Disabling CAPTCHA removes bot protection. Only do this if:
- You're in development/testing
- You have other anti-bot measures
- You're willing to accept the risk

For production, consider keeping it enabled.
