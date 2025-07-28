import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, date, timedelta
import calendar
import hashlib
import csv
import os
import tempfile
import PyPDF2
import pdfplumber
import pytesseract
from PIL import Image
import cv2
import numpy as np
import json
from typing import Dict, List, Optional, Any
import io

# Page configuration
st.set_page_config(
    page_title="Academic Attendance Tracker",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 1rem 0;
    }
    .calendar-container {
        background: white;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .stButton > button {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 5px;
        padding: 0.5rem 1rem;
    }
    .stButton > button:hover {
        background: linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%);
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'current_user' not in st.session_state:
    st.session_state.current_user = None
if 'holidays' not in st.session_state:
    st.session_state.holidays = []
if 'timetable' not in st.session_state:
    st.session_state.timetable = {}
if 'attendance_data' not in st.session_state:
    st.session_state.attendance_data = {}

# User authentication functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_users_csv_if_not_exists():
    if not os.path.exists('users.csv'):
        with open('users.csv', 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['username', 'email', 'password_hash', 'full_name', 'created_at', 'last_login'])

def save_user_to_csv(user_data: dict):
    create_users_csv_if_not_exists()
    with open('users.csv', 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            user_data['username'],
            user_data['email'],
            user_data['password_hash'],
            user_data['full_name'],
            user_data['created_at'],
            user_data['last_login']
        ])

