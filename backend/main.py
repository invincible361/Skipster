from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import json
import aiofiles
import tempfile
from datetime import datetime, date
import logging

# PDF processing imports
import PyPDF2
import pdfplumber
import pytesseract
from PIL import Image
import cv2
import numpy as np

# AI imports
import google.generativeai as genai
import openai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Academic Attendance Tracker API",
    description="API for processing academic calendars and tracking attendance",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic models
class CalendarEvent(BaseModel):
    name: str
    date: str
    time: Optional[str] = None
    type: str = "lecture"
    description: Optional[str] = None

class TimetableEvent(BaseModel):
    subject: str
    day: str
    time: str
    duration: Optional[str] = None
    room: Optional[str] = None
    instructor: Optional[str] = None

class AttendanceRecord(BaseModel):
    date: str
    status: str  # present, absent, late
    notes: Optional[str] = None

class PDFProcessingResult(BaseModel):
    events: List[CalendarEvent]
    total_working_days: int
    semester_start: Optional[str] = None
    semester_end: Optional[str] = None
    confidence_score: float
    extracted_text: str

class TimetableProcessingResult(BaseModel):
    timetable_events: List[TimetableEvent]
    total_working_days: int
    weekly_schedule: Dict[str, List[TimetableEvent]]
    confidence_score: float
    extracted_text: str

class CombinedProcessingResult(BaseModel):
    calendar_events: List[CalendarEvent]
    timetable_events: List[TimetableEvent]
    total_working_days: int
    calendar_working_days: int
    timetable_working_days: int
    semester_start: Optional[str] = None
    semester_end: Optional[str] = None
    confidence_score: float
    total_classes: int
    classes_per_working_day: int
    weekly_schedule: Dict[str, List[TimetableEvent]]

class AttendanceStats(BaseModel):
    total_classes: int
    attended_classes: int
    attendance_percentage: float
    remaining_classes: int
    classes_to_attend_for_target: int
    target_percentage: float = 75.0

# Configuration
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if OPENAI_API_KEY:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
    logger.info("OpenAI client initialized successfully")
elif GEMINI_API_KEY:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini client initialized successfully")
else:
    logger.warning("No OpenAI or Gemini API key found. AI features will be limited.")

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF using multiple methods"""
    text = ""
    
    try:
        # Method 1: PyPDF2
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        
        # If PyPDF2 didn't extract much text, try pdfplumber
        if len(text.strip()) < 100:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        
        # If still no text, try OCR
        if len(text.strip()) < 50:
            text = extract_text_with_ocr(pdf_path)
            
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        text = extract_text_with_ocr(pdf_path)
    
    return text

def extract_text_with_ocr(pdf_path: str) -> str:
    """Extract text using OCR for image-based PDFs"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                # Convert page to image
                img = page.to_image()
                if img:
                    # Convert to PIL Image
                    pil_img = img.original
                    
                    # Preprocess image for better OCR
                    img_array = np.array(pil_img)
                    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
                    
                    # Apply thresholding
                    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                    
                    # Convert back to PIL
                    pil_thresh = Image.fromarray(thresh)
                    
                    # Extract text using OCR
                    page_text = pytesseract.image_to_string(pil_thresh)
                    text += page_text + "\n"
            
            return text
    except Exception as e:
        logger.error(f"Error in OCR extraction: {e}")
        return ""

