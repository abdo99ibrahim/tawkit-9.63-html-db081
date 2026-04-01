# Tawkit Debug & Testing Shortcuts

Use these commands in the browser console (**F12** -> **Console**) to manually trigger application states without waiting for the natural cycle.

---

## 🕋 Adhkar (أذكار)

### 1. Morning Adhkar (أذكار الصباح)
Triggers the full morning adhkar sequence.
```javascript
v9402763(v9389863, false, true);
```

### 2. Evening Adhkar (أذكار المساء)
Triggers the full evening adhkar sequence (for Asr, Maghrib, or Isha).
```javascript
v9402763(v9389963, false, false);
```

### 3. After-Prayer Adhkar (أذكار ما بعد الصلاة)
Triggers the general adhkar shown immediately after obligatory prayers.
```javascript
v9402763(v9364663, true, false);
```

### 4. 10 Minutes Adhkar (وضع الـ 10 دقائق)
Triggers the fixed image mode for Adhkar (configured for 10-minute display).
```javascript
v9333263();
```

---

## 🖼️ Slides & Display (الشرائح والعرض)

### 1. Test Slides (اختبار الشرائح)
Starts the rotating slides display.
```javascript
v9402463();
```

### 2. Fullscreen Mode (وضع ملء الشاشة)
Useful if the browser button is hidden or not responding.
```javascript
v9424563();
```

---

## ⚙️ App Control (التحكم في البرنامج)

### 1. Reload Configuration (إعادة تحميل الإعدادات)
```javascript
v9356363();
```

### 2. Clear All Settings (مسح جميع الإعدادات)
**Caution**: Use this to reset the app to factory defaults.
```javascript
ClearSETTINGS();
```
