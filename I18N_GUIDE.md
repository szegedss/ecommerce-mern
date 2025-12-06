# 🌐 Multi-Language Support (i18n) - ไทย & English

## Overview

เว็บไซต์ Pet Paradise ขณะนี้รองรับ 2 ภาษา:
- **ไทย (TH)** - Default language
- **English (EN)**

---

## วิธีการใช้

### สำหรับ Users

1. **Language Switcher** อยู่ที่ Navbar ด้านบน
2. Click button ของภาษาที่ต้องการ:
   - 🇹🇭 ไทย (th)
   - en English (en)
3. ภาษาจะเปลี่ยนทันที ทั้งหมด UI และเก็บใน localStorage

---

## สำหรับ Developers

### Project Structure

```
frontend/src/
├── i18n.js                      # i18n configuration
├── locales/
│   ├── th.json                 # Thai translations
│   └── en.json                 # English translations
├── components/
│   ├── LanguageSwitcher.jsx    # Language switcher UI
│   └── Navbar.jsx              # Updated with i18n
└── main.jsx                     # Import i18n
```

### การใช้ i18n ใน Components

#### Basic Usage - useTranslation Hook

```jsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('common.home')}</h1>
      <p>{t('messages.welcome')}</p>
      
      {/* Get current language */}
      <p>Current Language: {i18n.language}</p>
      
      {/* Change language */}
      <button onClick={() => i18n.changeLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

#### With Interpolation (Dynamic Values)

```jsx
// In JSON file:
{
  "greeting": "Hello, {{name}}"
}

// In component:
{t('greeting', { name: 'John' })}
// Output: "Hello, John"
```

#### Nested Keys

```jsx
{t('navigation.home')}        // "หน้าแรก" (Thai) or "Home" (English)
{t('auth.invalidCredentials')} // "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
```

---

## การเพิ่มข้อความใหม่

### Step 1: เพิ่มใน JSON Files

```json
// src/locales/th.json
{
  "newSection": {
    "newKey": "ข้อความภาษาไทย"
  }
}

// src/locales/en.json
{
  "newSection": {
    "newKey": "English text"
  }
}
```

### Step 2: ใช้ใน Component

```jsx
{t('newSection.newKey')}
```

---

## Translation Keys Hierarchy

### Common
- `common.home` - หน้าแรก / Home
- `common.products` - สินค้า / Products
- `common.cart` - ตะกร้า / Cart
- `common.login` - เข้าสู่ระบบ / Login
- `common.logout` - ออกจากระบบ / Logout
- `common.admin` - ผู้ดูแลระบบ / Admin

### Navigation
- `navigation.home`
- `navigation.shop`
- `navigation.categories`

### Authentication
- `auth.login`
- `auth.register`
- `auth.email`
- `auth.password`
- `auth.invalidCredentials`

### Products
- `products.allProducts`
- `products.featured`
- `products.addToCart`
- `products.inStock`
- `products.outOfStock`

### Cart & Checkout
- `cart.shoppingCart`
- `cart.empty`
- `cart.total`
- `checkout.shippingAddress`
- `checkout.paymentMethod`

### Admin
- `admin.dashboard`
- `admin.categories`
- `admin.users`
- `admin.totalUsers`

### Messages
- `messages.welcome`
- `messages.success`
- `messages.error`
- `messages.confirmDelete`

---

## Components ที่ใช้ i18n

### ✅ Updated
- `Navbar.jsx` - Navigation with language switcher
- `LanguageSwitcher.jsx` - Language selector button

### 🔄 Need Update
- `LoginForm.jsx` - Form labels and messages
- `RegisterForm.jsx` - Form labels and messages
- `ProductGrid.jsx` - Product related text
- `Cart.jsx` - Cart labels and messages
- `Checkout.jsx` - Checkout form labels
- `Payment.jsx` - Payment related text
- `Home.jsx` - Home page content
- `AdminDashboard.jsx` - Admin dashboard labels

### How to Update

```jsx
// Before (hardcoded)
<button>Login</button>
<label>Email</label>

// After (translated)
import { useTranslation } from 'react-i18next';

export default function LoginForm() {
  const { t } = useTranslation();

  return (
    <>
      <button>{t('auth.login')}</button>
      <label>{t('auth.email')}</label>
    </>
  );
}
```

---

## Storage & Persistence

### Default Language
- ไทย (TH) - กำหนดไว้ใน `i18n.js`
  ```javascript
  fallbackLng: 'th'
  ```

### User's Language Choice
- บันทึกใน **localStorage** เพื่อให้จำการตั้งค่า
  ```javascript
  localStorage.setItem('i18nextLng', 'en');
  ```

### Auto Detection
- ตรวจจับจาก browser settings (ถ้ามีการตั้งค่า)
- หลังจากนั้นใช้ localStorage
- ถ้าไม่มี ใช้ fallback (Thai)

---

## Advanced Usage

### Conditional Rendering based on Language

```jsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { i18n } = useTranslation();

  if (i18n.language === 'th') {
    return <p>แสดงเนื้อหาพิเศษสำหรับไทย</p>;
  } else {
    return <p>Show special content for English</p>;
  }
}
```

### Plural Forms

```jsx
// Not yet implemented, but can add:
{t('items', { count: 5 })}
// Thai: 5 รายการ
// English: 5 items
```

### Date & Number Formatting

```jsx
// Can integrate with i18next-icu for complex formatting
new Intl.DateTimeFormat('th-TH').format(new Date());
new Intl.NumberFormat('th-TH').format(1234.56);
```

---

## Testing

### Testing with Different Languages

```javascript
// In test files
import { useTranslation } from 'react-i18next';

it('should display Thai text', () => {
  i18n.changeLanguage('th');
  const { getByText } = render(<MyComponent />);
  expect(getByText('ไทย')).toBeInTheDocument();
});

it('should display English text', () => {
  i18n.changeLanguage('en');
  const { getByText } = render(<MyComponent />);
  expect(getByText('Thai')).toBeInTheDocument();
});
```

---

## Browser Support

Works on all modern browsers:
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile browsers
- ✅ localStorage support required

---

## Performance Tips

1. **Lazy Load Translations** (ถ้ามีภาษาเยอะ)
   ```javascript
   import HttpBackend from 'i18next-http-backend';
   i18n.use(HttpBackend).init({ ... });
   ```

2. **Namespace Splitting** (ไฟล์ใหญ่ขึ้น)
   ```json
   {
     "common": { ... },
     "admin": { ... },
     "products": { ... }
   }
   ```

3. **Memoize Translated Components**
   ```jsx
   const MyComponent = React.memo(({ text }) => {
     const { t } = useTranslation();
     return <div>{t(text)}</div>;
   });
   ```

---

## Future Enhancements

- [ ] Add more languages (Vietnamese, Chinese, Japanese)
- [ ] Add RTL support (Arabic, Hebrew)
- [ ] Professional translation service integration
- [ ] SEO optimization for multi-language
- [ ] Automatic language detection from URL
- [ ] Language-specific routing

---

## Useful Commands

```bash
# Check for missing translations
npm run i18n:validate

# Extract strings for translation
npm run i18n:extract

# Generate translation report
npm run i18n:report
```

---

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Guide](https://react.i18next.com/)
- [i18next Browser Detector](https://github.com/i18next/i18next-browser-languagedetector)

---

## Next Steps

1. ✅ Basic i18n setup complete
2. ⏳ Update all components to use `useTranslation()`
3. ⏳ Test on all pages
4. ⏳ Deploy to production
5. ⏳ Monitor for missing translations

---

**Happy Multi-Language Support! 🌍**