def analyze_calendar_with_ai(extracted_text: str) -> Dict[str, Any]:
    """Use OpenAI to analyze the extracted text and identify academic events"""
    prompt = f"""
    Analyze the following academic calendar text and extract all academic events, classes, and important dates.\n\nText from PDF:\n{extracted_text[:4000]}  # Limit text length for API\n\nPlease provide a JSON response with the following structure:\n{{\n    \"events\": [\n        {{\n            \"name\": \"Event name\",\n            \"date\": \"YYYY-MM-DD\",\n            \"time\": \"HH:MM\" (optional),\n            \"type\": \"lecture|tutorial|lab|exam|holiday|other\",\n            \"description\": \"Brief description\"\n        }}\n    ],\n    \"semester_start\": \"YYYY-MM-DD\",\n    \"semester_end\": \"YYYY-MM-DD\",\n    \"total_working_days\": number,\n    \"confidence_score\": 0.0-1.0\n}}\n\nRules:\n1. Only include actual academic events (classes, exams, etc.)\n2. Exclude weekends unless explicitly mentioned as class days\n3. Convert all dates to YYYY-MM-DD format\n4. If time is mentioned, include it in HH:MM format\n5. Categorize events appropriately\n6. Calculate total working days (excluding weekends and holidays)\n7. Provide confidence score based on text clarity\n"""
    try:
        if OPENAI_API_KEY:
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7
            )
            result = response.choices[0].message.content
            try:
                parsed_result = json.loads(result)
                return parsed_result
            except json.JSONDecodeError:
                logger.error("Failed to parse OpenAI response as JSON")
                return extract_basic_dates(extracted_text)
        elif GEMINI_API_KEY:
            model = genai.GenerativeModel("gemini-1.5-pro")
            response = model.generate_content(prompt)
            result = response.text
            try:
                parsed_result = json.loads(result)
                return parsed_result
            except json.JSONDecodeError:
                logger.error("Failed to parse Gemini response as JSON")
                return extract_basic_dates(extracted_text)
        else:
            logger.warning("No OpenAI or Gemini API key available, using fallback method")
            return extract_basic_dates(extracted_text)
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        return extract_basic_dates(extracted_text)

def analyze_timetable_with_ai(extracted_text: str) -> Dict[str, Any]:
    """Use OpenAI to analyze the extracted text and identify timetable events"""
    prompt = f"""
    Analyze the following timetable text and extract all class schedules, subjects, and weekly patterns.\n\nText from PDF:\n{extracted_text[:4000]}  # Limit text length for API\n\nPlease provide a JSON response with the following structure:\n{{\n    \"timetable_events\": [\n        {{\n            \"subject\": \"Subject name\",\n            \"day\": \"Monday|Tuesday|Wednesday|Thursday|Friday|Saturday\",\n            \"time\": \"HH:MM-HH:MM\",\n            \"duration\": \"X hours\" (optional),\n            \"room\": \"Room number\" (optional),\n            \"instructor\": \"Instructor name\" (optional)\n        }}\n    ],\n    \"weekly_schedule\": {{\n        \"Monday\": [list of events],\n        \"Tuesday\": [list of events],\n        \"Wednesday\": [list of events],\n        \"Thursday\": [list of events],\n        \"Friday\": [list of events],\n        \"Saturday\": [list of events]\n    }},\n    \"total_working_days\": number,\n    \"confidence_score\": 0.0-1.0\n}}\n\nCRITICAL RULES FOR SUBJECT vs INSTRUCTOR IDENTIFICATION:\n1. SUBJECT should be the academic course name (e.g., \"Mathematics\", \"Physics\", \"Computer Science\", \"English Literature\")\n2. INSTRUCTOR should be the professor/teacher name (e.g., \"Dr. Smith\", \"Prof. Johnson\", \"Mr. Brown\")\n3. If you see a person's name, it's likely an INSTRUCTOR, not a subject\n4. Common subjects include: Mathematics, Physics, Chemistry, Biology, Computer Science, English, History, Geography, Economics, etc.\n5. If unsure, prioritize academic subject names over person names for the subject field\n6. Look for patterns like \"Prof.\", \"Dr.\", \"Mr.\", \"Ms.\" to identify instructors\n7. Extract all class subjects and their schedules\n8. Identify which days have classes (working days)\n9. Include time slots in HH:MM-HH:MM format\n10. Extract room numbers and instructor names if available\n11. Calculate total working days based on days with classes\n12. Exclude Sundays and holidays\n13. Provide confidence score based on text clarity\n"""
    try:
        if OPENAI_API_KEY:
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7
            )
            result = response.choices[0].message.content
            try:
                parsed_result = json.loads(result)
                return parsed_result
            except json.JSONDecodeError:
                logger.error("Failed to parse OpenAI response as JSON")
                return extract_basic_timetable(extracted_text)
        elif GEMINI_API_KEY:
            model = genai.GenerativeModel("gemini-1.5-pro")
            response = model.generate_content(prompt)
            result = response.text
            try:
                parsed_result = json.loads(result)
                return parsed_result
            except json.JSONDecodeError:
                logger.error("Failed to parse Gemini response as JSON")
                return extract_basic_timetable(extracted_text)
        else:
            logger.warning("No OpenAI or Gemini API key available, using fallback method")
            return extract_basic_timetable(extracted_text)
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        return extract_basic_timetable(extracted_text)

