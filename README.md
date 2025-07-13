# Academic Attendance Tracker

A modern web application to track academic attendance using AI-powered PDF analysis and manual entry.

## Features

- **PDF Calendar Analysis**: Upload academic calendar PDFs to automatically extract working days
- **Manual Entry**: Enter working days and classes per day manually
- **Attendance Calculation**: Calculate current attendance percentage and classes needed to reach targets
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Static Deployment**: Can be deployed on Netlify, Vercel, or any static hosting service

## Quick Start

### Option 1: Deploy to Netlify (Recommended)

1. **Fork this repository** to your GitHub account
2. **Go to [Netlify](https://netlify.com)** and sign up/login
3. **Click "New site from Git"**
4. **Choose your forked repository**
5. **Set build settings:**
   - Build command: Leave empty (not needed for static site)
   - Publish directory: `static`
6. **Click "Deploy site"**

Your attendance tracker will be live in minutes!

### Option 2: Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Skipster.git
   cd Skipster
   ```

2. **Open the static folder:**
   ```bash
   cd static
   ```

3. **Serve locally:**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Open your browser** and go to `http://localhost:8000`

## How to Use

### 1. PDF Calendar Upload
- Click "Choose PDF file" or drag and drop your academic calendar
- The app will analyze the PDF and extract working days
- Review the extracted information and confidence score

### 2. Manual Entry (Alternative)
- If you don't have a PDF or prefer manual entry
- Enter total working days and classes per day
- Enter your attended classes count

### 3. Calculate Attendance
- Enter how many classes you've attended
- Set your target attendance percentage (default: 75%)
- Click "Calculate Required Attendance"
- View your current attendance and classes needed to reach your goal

## File Structure

```
static/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Client-side functionality
- **PDF.js**: Browser-based PDF text extraction
- **Font Awesome**: Icons
- **Local Storage**: Data persistence

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Features in Detail

### PDF Analysis
- Extracts text from academic calendar PDFs
- Identifies working days using pattern matching
- Provides confidence scores for accuracy
- Supports drag-and-drop file upload

### Attendance Tracking
- Calculates current attendance percentage
- Shows classes needed to reach target percentage
- Displays remaining classes
- Provides goal status and recommendations

### Data Persistence
- Saves extracted data in browser local storage
- Remembers your settings between sessions
- No server required - everything runs locally

## Customization

### Colors
Edit `styles.css` to change the color scheme:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #48bb78;
  --danger-color: #f56565;
}
```

### Target Percentage
Change the default target attendance percentage in `script.js`:
```javascript
const targetPercentage = 75; // Change this value
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Ensure your PDF is readable and contains academic calendar information
3. Try the manual entry option as an alternative
4. Open an issue on GitHub with details

## Roadmap

- [ ] Export attendance data to CSV
- [ ] Import attendance records
- [ ] Multiple semester support
- [ ] Attendance history tracking
- [ ] Mobile app version
- [ ] Offline functionality improvements

---

**Note**: This is a static version that works entirely in your browser. No server or API keys required! 