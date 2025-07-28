// Set up PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    console.log('PDF.js library loaded successfully');
} else {
    console.error('PDF.js library not found!');
}

class StaticAttendanceTracker {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadData();
        this.checkAuthStatus();
    }

    initializeElements() {
        // Authentication Elements
        this.authSection = document.getElementById('authSection');
        this.userDashboard = document.getElementById('userDashboard');
        this.loginTab = document.getElementById('loginTab');
        this.registerTab = document.getElementById('registerTab');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registerBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.userFullName = document.getElementById('userFullName');
        this.loginError = document.getElementById('loginError');
        this.registerError = document.getElementById('registerError');
        
        // Login form inputs
        this.loginUsername = document.getElementById('loginUsername');
        this.loginPassword = document.getElementById('loginPassword');
        
        // Register form inputs
        this.registerUsername = document.getElementById('registerUsername');
        this.registerEmail = document.getElementById('registerEmail');
        this.registerFullName = document.getElementById('registerFullName');
        this.registerPassword = document.getElementById('registerPassword');
        
        // Sidebar Elements
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.sidebarUserName = document.getElementById('sidebarUserName');
        this.mainContentWrapper = document.querySelector('.main-content-wrapper');
        
        // Navigation Elements
        this.navItems = document.querySelectorAll('.nav-item');
        this.dashboardSections = document.querySelectorAll('.dashboard-section');
        
        console.log('Found navigation items:', this.navItems.length);
        console.log('Found dashboard sections:', this.dashboardSections.length);
        this.dashboardSections.forEach(section => {
            console.log('Dashboard section:', section.id);
        });
        
        // Calendar Elements
        this.calendarGrid = document.getElementById('calendarGrid');
        this.currentMonthEl = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.holidayDate = document.getElementById('holidayDate');
        this.holidayReason = document.getElementById('holidayReason');
        this.addHolidayBtn = document.getElementById('addHolidayBtn');
        this.holidayAnalysis = document.getElementById('holidayAnalysis');
        
        // Timetable Elements
        this.timetableBody = document.getElementById('timetableBody');
        this.addClassBtn = document.getElementById('addClassBtn');
        this.saveTimetableBtn = document.getElementById('saveTimetableBtn');
        this.loadTimetableBtn = document.getElementById('loadTimetableBtn');
        this.timetableSummary = document.getElementById('timetableSummary');
        
        // PDF Upload Elements
        this.pdfFileInput = document.getElementById('pdfFile');
        this.uploadPdfBtn = document.getElementById('uploadPdfBtn');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.uploadProgressFill = document.getElementById('uploadProgressFill');
        this.pdfResults = document.getElementById('pdfResults');
        
        // Results Elements
        this.extractedEventsEl = document.getElementById('extractedEvents');
        this.workingDaysEl = document.getElementById('workingDays');
        this.confidenceScoreEl = document.getElementById('confidenceScore');
        
        // Attendance Input Elements
        this.attendedClassesInput = document.getElementById('attendedClasses');
        this.targetPercentageInput = document.getElementById('targetPercentage');
        this.calculateAttendanceBtn = document.getElementById('calculateAttendanceBtn');
        this.attendanceResults = document.getElementById('attendanceResults');
        
        // Manual Entry Elements
        this.totalWorkingDaysInput = document.getElementById('totalWorkingDays');
        this.classesPerDayInput = document.getElementById('classesPerDay');
        this.attendedClassesManualInput = document.getElementById('attendedClassesManual');
        this.calculateManualBtn = document.getElementById('calculateManualBtn');
        this.manualResults = document.getElementById('manualResults');
        
        // Result Elements
        this.currentPercentageEl = document.getElementById('currentPercentage');
        this.classesToAttendEl = document.getElementById('classesToAttend');
        this.remainingClassesEl = document.getElementById('remainingClasses');
        this.goalStatusEl = document.getElementById('goalStatus');
        
        // Manual Result Elements
        this.manualTotalClassesEl = document.getElementById('manualTotalClasses');
        this.manualCurrentPercentageEl = document.getElementById('manualCurrentPercentage');
        this.manualClassesToAttendEl = document.getElementById('manualClassesToAttend');
        this.manualGoalStatusEl = document.getElementById('manualGoalStatus');
        
        // Summary Elements
        this.summaryTotalClassesEl = document.getElementById('summaryTotalClasses');
        this.summaryCurrentAttendanceEl = document.getElementById('summaryCurrentAttendance');
        this.summaryClassesToAttendEl = document.getElementById('summaryClassesToAttend');
        
        // Toast
        this.toast = document.getElementById('toast');
        
        // Data storage
        this.extractedData = null;
        this.totalWorkingDays = 0;
        this.classesPerWorkingDay = 0;
        this.totalClasses = 0;
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        
        // Calendar data
        this.currentDate = new Date();
        this.selectedMonth = new Date();
        this.holidays = [];
        
        // Timetable data
        this.timetable = {};
        this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // Chart data
        this.attendancePieChart = null;
    }

    bindEvents() {
        // Authentication Events
        this.loginTab.addEventListener('click', () => this.switchToLogin());
        this.registerTab.addEventListener('click', () => this.switchToRegister());
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.registerBtn.addEventListener('click', () => this.handleRegister());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Sidebar Events
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        
        // Navigation Events
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Navigation item clicked:', item.dataset.section);
                this.switchSection(item.dataset.section);
            });
        });
        
        // Calendar Events
        this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn.addEventListener('click', () => this.nextMonth());
        this.addHolidayBtn.addEventListener('click', () => this.addHoliday());
        
        // Timetable Events
        this.addClassBtn.addEventListener('click', () => this.addClassToTimetable());
        this.saveTimetableBtn.addEventListener('click', () => this.saveTimetable());
        this.loadTimetableBtn.addEventListener('click', () => this.loadTimetable());
        
        // PDF Upload
        this.uploadPdfBtn.addEventListener('click', () => this.processPdf());
        this.pdfFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Test button
        const testBtn = document.getElementById('testBtn');
        if (testBtn) {
            testBtn.addEventListener('click', () => this.testFunctionality());
        }
        
        // Attendance Calculation
        this.calculateAttendanceBtn.addEventListener('click', () => this.calculateAttendanceFromPDF());
        
        // Manual Calculation
        this.calculateManualBtn.addEventListener('click', () => this.calculateManualAttendance());
        
        // File drag and drop
        this.setupFileUpload();
    }

    setupFileUpload() {
        const fileInputWrapper = document.querySelector('.file-input-wrapper');
        const fileInput = this.pdfFileInput;

        // Add click handler to open file dialog
        fileInputWrapper.addEventListener('click', () => {
            console.log('File input wrapper clicked');
            fileInput.click();
        });

        fileInputWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileInputWrapper.classList.add('dragover');
        });

        fileInputWrapper.addEventListener('dragleave', () => {
            fileInputWrapper.classList.remove('dragover');
        });

        fileInputWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            fileInputWrapper.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.handleFileSelect({ target: fileInput });
            }
        });
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.updateFileInputDisplay(file.name);
        }
    }

    updateFileInputDisplay(fileName) {
        const placeholder = document.querySelector('.file-input-placeholder');
        placeholder.innerHTML = `<i class="fas fa-file-pdf"></i><span>${fileName}</span>`;
    }

    async processPdf() {
        const file = this.pdfFileInput.files[0];
        if (!file) {
            this.showToast('Please select a PDF file first', 'error');
            return;
        }

        this.showProgress();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${this.getApiBaseUrl()}/upload-calendar`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.displayPdfResults(result);
                this.showToast('PDF processed successfully!', 'success');
            } else {
                const error = await response.json();
                this.showToast(error.detail || 'Failed to process PDF', 'error');
            }
        } catch (error) {
            console.error('PDF processing error:', error);
            this.showToast('Network error. Please try again.', 'error');
        } finally {
            this.hideProgress();
        }
    }

    async extractTextFromPdf(file) {
        return new Promise((resolve, reject) => {
            // Check if PDF.js is available
            if (typeof pdfjsLib === 'undefined') {
                console.warn('PDF.js not available, using fallback method');
                // Fallback: just return a sample text for testing
                resolve('Academic Instruction Duration 70 Days\nSemester starts from June 2025\nRegular classes will be held on weekdays');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const typedarray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let fullText = '';
                    
                    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }
                    
                    resolve(fullText);
                } catch (error) {
                    console.error('PDF extraction error:', error);
                    // Fallback: return sample text
                    resolve('Academic Instruction Duration 70 Days\nSemester starts from June 2025\nRegular classes will be held on weekdays');
                }
            };
            reader.onerror = (error) => {
                console.error('File reading error:', error);
                reject(error);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    analyzeCalendarText(text) {
        // Simple text analysis to extract working days
        const lines = text.split('\n');
        let workingDays = 0;
        let events = [];
        
        // Look for patterns that indicate working days
        const dayPatterns = [
            /academic instruction duration.*?(\d+)\s*days/i,
            /(\d+)\s*days.*?academic/i,
            /working days.*?(\d+)/i,
            /(\d+).*?working days/i
        ];
        
        for (const line of lines) {
            for (const pattern of dayPatterns) {
                const match = line.match(pattern);
                if (match) {
                    const days = parseInt(match[1]);
                    if (days >= 30 && days <= 200) { // Reasonable range for academic days
                        workingDays = days;
                        break;
                    }
                }
            }
            if (workingDays > 0) break;
        }
        
        // If no specific pattern found, estimate from text length and content
        if (workingDays === 0) {
            const academicKeywords = ['academic', 'semester', 'session', 'class', 'lecture', 'instruction'];
            const hasAcademicContent = academicKeywords.some(keyword => 
                text.toLowerCase().includes(keyword)
            );
            
            if (hasAcademicContent) {
                // Estimate based on text content
                workingDays = Math.max(60, Math.min(120, text.length / 100));
            }
        }
        
        // Generate sample events
        for (let i = 1; i <= Math.min(workingDays, 10); i++) {
            events.push({
                name: `Class Day ${i}`,
                date: `2025-${String(Math.floor(i/30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
                type: 'lecture',
                description: 'Regular class day'
            });
        }
        
        return {
            events: events,
            total_working_days: workingDays,
            confidence_score: workingDays > 0 ? 0.7 : 0.3,
            extracted_text: text.substring(0, 500)
        };
    }

    displayPdfResults(result) {
        console.log('Displaying PDF results:', result);
        
        // Update result cards
        this.extractedEventsEl.textContent = result.events ? result.events.length : 0;
        this.workingDaysEl.textContent = result.total_working_days || 0;
        this.confidenceScoreEl.textContent = `${Math.round((result.confidence_score || 0) * 100)}%`;
        
        // Store data for calculations
        this.extractedData = result;
        this.totalWorkingDays = result.total_working_days || 0;
        this.classesPerWorkingDay = 2; // Default assumption
        this.totalClasses = this.totalWorkingDays * this.classesPerWorkingDay;
        
        // Show results section
        this.pdfResults.style.display = 'block';
        
        // Update summary
        this.updateSummary(0, this.totalClasses, 0);
        
        // Update pie chart if on future optimization page
        if (document.getElementById('futureOptimizationSection').classList.contains('active')) {
            this.updatePieChart();
        }
    }

    calculateAttendanceFromPDF() {
        const attendedClasses = parseInt(this.attendedClassesInput.value) || 0;
        const targetPercentage = parseFloat(this.targetPercentageInput.value) || 75;
        
        if (!this.extractedData) {
            this.showToast('Please upload and process a PDF first', 'error');
            return;
        }

        // Use backend API for calculation
        this.calculateAttendanceWithAPI(attendedClasses, targetPercentage);
    }

    async calculateAttendanceWithAPI(attendedClasses, targetPercentage) {
        try {
            const formData = new FormData();
            formData.append('attended_classes', attendedClasses);
            formData.append('target_percentage', targetPercentage);

            const response = await fetch(`${this.getApiBaseUrl()}/calculate-attendance`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: formData
            });

            if (response.ok) {
                return await response.json();
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to calculate attendance');
            }
        } catch (error) {
            console.error('Attendance calculation error:', error);
            throw error;
        }
    }

    displayAttendanceResults(result) {
        this.currentPercentageEl.textContent = `${result.attendance_percentage}%`;
        this.classesToAttendEl.textContent = result.classes_to_attend_for_target;
        this.remainingClassesEl.textContent = result.remaining_classes;
        
        // Update goal status
        const goalStatus = document.getElementById('goalStatus');
        if (result.attendance_percentage >= result.target_percentage) {
            goalStatus.innerHTML = '<i class="fas fa-check-circle"></i> You are on track to meet your attendance goal!';
            goalStatus.className = 'goal-status on-track';
        } else {
            goalStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> You need to attend ${result.classes_to_attend_for_target} more classes to reach ${result.target_percentage}% attendance.`;
            goalStatus.className = 'goal-status behind';
        }
        
        this.attendanceResults.style.display = 'block';
        
        // Update summary
        this.updateSummary(result.attended_classes, result.total_classes, result.classes_to_attend_for_target);
        
        // Update pie chart if on future optimization page
        if (document.getElementById('futureOptimizationSection').classList.contains('active')) {
            this.updatePieChart();
        }
    }

    calculateManualAttendance() {
        const totalWorkingDays = parseInt(this.totalWorkingDaysInput.value) || 0;
        const classesPerDay = parseInt(this.classesPerDayInput.value) || 2;
        const attendedClasses = parseInt(this.attendedClassesManualInput.value) || 0;
        const targetPercentage = 75;

        if (totalWorkingDays <= 0 || classesPerDay <= 0) {
            this.showToast('Please enter valid working days and classes per day.', 'error');
            return;
        }

        if (attendedClasses < 0) {
            this.showToast('Please enter a valid number of attended classes.', 'error');
            return;
        }

        const totalClasses = totalWorkingDays * classesPerDay;
        const currentPercentage = (attendedClasses / totalClasses) * 100;
        const remainingClasses = Math.max(0, totalClasses - attendedClasses);
        
        // Calculate classes needed to reach target
        let classesToAttend = 0;
        if (currentPercentage < targetPercentage) {
            const targetAttended = Math.ceil((targetPercentage / 100) * totalClasses);
            classesToAttend = Math.max(0, targetAttended - attendedClasses);
        }

        // Update manual results display
        this.manualTotalClassesEl.textContent = totalClasses;
        this.manualCurrentPercentageEl.textContent = `${Math.round(currentPercentage)}%`;
        this.manualClassesToAttendEl.textContent = classesToAttend;

        // Update goal status
        if (currentPercentage >= targetPercentage) {
            this.manualGoalStatusEl.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Great job! You've reached your target attendance goal of ${targetPercentage}%.
            `;
            this.manualGoalStatusEl.className = 'goal-status on-track';
        } else {
            this.manualGoalStatusEl.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> 
                You need to attend ${classesToAttend} more classes to reach your ${targetPercentage}% goal.
            `;
            this.manualGoalStatusEl.className = 'goal-status behind';
        }

        // Update summary
        this.updateSummary(attendedClasses, totalClasses, classesToAttend);

        // Show results
        this.manualResults.style.display = 'block';
        this.manualResults.scrollIntoView({ behavior: 'smooth' });
    }

    updateSummary(attendedClasses, totalClasses, classesToAttend) {
        const currentPercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
        
        this.summaryTotalClassesEl.textContent = totalClasses;
        this.summaryCurrentAttendanceEl.textContent = `${Math.round(currentPercentage)}%`;
        this.summaryClassesToAttendEl.textContent = classesToAttend;
    }

    showProgress() {
        this.uploadProgress.style.display = 'block';
        this.uploadProgressFill.style.width = '0%';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            this.uploadProgressFill.style.width = `${progress}%`;
        }, 200);
        
        this.progressInterval = interval;
    }

    hideProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        this.uploadProgressFill.style.width = '100%';
        setTimeout(() => {
            this.uploadProgress.style.display = 'none';
        }, 500);
    }

    showToast(message, type = 'info') {
        const toast = this.toast;
        const messageEl = toast.querySelector('.toast-message');
        const iconEl = toast.querySelector('.toast-icon');
        
        messageEl.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveData() {
        const data = {
            extractedData: this.extractedData,
            totalWorkingDays: this.totalWorkingDays,
            classesPerWorkingDay: this.classesPerWorkingDay,
            totalClasses: this.totalClasses,
            timestamp: Date.now()
        };
        localStorage.setItem('attendanceTrackerData', JSON.stringify(data));
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('attendanceTrackerData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.extractedData = data.extractedData;
                this.totalWorkingDays = data.totalWorkingDays;
                this.classesPerWorkingDay = data.classesPerWorkingDay;
                this.totalClasses = data.totalClasses;
                
                if (this.extractedData) {
                    this.displayPdfResults(this.extractedData);
                }
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    testFunctionality() {
        console.log('Testing functionality...');
        this.showToast('Test functionality triggered!', 'info');
    }

    // Authentication Methods
    checkAuthStatus() {
        if (this.authToken) {
            this.showDashboard();
        } else {
            this.showAuthForm();
        }
    }

    switchToLogin() {
        this.loginTab.classList.add('active');
        this.registerTab.classList.remove('active');
        this.loginForm.style.display = 'block';
        this.registerForm.style.display = 'none';
        this.hideErrors();
    }

    switchToRegister() {
        this.registerTab.classList.add('active');
        this.loginTab.classList.remove('active');
        this.registerForm.style.display = 'block';
        this.loginForm.style.display = 'none';
        this.hideErrors();
    }

    async handleLogin() {
        const username = this.loginUsername.value;
        const password = this.loginPassword.value;

        if (!username || !password) {
            this.showLoginError('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(`${this.getApiBaseUrl()}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.authToken = data.token;
                this.currentUser = data.user;
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                this.showDashboard();
                this.showToast('Login successful!', 'success');
            } else {
                this.showLoginError(data.detail || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError('Network error. Please try again.');
        }
    }

    async handleRegister() {
        const username = this.registerUsername.value;
        const email = this.registerEmail.value;
        const fullName = this.registerFullName.value;
        const password = this.registerPassword.value;

        if (!username || !email || !fullName || !password) {
            this.showRegisterError('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(`${this.getApiBaseUrl()}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    full_name: fullName,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.authToken = data.token;
                this.currentUser = data.user;
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                this.showDashboard();
                this.showToast('Registration successful!', 'success');
            } else {
                this.showRegisterError(data.detail || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showRegisterError('Network error. Please try again.');
        }
    }

    handleLogout() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        this.showAuthForm();
        this.showToast('Logged out successfully', 'info');
    }

    showDashboard() {
        this.authSection.style.display = 'none';
        this.userDashboard.style.display = 'block';
        this.sidebar.style.display = 'block';
        
        if (this.currentUser) {
            this.userFullName.textContent = this.currentUser.full_name;
            this.sidebarUserName.textContent = this.currentUser.full_name;
        }
        
        // Show home section by default
        this.switchSection('home');
    }

    showAuthForm() {
        this.authSection.style.display = 'block';
        this.userDashboard.style.display = 'none';
        this.sidebar.style.display = 'none';
        this.switchToLogin();
    }

    showLoginError(message) {
        this.loginError.textContent = message;
        this.loginError.style.display = 'block';
    }

    showRegisterError(message) {
        this.registerError.textContent = message;
        this.registerError.style.display = 'block';
    }

    hideErrors() {
        this.loginError.style.display = 'none';
        this.registerError.style.display = 'none';
    }

    // Helper method to get API base URL
    getApiBaseUrl() {
        // Check if we're in development or production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        } else {
            // For production, you can set this environment variable in Netlify
            return window.API_BASE_URL || 'https://your-backend-url.com';
        }
    }

    // Helper method to add auth headers to API requests
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
        return headers;
    }

    // Sidebar Navigation Methods
    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
        this.mainContentWrapper.classList.toggle('sidebar-collapsed');
    }

    switchSection(sectionName) {
        console.log('Switching to section:', sectionName);
        
        // Update navigation active state
        this.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionName) {
                item.classList.add('active');
            }
        });

        // Show corresponding section
        this.dashboardSections.forEach(section => {
            section.classList.remove('active');
            console.log('Checking section:', section.id, 'against:', sectionName + 'Section');
        });

        // Map section names to actual section IDs
        const sectionIdMap = {
            'home': 'homeSection',
            'future-optimization': 'futureOptimizationSection',
            'timetable': 'timetableSection'
        };

        const targetSectionId = sectionIdMap[sectionName];
        if (targetSectionId) {
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('Activated section:', targetSectionId);
            } else {
                console.error('Section not found:', targetSectionId);
            }
        }

        // Initialize section-specific features
        if (sectionName === 'future-optimization') {
            this.initializeCalendar();
            this.initializePieChart();
        } else if (sectionName === 'timetable') {
            this.initializeTimetable();
        }
    }

    // Calendar Methods
    initializeCalendar() {
        console.log('Initializing calendar...');
        this.renderCalendar();
        this.loadHolidays();
        
        // Ensure calendar is visible
        if (this.calendarGrid) {
            this.calendarGrid.style.display = 'grid';
        }
        
        // Update pie chart
        this.updatePieChart();
    }

    renderCalendar() {
        console.log('Rendering calendar...');
        const year = this.selectedMonth.getFullYear();
        const month = this.selectedMonth.getMonth();
        
        this.currentMonthEl.textContent = this.selectedMonth.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        this.calendarGrid.innerHTML = '';
        console.log('Calendar grid element:', this.calendarGrid);

        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day calendar-day-header';
            dayHeader.textContent = day;
            this.calendarGrid.appendChild(dayHeader);
        });

        // Add calendar days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();

            // Check if it's today
            if (date.toDateString() === this.currentDate.toDateString()) {
                dayElement.classList.add('today');
            }

            // Check if it's a holiday
            const dateString = date.toISOString().split('T')[0];
            const holiday = this.holidays.find(h => h.date === dateString);
            if (holiday) {
                dayElement.classList.add('holiday');
                dayElement.title = holiday.reason || 'Holiday';
            }

            // Check if it's from other month
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }

            dayElement.addEventListener('click', () => this.selectCalendarDate(date));
            this.calendarGrid.appendChild(dayElement);
        }
        
        console.log('Calendar rendered with', this.calendarGrid.children.length, 'elements');
    }

    previousMonth() {
        this.selectedMonth.setMonth(this.selectedMonth.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.selectedMonth.setMonth(this.selectedMonth.getMonth() + 1);
        this.renderCalendar();
    }

    selectCalendarDate(date) {
        this.holidayDate.value = date.toISOString().split('T')[0];
    }

    addHoliday() {
        const date = this.holidayDate.value;
        const reason = this.holidayReason.value.trim();

        if (!date) {
            this.showToast('Please select a date', 'error');
            return;
        }

        // Check if holiday already exists
        const existingIndex = this.holidays.findIndex(h => h.date === date);
        if (existingIndex !== -1) {
            this.holidays[existingIndex].reason = reason;
        } else {
            this.holidays.push({ date, reason });
        }

        this.saveHolidays();
        this.renderCalendar();
        this.updateHolidayAnalysis();
        this.showToast('Holiday added successfully', 'success');
        
        // Clear form
        this.holidayDate.value = '';
        this.holidayReason.value = '';
    }

    loadHolidays() {
        const saved = localStorage.getItem('holidays_' + this.currentUser?.username);
        if (saved) {
            this.holidays = JSON.parse(saved);
        }
    }

    saveHolidays() {
        if (this.currentUser) {
            localStorage.setItem('holidays_' + this.currentUser.username, JSON.stringify(this.holidays));
        }
    }

    updateHolidayAnalysis() {
        const totalHolidays = this.holidays.length;
        const classesMissed = totalHolidays * this.classesPerWorkingDay;
        const totalClasses = this.totalClasses;
        const attendanceAfterHolidays = totalClasses > 0 ? 
            Math.round(((totalClasses - classesMissed) / totalClasses) * 100) : 0;

        document.getElementById('totalHolidays').textContent = totalHolidays;
        document.getElementById('classesMissed').textContent = classesMissed;
        document.getElementById('attendanceAfterHolidays').textContent = attendanceAfterHolidays + '%';

        this.holidayAnalysis.style.display = 'block';
    }

    // Timetable Methods
    initializeTimetable() {
        this.renderTimetable();
        this.loadTimetableData();
    }

    renderTimetable() {
        this.timetableBody.innerHTML = '';

        this.days.forEach(day => {
            const row = document.createElement('div');
            row.className = 'timetable-row';

            // Day header
            const dayHeader = document.createElement('div');
            dayHeader.className = 'timetable-cell day-header';
            dayHeader.textContent = day;
            row.appendChild(dayHeader);

            // Time slots (now columns)
            const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00',
                                '2:00-3:00', '3:00-4:00', '4:00-5:00', '5:00-6:00'];
            timeSlots.forEach(timeSlot => {
                const cell = document.createElement('div');
                cell.className = 'timetable-cell';
                cell.dataset.time = timeSlot;
                cell.dataset.day = day.toLowerCase(); // Store day as lowercase

                const classData = this.timetable[`${day.toLowerCase()}_${timeSlot}`];
                if (classData) {
                    cell.classList.add('has-class');
                    cell.innerHTML = `
                        <div style="font-weight: bold; margin-bottom: 2px;">${classData.name}</div>
                        <div style="font-size: 0.75rem; opacity: 0.9;">${classData.subject}</div>
                        ${classData.teacher ? `<div style="font-size: 0.7rem; opacity: 0.8;">${classData.teacher}</div>` : ''}
                        ${classData.room ? `<div style="font-size: 0.7rem; opacity: 0.8;">Room ${classData.room}</div>` : ''}
                    `;
                    cell.title = `${classData.name} - ${classData.subject}${classData.teacher ? ` - ${classData.teacher}` : ''}${classData.room ? ` - Room ${classData.room}` : ''}`;
                } else {
                    cell.textContent = 'Click to add class';
                    cell.style.opacity = '0.6';
                }

                cell.addEventListener('click', () => this.editTimetableCell(cell));
                row.appendChild(cell);
            });

            this.timetableBody.appendChild(row);
        });
    }

    editTimetableCell(cell) {
        const timeSlot = cell.dataset.time;
        const day = cell.dataset.day;
        const key = `${day}_${timeSlot}`;
        const classData = this.timetable[key];

        if (classData) {
            const action = prompt(`Class: ${classData.name}\nSubject: ${classData.subject}\nTeacher: ${classData.teacher}\nRoom: ${classData.room}\n\nEnter 'delete' to remove this class:`);
            
            if (action === 'delete') {
                delete this.timetable[key];
                this.renderTimetable();
                this.updateTimetableSummary();
                this.showToast('Class removed from timetable!', 'info');
            }
        } else {
            const className = prompt('Enter class name:');
            if (!className) return;

            const subject = prompt('Enter subject:');
            if (!subject) return;

            const teacher = prompt('Enter teacher name (optional):');
            const room = prompt('Enter room number (optional):');

            this.timetable[key] = {
                name: className,
                subject: subject,
                teacher: teacher || '',
                room: room || ''
            };

            this.renderTimetable();
            this.updateTimetableSummary();
            this.showToast('Class added to timetable!', 'success');
        }
    }

    addClassToTimetable() {
        const className = prompt('Enter class name:');
        if (!className) return;

        const subject = prompt('Enter subject:');
        if (!subject) return;

        const teacher = prompt('Enter teacher name (optional):');
        const room = prompt('Enter room number (optional):');

        // For now, add to the first available slot (Monday 9:00-10:00)
        const key = 'monday_9:00-10:00';
        this.timetable[key] = {
            name: className,
            subject: subject,
            teacher: teacher || '',
            room: room || ''
        };

        this.renderTimetable();
        this.updateTimetableSummary();
        this.showToast('Class added to timetable!', 'success');
    }

    saveTimetable() {
        this.saveTimetableData();
        this.showToast('Timetable saved successfully', 'success');
    }

    loadTimetable() {
        this.loadTimetableData();
        this.renderTimetable();
        this.updateTimetableSummary();
        this.showToast('Timetable loaded successfully', 'success');
    }

    saveTimetableData() {
        if (this.currentUser) {
            localStorage.setItem('timetable_' + this.currentUser.username, JSON.stringify(this.timetable));
        }
    }

    loadTimetableData() {
        if (this.currentUser) {
            const saved = localStorage.getItem('timetable_' + this.currentUser.username);
            if (saved) {
                this.timetable = JSON.parse(saved);
            }
        }
    }

    updateTimetableSummary() {
        const totalClasses = Object.keys(this.timetable).length;
        const daysWithClasses = new Set(Object.keys(this.timetable).map(key => key.split('_')[0])).size;
        const averageClassesPerDay = daysWithClasses > 0 ? Math.round(totalClasses / daysWithClasses) : 0;

        document.getElementById('totalClassesPerWeek').textContent = totalClasses;
        document.getElementById('workingDaysPerWeek').textContent = daysWithClasses;
        document.getElementById('averageClassesPerDay').textContent = averageClassesPerDay;

        this.timetableSummary.style.display = 'block';
    }

    // Pie Chart Methods
    initializePieChart() {
        const ctx = document.getElementById('attendancePieChart');
        if (!ctx) return;

        this.attendancePieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Classes Attended', 'Classes Missed (Holidays)', 'Remaining Classes'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#667eea',  // Blue for attended
                        '#f56565',  // Red for missed
                        '#e2e8f0'   // Gray for remaining
                    ],
                    borderColor: [
                        '#5a67d8',
                        '#e53e3e',
                        '#cbd5e0'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    updatePieChart() {
        if (!this.attendancePieChart) {
            this.initializePieChart();
        }

        // Get attendance data
        const attendedClasses = parseInt(this.attendedClassesInput?.value) || 0;
        const totalClasses = this.totalClasses || 0;
        const classesMissed = this.holidays.length * this.classesPerWorkingDay;
        const remainingClasses = Math.max(0, totalClasses - attendedClasses - classesMissed);

        // Update chart data
        this.attendancePieChart.data.datasets[0].data = [
            attendedClasses,
            classesMissed,
            remainingClasses
        ];

        this.attendancePieChart.update();
    }

    // Override updateHolidayAnalysis to include pie chart update
    updateHolidayAnalysis() {
        const totalHolidays = this.holidays.length;
        const classesMissed = totalHolidays * this.classesPerWorkingDay;
        const totalClasses = this.totalClasses;
        const attendanceAfterHolidays = totalClasses > 0 ? 
            Math.round(((totalClasses - classesMissed) / totalClasses) * 100) : 0;

        document.getElementById('totalHolidays').textContent = totalHolidays;
        document.getElementById('classesMissed').textContent = classesMissed;
        document.getElementById('attendanceAfterHolidays').textContent = attendanceAfterHolidays + '%';

        this.holidayAnalysis.style.display = 'block';
        
        // Update pie chart
        this.updatePieChart();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StaticAttendanceTracker();
}); 