def extract_basic_timetable(text: str) -> Dict[str, Any]:
    """Fallback method to extract basic timetable information without AI"""
    import re
    
    working_days = set()
    timetable_events = []
    weekly_schedule = {
        "Monday": [], "Tuesday": [], "Wednesday": [], 
        "Thursday": [], "Friday": [], "Saturday": []
    }
    
    # Simple pattern matching for days
    day_patterns = {
        "Monday": ["monday", "mon", "m"],
        "Tuesday": ["tuesday", "tue", "t"],
        "Wednesday": ["wednesday", "wed", "w"],
        "Thursday": ["thursday", "thu", "th"],
        "Friday": ["friday", "fri", "f"],
        "Saturday": ["saturday", "sat", "s"]
    }
    
    lines = text.lower().split('\n')
    for line in lines:
        for day, patterns in day_patterns.items():
            if any(pattern in line for pattern in patterns):
                working_days.add(day)
                # Try to extract subject and time
                parts = line.split()
                if len(parts) >= 2:
                    # Look for common subject patterns and avoid person names
                    potential_subject = parts[0].title()
                    
                    # Check if it looks like a person name (has common titles)
                    person_titles = ['dr.', 'prof.', 'mr.', 'ms.', 'mrs.', 'miss']
                    is_person_name = any(title in potential_subject.lower() for title in person_titles)
                    
                    # If it looks like a person name, try to find a subject elsewhere in the line
                    if is_person_name:
                        # Look for common subject keywords
                        subject_keywords = ['math', 'physics', 'chemistry', 'biology', 'computer', 'english', 'history', 'geography', 'economics', 'science', 'literature', 'programming', 'calculus', 'algebra', 'statistics']
                        found_subject = None
                        for keyword in subject_keywords:
                            if keyword in line.lower():
                                found_subject = keyword.title()
                                break
                        subject = found_subject if found_subject else "Subject"
                        instructor = potential_subject
                    else:
                        subject = potential_subject
                        instructor = ""
                    
                    time_match = re.search(r'(\d{1,2}:\d{2})', line)
                    time = time_match.group(1) if time_match else "09:00-10:00"
                    
                    event = {
                        "subject": subject,
                        "day": day,
                        "time": time,
                        "duration": "1 hour",
                        "room": "",
                        "instructor": instructor
                    }
                    timetable_events.append(event)
                    weekly_schedule[day].append(event)
    
    return {
        "timetable_events": timetable_events,
        "weekly_schedule": weekly_schedule,
        "total_working_days": len(working_days),
        "confidence_score": 0.3
    }

def extract_basic_dates(text: str) -> Dict[str, Any]:
    """Fallback method to extract only student class days (ignore exams, events, holidays, and Sundays)."""
    import re
    from datetime import datetime, timedelta

    # Find all 'Academic Instruction Duration' blocks with start/end dates and day counts
    # Example: 'Academic Instruction Duration (Regular Classes) VII 2 June 2025 (Monday) 23 August 2025 (Saturday) 70 Days'
    pattern = re.compile(
        r'Academic Instruction Duration.*?(\d{1,2} [A-Za-z]+ \d{4}) \([A-Za-z]+\) (\d{1,2} [A-Za-z]+ \d{4}) \([A-Za-z]+\) (\d+) Days',
        re.DOTALL
    )
    matches = pattern.findall(text)

    events = []
    total_working_days = 0
    for i, (start_str, end_str, days_str) in enumerate(matches):
        try:
            start_date = datetime.strptime(start_str, '%d %B %Y')
            end_date = datetime.strptime(end_str, '%d %B %Y')
            days = int(days_str)
            # Generate all dates between start and end, skipping Sundays
            current = start_date
            class_days = []
            while current <= end_date:
                if current.weekday() != 6:  # 6 = Sunday
                    class_days.append(current.strftime('%Y-%m-%d'))
                current += timedelta(days=1)
            # Validate with the provided days count (allowing for minor mismatch)
            if abs(len(class_days) - days) <= 2:
                for idx, d in enumerate(class_days):
                    events.append({
                        "name": f"Class Day {total_working_days + idx + 1}",
                        "date": d,
                        "type": "lecture",
                        "description": f"Regular class (auto-generated)"
                    })
                total_working_days += len(class_days)
        except Exception as e:
            continue

    # If nothing found, fallback to previous logic (large day counts)
    if total_working_days == 0:
        days_pattern = re.findall(r'(\d+)\s+Days', text)
        if days_pattern:
            large_days = [int(days) for days in days_pattern if int(days) >= 30]
            if large_days:
                total_working_days = sum(large_days)
                for i in range(min(total_working_days, 30)):
                    events.append({
                        "name": f"Estimated Class Day {i+1}",
                        "date": f"2025-{str(i//30 + 1).zfill(2)}-{str((i % 30) + 1).zfill(2)}",
                        "type": "lecture",
                        "description": "Estimated from academic calendar"
                    })

    return {
        "events": events,
        "total_working_days": total_working_days,
        "confidence_score": 0.7 if total_working_days > 0 else 0.2,
        "extracted_text": text[:1000]
    }

