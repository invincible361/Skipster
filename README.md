# Academic Attendance Tracker

A comprehensive web application for tracking academic attendance, managing class schedules, and calculating attendance goals. The application uses AI-powered PDF processing to extract academic calendars and timetables, providing accurate working day calculations.

## Features

### 📅 Academic Calendar Processing
- Upload academic calendar PDFs
- AI-powered text extraction and analysis
- Automatic event detection and date parsing
- Working day calculation from calendar data
- Import extracted events to your personal calendar

### 🕐 Class Timetable Processing
- Upload class timetable PDFs
- Extract weekly class schedules
- Identify working days from timetable
- Visual weekly schedule display
- Import timetable events to calendar

### 🔄 Combined Processing
- Process both calendar and timetable PDFs together
- Compare working days from both sources
- Calculate accurate total working days
- Combined confidence scoring
- Import all events from both sources

### 📊 Attendance Tracking
- Mark attendance for each class
- Track present, absent, and late status
- Calculate attendance percentages
- Set attendance goals
- Monitor progress towards targets

### 🎯 Goal Setting
- Set target attendance percentages
- Visual progress tracking
- Calculate classes needed to reach goals
- Streak tracking and statistics

### 📈 Analytics & Reporting
- Attendance statistics and trends
- Export/import functionality
- Data persistence using localStorage
- Responsive design for all devices

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **OpenAI GPT-3.5-turbo**: AI-powered text analysis
- **PyPDF2 & pdfplumber**: PDF text extraction
- **Pytesseract**: OCR for image-based PDFs
- **Uvicorn**: ASGI server

### Frontend
- **HTML5 & CSS3**: Modern responsive design
- **Vanilla JavaScript**: No framework dependencies
- **Font Awesome**: Icons
- **Google Fonts**: Typography

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js (optional, for development)

### Backend Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd Attendence
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Create config.env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > config.env
```

4. Run the backend:
```bash
python3 run_backend.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup
The frontend is served directly by the FastAPI backend. Simply open `http://localhost:8000` in your browser.

## Usage

### 1. Upload Academic Calendar
1. Navigate to the "Upload Academic Calendar" section
2. Select your academic calendar PDF file
3. Click "Process Calendar" to extract events and working days
4. Review the extracted information
5. Click "Import to Calendar" to add events to your schedule

### 2. Upload Class Timetable
1. Navigate to the "Upload Class Timetable" section
2. Select your timetable PDF file
3. Click "Process Timetable" to extract class schedules
4. View the weekly schedule grid
5. Click "Import to Calendar" to add classes to your schedule

### 3. Combined Processing
1. Navigate to the "Combined Processing" section
2. Upload both calendar and timetable PDFs
3. Click "Process Both Files" for comprehensive analysis
4. Compare working days from both sources
5. Click "Import All Events" to add everything to your calendar

### 4. Track Attendance
1. Add classes to your calendar (manually or via import)
2. Use the attendance tracking section to mark attendance
3. Set your target attendance percentage
4. Monitor your progress and goals

## API Endpoints

### Calendar Processing
- `POST /upload-calendar`: Upload and process academic calendar PDF
- `GET /debug-pdf`: Debug PDF text extraction

### Timetable Processing
- `POST /upload-timetable`: Upload and process timetable PDF

### Combined Processing
- `POST /process-combined`: Process both calendar and timetable PDFs

### Attendance Management
- `POST /calculate-attendance`: Calculate attendance statistics

### Health Check
- `GET /health`: API health status
- `GET /docs`: Interactive API documentation

## PDF Processing Capabilities

### Supported PDF Types
- Text-based PDFs (direct text extraction)
- Image-based PDFs (OCR processing)
- Scanned documents (advanced OCR)

### AI Analysis Features
- Academic event detection
- Date and time parsing
- Working day calculation
- Holiday and weekend exclusion
- Confidence scoring

### Fallback Methods
- Pattern matching for dates
- Basic text extraction
- Manual event creation

## Data Storage

### Local Storage
- Academic events
- Attendance records
- User preferences
- Goal settings

### Export/Import
- JSON format data export
- Backup and restore functionality
- Cross-device data transfer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the API documentation at `/docs`
- Review the console logs for debugging
- Ensure your OpenAI API key is valid
- Verify PDF files are readable and contain relevant text

## Future Enhancements

- [ ] Database integration for multi-user support
- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Integration with learning management systems
- [ ] Real-time notifications and reminders
- [ ] Multi-language support 