def get_user_by_username(username: str) -> Optional[dict]:
    create_users_csv_if_not_exists()
    with open('users.csv', 'r', newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row['username'] == username:
                return row
    return None

def register_user(username: str, email: str, password: str, full_name: str) -> bool:
    if get_user_by_username(username):
        return False
    
    user_data = {
        'username': username,
        'email': email,
        'password_hash': hash_password(password),
        'full_name': full_name,
        'created_at': datetime.now().isoformat(),
        'last_login': datetime.now().isoformat()
    }
    save_user_to_csv(user_data)
    return True

def login_user(username: str, password: str) -> Optional[dict]:
    user = get_user_by_username(username)
    if user and user['password_hash'] == hash_password(password):
        return user
    return None

# PDF processing functions
def extract_text_from_pdf(pdf_file) -> str:
    try:
        # Try PyPDF2 first
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        if text.strip():
            return text
        
        # If PyPDF2 fails, try pdfplumber
        pdf_file.seek(0)
        with pdfplumber.open(pdf_file) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
        
        return text
    except Exception as e:
        st.error(f"Error extracting text: {e}")
        return ""

def analyze_calendar_text(text: str) -> Dict[str, Any]:
    # Simple date extraction
    import re
    dates = re.findall(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', text)
    working_days = len(set(dates))
    
    return {
        'events': [{'name': 'Working Day', 'date': date, 'type': 'lecture'} for date in dates],
        'total_working_days': working_days,
        'confidence_score': 0.8 if working_days > 0 else 0.3,
        'extracted_text': text[:500] + "..." if len(text) > 500 else text
    }

# Calendar functions
def generate_calendar_data(year: int, month: int) -> pd.DataFrame:
    cal = calendar.monthcalendar(year, month)
    calendar_data = []
    
    for week in cal:
        for day in week:
            if day != 0:
                calendar_data.append({
                    'day': day,
                    'date': date(year, month, day),
                    'is_holiday': any(h['date'] == f"{year}-{month:02d}-{day:02d}" for h in st.session_state.holidays)
                })
    
    return pd.DataFrame(calendar_data)

# Attendance calculation
def calculate_attendance(total_classes: int, attended_classes: int, target_percentage: float = 75.0) -> Dict[str, Any]:
    if total_classes == 0:
        return {
            'current_percentage': 0,
            'classes_to_attend': 0,
            'remaining_classes': 0,
            'goal_status': 'No classes scheduled'
        }
    
    current_percentage = (attended_classes / total_classes) * 100
    classes_to_attend = max(0, int((target_percentage * total_classes / 100) - attended_classes))
    remaining_classes = total_classes - attended_classes
    
    if current_percentage >= target_percentage:
        goal_status = 'On track'
    else:
        goal_status = 'Behind target'
    
    return {
        'current_percentage': current_percentage,
        'classes_to_attend': classes_to_attend,
        'remaining_classes': remaining_classes,
        'goal_status': goal_status
    }

# Main app
def main():
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>🎓 Academic Attendance Tracker</h1>
        <p>Track your academic attendance with AI-powered PDF analysis</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Sidebar for authentication
    with st.sidebar:
        st.header("🔐 Authentication")
        
        if not st.session_state.authenticated:
            tab1, tab2 = st.tabs(["Login", "Register"])
            
            with tab1:
                st.subheader("Login")
                login_username = st.text_input("Username", key="login_username")
                login_password = st.text_input("Password", type="password", key="login_password")
                
                if st.button("Login"):
                    user = login_user(login_username, login_password)
                    if user:
                        st.session_state.authenticated = True
                        st.session_state.current_user = user
                        st.success("Login successful!")
                        st.rerun()
                    else:
                        st.error("Invalid username or password")
            
            with tab2:
                st.subheader("Register")
                reg_username = st.text_input("Username", key="reg_username")
                reg_email = st.text_input("Email", key="reg_email")
                reg_full_name = st.text_input("Full Name", key="reg_full_name")
                reg_password = st.text_input("Password", type="password", key="reg_password")
                
                if st.button("Register"):
                    if register_user(reg_username, reg_email, reg_password, reg_full_name):
                        st.success("Registration successful! Please login.")
                    else:
                        st.error("Username already exists")
        else:
            st.success(f"Welcome, {st.session_state.current_user['full_name']}!")
            if st.button("Logout"):
                st.session_state.authenticated = False
                st.session_state.current_user = None
                st.rerun()
    
    # Main content
    if st.session_state.authenticated:
        # Navigation
        page = st.sidebar.selectbox(
            "Navigation",
            ["Home", "Future Optimization", "Timetable", "Attendance Analysis"]
        )
        
        if page == "Home":
            show_home_page()
        elif page == "Future Optimization":
            show_future_optimization_page()
        elif page == "Timetable":
            show_timetable_page()
        elif page == "Attendance Analysis":
            show_attendance_analysis_page()
    else:
        st.info("Please login to access the application.")

def show_home_page():
    st.header("📄 PDF Calendar Upload")
    
    uploaded_file = st.file_uploader(
        "Upload Academic Calendar PDF",
        type=['pdf'],
        help="Upload your academic calendar PDF to extract working days"
    )
    
    if uploaded_file is not None:
        with st.spinner("Processing PDF..."):
            text = extract_text_from_pdf(uploaded_file)
            result = analyze_calendar_text(text)
            
            st.success("PDF processed successfully!")
            
            # Display results
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Events Found", result['total_working_days'])
            with col2:
                st.metric("Working Days", result['total_working_days'])
            with col3:
                st.metric("Confidence", f"{result['confidence_score']*100:.1f}%")
            
            # Store data in session state
            st.session_state.attendance_data = {
                'total_working_days': result['total_working_days'],
                'extracted_text': result['extracted_text']
            }
            
            # Show extracted text
            with st.expander("Extracted Text"):
                st.text(result['extracted_text'])
    
    st.header("📊 Manual Entry")
    col1, col2 = st.columns(2)
    
    with col1:
        total_working_days = st.number_input("Total Working Days", min_value=1, value=30)
        classes_per_day = st.number_input("Classes per Day", min_value=1, value=2)
    
    with col2:
        attended_classes = st.number_input("Classes Attended", min_value=0, value=0)
        target_percentage = st.number_input("Target Attendance %", min_value=0, max_value=100, value=75)
    
    if st.button("Calculate Attendance"):
        total_classes = total_working_days * classes_per_day
        result = calculate_attendance(total_classes, attended_classes, target_percentage)
        
        st.session_state.attendance_data = {
            'total_classes': total_classes,
            'attended_classes': attended_classes,
            'target_percentage': target_percentage,
            **result
        }
        
        # Display results
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Current Attendance", f"{result['current_percentage']:.1f}%")
        with col2:
            st.metric("Classes to Attend", result['classes_to_attend'])
        with col3:
            st.metric("Remaining Classes", result['remaining_classes'])
        
        # Goal status
        if result['goal_status'] == 'On track':
            st.success("🎉 You're on track to meet your attendance goal!")
        else:
            st.warning(f"⚠️ {result['goal_status']}")

def show_future_optimization_page():
    st.header("📅 Future Optimization")
    
    # Calendar
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("Calendar")
        
        # Month navigation
        col_a, col_b, col_c = st.columns([1, 2, 1])
        with col_a:
            if st.button("← Previous"):
                if 'current_month' not in st.session_state:
                    st.session_state.current_month = datetime.now().month
                st.session_state.current_month = (st.session_state.current_month - 1) % 12 or 12
        
        with col_b:
            current_month = st.session_state.get('current_month', datetime.now().month)
            current_year = datetime.now().year
            month_name = calendar.month_name[current_month]
            st.markdown(f"**{month_name} {current_year}**")
        
        with col_c:
            if st.button("Next →"):
                if 'current_month' not in st.session_state:
                    st.session_state.current_month = datetime.now().month
                st.session_state.current_month = (st.session_state.current_month + 1) % 12 or 12
        
        # Calendar display
        current_month = st.session_state.get('current_month', datetime.now().month)
        current_year = datetime.now().year
        
        calendar_data = generate_calendar_data(current_year, current_month)
        
        # Create calendar grid
        cal = calendar.monthcalendar(current_year, current_month)
        
        # Display calendar
        for week in cal:
            cols = st.columns(7)
            for i, day in enumerate(week):
                if day == 0:
                    cols[i].write("")
                else:
                    is_holiday = any(h['date'] == f"{current_year}-{current_month:02d}-{day:02d}" 
                                   for h in st.session_state.holidays)
                    if is_holiday:
                        cols[i].markdown(f"**{day}** 🏖️")
                    else:
                        cols[i].write(day)
    
    with col2:
        st.subheader("Add Holiday")
        holiday_date = st.date_input("Select Date")
        holiday_reason = st.text_input("Reason (optional)")
        
        if st.button("Add Holiday"):
            holiday = {
                'date': holiday_date.strftime('%Y-%m-%d'),
                'reason': holiday_reason or 'Holiday'
            }
            st.session_state.holidays.append(holiday)
            st.success("Holiday added!")
        
        # Holiday list
        if st.session_state.holidays:
            st.subheader("Holidays")
            for holiday in st.session_state.holidays:
                st.write(f"📅 {holiday['date']}: {holiday['reason']}")
    
    # Pie chart
    if st.session_state.attendance_data:
        st.subheader("📊 Attendance Distribution")
        
        total_classes = st.session_state.attendance_data.get('total_classes', 0)
        attended_classes = st.session_state.attendance_data.get('attended_classes', 0)
        classes_missed = len(st.session_state.holidays) * 2  # Assuming 2 classes per day
        remaining_classes = max(0, total_classes - attended_classes - classes_missed)
        
        # Create pie chart
        fig = go.Figure(data=[go.Pie(
            labels=['Classes Attended', 'Classes Missed (Holidays)', 'Remaining Classes'],
            values=[attended_classes, classes_missed, remaining_classes],
            hole=0.3,
            marker_colors=['#667eea', '#f56565', '#e2e8f0']
        )])
        
        fig.update_layout(
            title="Attendance Distribution",
            showlegend=True,
            height=400
        )
        
        st.plotly_chart(fig, use_container_width=True)

def show_timetable_page():
    st.header("⏰ Timetable Management")
    
    # Add class
    st.subheader("Add Class")
    col1, col2 = st.columns(2)
    
    with col1:
        class_name = st.text_input("Class Name")
        subject = st.text_input("Subject")
    
    with col2:
        day = st.selectbox("Day", ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
        time_slot = st.selectbox("Time", ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00',
                                         '2:00-3:00', '3:00-4:00', '4:00-5:00', '5:00-6:00'])
    
    teacher = st.text_input("Teacher (optional)")
    room = st.text_input("Room (optional)")
    
    if st.button("Add Class"):
        key = f"{day.lower()}_{time_slot}"
        st.session_state.timetable[key] = {
            'name': class_name,
            'subject': subject,
            'teacher': teacher,
            'room': room
        }
        st.success("Class added to timetable!")
    
    # Display timetable
    if st.session_state.timetable:
        st.subheader("Current Timetable")
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        time_slots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00',
                     '2:00-3:00', '3:00-4:00', '4:00-5:00', '5:00-6:00']
        
        # Create timetable dataframe
        timetable_data = []
        for day in days:
            for time_slot in time_slots:
                key = f"{day.lower()}_{time_slot}"
                class_data = st.session_state.timetable.get(key, {})
                timetable_data.append({
                    'Day': day,
                    'Time': time_slot,
                    'Class': class_data.get('name', ''),
                    'Subject': class_data.get('subject', ''),
                    'Teacher': class_data.get('teacher', ''),
                    'Room': class_data.get('room', '')
                })
        
        df = pd.DataFrame(timetable_data)
        st.dataframe(df, use_container_width=True)

def show_attendance_analysis_page():
    st.header("📈 Attendance Analysis")
    
    if st.session_state.attendance_data:
        data = st.session_state.attendance_data
        
        # Summary metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Classes", data.get('total_classes', 0))
        with col2:
            st.metric("Attended Classes", data.get('attended_classes', 0))
        with col3:
            st.metric("Current Attendance", f"{data.get('current_percentage', 0):.1f}%")
        with col4:
            st.metric("Classes to Attend", data.get('classes_to_attend', 0))
        
        # Progress bar
        current_percentage = data.get('current_percentage', 0)
        target_percentage = data.get('target_percentage', 75)
        
        st.subheader("Progress to Target")
        progress = min(current_percentage / target_percentage, 1.0)
        st.progress(progress)
        st.write(f"{current_percentage:.1f}% / {target_percentage}%")
        
        # Goal status
        goal_status = data.get('goal_status', '')
        if goal_status == 'On track':
            st.success("🎉 You're on track to meet your attendance goal!")
        elif goal_status == 'Behind target':
            st.warning("⚠️ You need to attend more classes to reach your target.")
        
        # Recommendations
        st.subheader("Recommendations")
        classes_to_attend = data.get('classes_to_attend', 0)
        if classes_to_attend > 0:
            st.info(f"You need to attend {classes_to_attend} more classes to reach your target.")
        else:
            st.success("Great job! You've already met your attendance target.")
    
    else:
        st.info("No attendance data available. Please process a PDF or enter manual data on the Home page.")

if __name__ == "__main__":
    main() 