@app.post("/upload-calendar", response_model=PDFProcessingResult)
async def upload_calendar(file: UploadFile = File(...)):
    """Upload and process academic calendar PDF"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Save uploaded file
    file_path = os.path.join(UPLOAD_DIR, f"calendar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    try:
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file_path)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the PDF")
        
        # Analyze with AI
        analysis_result = analyze_calendar_with_ai(extracted_text)
        
        # Convert to response model
        events = []
        for event_data in analysis_result.get('events', []):
            events.append(CalendarEvent(**event_data))
        
        return PDFProcessingResult(
            events=events,
            total_working_days=analysis_result.get('total_working_days', 0),
            semester_start=analysis_result.get('semester_start'),
            semester_end=analysis_result.get('semester_end'),
            confidence_score=analysis_result.get('confidence_score', 0.0),
            extracted_text=extracted_text[:1000]  # Limit for response
        )
        
    except Exception as e:
        logger.error(f"Error processing calendar PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/upload-timetable", response_model=TimetableProcessingResult)
async def upload_timetable(file: UploadFile = File(...)):
    """Upload and process timetable PDF or image"""
    allowed_exts = ['.pdf', '.jpg', '.jpeg', '.png']
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Only PDF or image files (.pdf, .jpg, .jpeg, .png) are allowed")
    
    # Save uploaded file
    file_path = os.path.join(UPLOAD_DIR, f"timetable_{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}")
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    try:
        # Extract text from PDF or image
        if ext == '.pdf':
            extracted_text = extract_text_from_pdf(file_path)
        else:
            # For images, use OCR directly
            img = Image.open(file_path)
            extracted_text = pytesseract.image_to_string(img)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")
        
        # Analyze with AI
        analysis_result = analyze_timetable_with_ai(extracted_text)
        
        # Convert to response model
        timetable_events = []
        for event_data in analysis_result.get('timetable_events', []):
            timetable_events.append(TimetableEvent(**event_data))
        
        return TimetableProcessingResult(
            timetable_events=timetable_events,
            total_working_days=analysis_result.get('total_working_days', 0),
            weekly_schedule=analysis_result.get('weekly_schedule', {}),
            confidence_score=analysis_result.get('confidence_score', 0.0),
            extracted_text=extracted_text[:1000]  # Limit for response
        )
        
    except Exception as e:
        logger.error(f"Error processing timetable file: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/process-combined", response_model=CombinedProcessingResult)
async def process_combined(
    calendar_file: UploadFile = File(...),
    timetable_file: UploadFile = File(...)
):
    """Process both calendar and timetable files together (PDF or image for timetable)"""
    cal_ext = os.path.splitext(calendar_file.filename)[1].lower()
    tt_ext = os.path.splitext(timetable_file.filename)[1].lower()
    if cal_ext != '.pdf' or tt_ext not in ['.pdf', '.jpg', '.jpeg', '.png']:
        raise HTTPException(status_code=400, detail="Calendar must be PDF; Timetable must be PDF or image (.pdf, .jpg, .jpeg, .png)")
    
    # Save uploaded files
    calendar_path = os.path.join(UPLOAD_DIR, f"calendar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
    timetable_path = os.path.join(UPLOAD_DIR, f"timetable_{datetime.now().strftime('%Y%m%d_%H%M%S')}{tt_ext}")
    
    try:
        # Save calendar file
        async with aiofiles.open(calendar_path, 'wb') as f:
            content = await calendar_file.read()
            await f.write(content)
        
        # Save timetable file
        async with aiofiles.open(timetable_path, 'wb') as f:
            content = await timetable_file.read()
            await f.write(content)
        
        # Process calendar
        calendar_text = extract_text_from_pdf(calendar_path)
        calendar_analysis = analyze_calendar_with_ai(calendar_text)
        
        # Process timetable
        if tt_ext == '.pdf':
            timetable_text = extract_text_from_pdf(timetable_path)
        else:
            img = Image.open(timetable_path)
            timetable_text = pytesseract.image_to_string(img)
        timetable_analysis = analyze_timetable_with_ai(timetable_text)
        
        # Convert to response models
        calendar_events = []
        for event_data in calendar_analysis.get('events', []):
            calendar_events.append(CalendarEvent(**event_data))
        
        timetable_events = []
        for event_data in timetable_analysis.get('timetable_events', []):
            timetable_events.append(TimetableEvent(**event_data))
        
        # Calculate working days from calendar (when classes are held)
        calendar_working_days = calendar_analysis.get('total_working_days', 0)
        
        # Calculate classes per working day from timetable
        weekly_schedule = timetable_analysis.get('weekly_schedule', {})
        working_days_with_classes = [day for day, classes in weekly_schedule.items() if classes]
        total_classes_in_week = sum(len(classes) for classes in weekly_schedule.values())
        
        # Calculate average classes per working day
        classes_per_working_day = total_classes_in_week // len(working_days_with_classes) if working_days_with_classes else 0
        
        # Calculate total classes: working days × classes per day
        total_classes = calendar_working_days * classes_per_working_day if classes_per_working_day > 0 else calendar_working_days
        
        # Calculate combined confidence score
        calendar_confidence = calendar_analysis.get('confidence_score', 0.0)
        timetable_confidence = timetable_analysis.get('confidence_score', 0.0)
        combined_confidence = (calendar_confidence + timetable_confidence) / 2
        
        return CombinedProcessingResult(
            calendar_events=calendar_events,
            timetable_events=timetable_events,
            total_working_days=calendar_working_days,
            calendar_working_days=calendar_working_days,
            timetable_working_days=len([day for day, classes in weekly_schedule.items() if classes]),
            semester_start=calendar_analysis.get('semester_start'),
            semester_end=calendar_analysis.get('semester_end'),
            confidence_score=combined_confidence,
            total_classes=total_classes,
            classes_per_working_day=classes_per_working_day,
            weekly_schedule=weekly_schedule
        )
        
    except Exception as e:
        logger.error(f"Error processing combined files: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing files: {str(e)}")
    finally:
        # Clean up uploaded files
        for path in [calendar_path, timetable_path]:
            if os.path.exists(path):
                os.remove(path)

@app.post("/calculate-combined-attendance", response_model=AttendanceStats)
async def calculate_combined_attendance(
    total_working_days: int = Form(...),
    classes_per_working_day: int = Form(...),
    attended_classes: int = Form(...),
    target_percentage: float = Form(75.0)
):
    """Calculate attendance statistics based on combined calendar and timetable data"""
    
    if total_working_days < 0 or classes_per_working_day < 0 or attended_classes < 0:
        raise HTTPException(status_code=400, detail="Invalid input values")
    
    if target_percentage < 0 or target_percentage > 100:
        raise HTTPException(status_code=400, detail="Invalid target percentage")
    
    # Calculate total classes: working days × classes per day
    total_classes = total_working_days * classes_per_working_day
    
    if total_classes <= 0:
        raise HTTPException(status_code=400, detail="No classes found in the data")
    
    attendance_percentage = (attended_classes / total_classes * 100) if total_classes > 0 else 0
    remaining_classes = max(0, total_classes - attended_classes)
    
    # Calculate classes needed to reach target
    if attendance_percentage >= target_percentage:
        classes_to_attend = 0
    else:
        target_attended = (target_percentage / 100) * total_classes
        classes_to_attend = max(0, int(target_attended - attended_classes))
    
    return AttendanceStats(
        total_classes=total_classes,
        attended_classes=attended_classes,
        attendance_percentage=round(attendance_percentage, 2),
        remaining_classes=remaining_classes,
        classes_to_attend_for_target=classes_to_attend,
        target_percentage=target_percentage
    )

@app.post("/calculate-attendance", response_model=AttendanceStats)
async def calculate_attendance(
    total_classes: int = Form(...),
    attended_classes: int = Form(...),
    target_percentage: float = Form(75.0)
):
    """Calculate attendance statistics (original endpoint for backward compatibility)"""
    
    if total_classes < 0 or attended_classes < 0:
        raise HTTPException(status_code=400, detail="Invalid class counts")
    
    if target_percentage < 0 or target_percentage > 100:
        raise HTTPException(status_code=400, detail="Invalid target percentage")
    
    attendance_percentage = (attended_classes / total_classes * 100) if total_classes > 0 else 0
    remaining_classes = max(0, total_classes - attended_classes)
    
    # Calculate classes needed to reach target
    if attendance_percentage >= target_percentage:
        classes_to_attend = 0
    else:
        target_attended = (target_percentage / 100) * total_classes
        classes_to_attend = max(0, int(target_attended - attended_classes))
    
    return AttendanceStats(
        total_classes=total_classes,
        attended_classes=attended_classes,
        attendance_percentage=round(attendance_percentage, 2),
        remaining_classes=remaining_classes,
        classes_to_attend_for_target=classes_to_attend,
        target_percentage=target_percentage
    )

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    async with aiofiles.open("static/index.html", "r") as f:
        content = await f.read()
    return HTMLResponse(content=content)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/debug-pdf")
async def debug_pdf(file: UploadFile = File(...)):
    """Debug endpoint to see extracted text from PDF"""
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save uploaded file
        temp_path = os.path.join(UPLOAD_DIR, f"debug_{datetime.now().timestamp()}.pdf")
        async with aiofiles.open(temp_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(temp_path)
        
        # Clean up temp file
        os.remove(temp_path)
        
        return {
            "filename": file.filename,
            "text_length": len(extracted_text),
            "extracted_text": extracted_text,
            "first_500_chars": extracted_text[:500],
            "last_500_chars": extracted_text[-500:] if len(extracted_text) > 500 else ""
        }
        
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/debug-timetable")
async def debug_timetable(file: UploadFile = File(...)):
    """Debug endpoint to see AI analysis of timetable"""
    
    allowed_exts = ['.pdf', '.jpg', '.jpeg', '.png']
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Only PDF or image files (.pdf, .jpg, .jpeg, .png) are allowed")
    
    try:
        # Save uploaded file
        temp_path = os.path.join(UPLOAD_DIR, f"debug_timetable_{datetime.now().timestamp()}{ext}")
        async with aiofiles.open(temp_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Extract text
        if ext == '.pdf':
            extracted_text = extract_text_from_pdf(temp_path)
        else:
            img = Image.open(temp_path)
            extracted_text = pytesseract.image_to_string(img)
        
        # Analyze with AI
        ai_result = analyze_timetable_with_ai(extracted_text)
        
        # Clean up temp file
        os.remove(temp_path)
        
        return {
            "filename": file.filename,
            "text_length": len(extracted_text),
            "extracted_text": extracted_text[:1000],
            "ai_analysis": ai_result,
            "timetable_events": ai_result.get('timetable_events', []),
            "weekly_schedule": ai_result.get('weekly_schedule', {}),
            "confidence_score": ai_result.get('confidence_score', 0.0)
        }
        
    except Exception as e:
        logger.error(f"Error processing timetable: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing timetable: {str(e)}")

@app.get("/test-subject-extraction")
async def test_subject_extraction():
    """Test endpoint to see how subject extraction works with sample data"""
    
    # Sample timetable text that might cause issues
    sample_text = """
    Monday 9:00-10:00 Dr. Smith Mathematics Room 101
    Tuesday 10:00-11:00 Prof. Johnson Physics Lab 2
    Wednesday 11:00-12:00 Mr. Brown Computer Science Room 203
    Thursday 2:00-3:00 Ms. Davis English Literature Library
    Friday 3:00-4:00 Dr. Wilson Chemistry Lab 1
    """
    
    # Test AI analysis
    ai_result = analyze_timetable_with_ai(sample_text)
    
    # Test fallback method
    fallback_result = extract_basic_timetable(sample_text)
    
    return {
        "sample_text": sample_text,
        "ai_analysis": ai_result,
        "fallback_analysis": fallback_result,
        "comparison": {
            "ai_subjects": [event.get('subject', '') for event in ai_result.get('timetable_events', [])],
            "ai_instructors": [event.get('instructor', '') for event in ai_result.get('timetable_events', [])],
            "fallback_subjects": [event.get('subject', '') for event in fallback_result.get('timetable_events', [])],
            "fallback_instructors": [event.get('instructor', '') for event in fallback_result.get('timetable_events', [])]
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 