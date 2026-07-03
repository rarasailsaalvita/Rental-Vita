# Image Management Guide

## How to Add Your Custom Images

### Cars Images (Location: `/images/cars/`)

Replace these placeholder paths with your own car images. The expected filenames are:

- **tesla.jpg** - Tesla Model S
- **bmw.jpg** - BMW M4 Competition  
- **audi.jpg** - Audi Q8
- **mercedes.jpg** - Mercedes-Benz E-Class

**Steps:**
1. Copy your car images to `public/images/cars/` folder
2. Rename them according to the filenames above
3. Recommended size: 800x600px
4. Supported formats: JPG, PNG, WebP

### Other Images (Location: `/images/other/`)

- **concierge.jpg** - Concierge/About section image
- **Recommended size:** 400x400px (square for profile image)

## Image URL Format

The app now uses local image paths instead of external URLs:

**Before:**
```
https://picsum.photos/seed/teslas/800/600
```

**After:**
```
/images/cars/tesla.jpg
```

## How to Edit Car Images in Admin Dashboard

1. Login as Admin (admin@gmail.com / admin123)
2. Go to Management Dashboard
3. Edit any car and update the image field with the path to your custom image
4. Save changes

## Troubleshooting

If images don't load:
- Check that image files are in the correct folder
- Verify filename spelling matches exactly (case-sensitive on Linux servers)
- Check image format is supported (JPG, PNG, WebP)
- Use browser developer tools (F12) to check for 404 errors
- Ensure Vite dev server is running with `npm run dev`

## Dynamic Image Upload (Optional)

To enable image uploads through the admin dashboard, contact development to add upload functionality.
