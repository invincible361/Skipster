// Attendance Tracker Application
class AttendanceTracker {
    constructor() {
        this.events = JSON.parse(localStorage.getItem('academicEvents')) || [];
        this.attendance = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
        this.targetPercentage = parseInt(localStorage.getItem('targetPercentage')) || 75;
        
        this.initializeElements();
        this.bindEvents();
        this.loadData();
        this.updateUI();
    }

    initializeElements() {
        // PDF Upload elements
        this.pdfFileInput = document.getElementById('pdfFile');
        this.uploadPdfBtn = document.getElementById('uploadPdfBtn');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.uploadProgressFill = document.getElementById('uploadProgressFill');
        this.pdfResults = document.getElementById('pdfResults');
        this.extractedEventsEl = document.getElementById('extractedEvents');
        this.workingDaysEl = document.getElementById('workingDays');
        this.confidenceScoreEl = document.getElementById('confidenceScore');
        this.importEventsBtn = document.getElementById('importEventsBtn');
        this.fileInputWrapper = document.querySelector('.file-input-wrapper');

        // Timetable Upload elements
        this.timetableFileInput = document.getElementById('timetableFile');
        this.uploadTimetableBtn = document.getElementById('uploadTimetableBtn');
        this.timetableProgress = document.getElementById('timetableProgress');
        this.timetableProgressFill = document.getElementById('timetableProgressFill');
        this.timetableResults = document.getElementById('timetableResults');
        this.timetableEventsEl = document.getElementById('timetableEvents');
        this.timetableWorkingDaysEl = document.getElementById('timetableWorkingDays');
        this.timetableConfidenceEl = document.getElementById('timetableConfidence');
        this.importTimetableBtn = document.getElementById('importTimetableBtn');
        this.timetableWrapper = document.querySelector('.timetable-wrapper');
        this.weeklySchedule = document.getElementById('weeklySchedule');
        this.scheduleGrid = document.getElementById('scheduleGrid');

        // Combined Processing elements
        this.combinedCalendarFile = document.getElementById('combinedCalendarFile');
        this.combinedTimetableFile = document.getElementById('combinedTimetableFile');
        this.processCombinedBtn = document.getElementById('processCombinedBtn');
        this.combinedProgress = document.getElementById('combinedProgress');
        this.combinedProgressFill = document.getElementById('combinedProgressFill');
        this.combinedResults = document.getElementById('combinedResults');
        this.combinedTotalDaysEl = document.getElementById('combinedTotalDays');
        this.calendarDaysEl = document.getElementById('calendarDays');
        this.timetableDaysEl = document.getElementById('timetableDays');
        this.combinedConfidenceEl = document.getElementById('combinedConfidence');
        this.importCombinedBtn = document.getElementById('importCombinedBtn');
        this.combinedSummaryEl = document.getElementById('combinedSummary');

        // Calendar elements
        this.eventNameInput = document.getElementById('eventName');
        this.eventDateInput = document.getElementById('eventDate');
        this.eventTimeInput = document.getElementById('eventTime');
        this.eventTypeSelect = document.getElementById('eventType');
        this.addEventBtn = document.getElementById('addEventBtn');
        this.calendarList = document.getElementById('calendarList');

        // Attendance elements
        this.attendanceDateInput = document.getElementById('attendanceDate');
        this.attendanceStatusSelect = document.getElementById('attendanceStatus');
        this.attendanceNotesInput = document.getElementById('attendanceNotes');
        this.markAttendanceBtn = document.getElementById('markAttendanceBtn');
        this.attendanceList = document.getElementById('attendanceList');

        // Stats elements
        this.totalClassesEl = document.getElementById('totalClasses');
        this.attendedClassesEl = document.getElementById('attendedClasses');
        this.attendancePercentageEl = document.getElementById('attendancePercentage');
        this.remainingClassesEl = document.getElementById('remainingClasses');

        // Goal elements
        this.targetPercentageInput = document.getElementById('targetPercentage');
        this.updateGoalBtn = document.getElementById('updateGoalBtn');
        this.progressFill = document.getElementById('progressFill');
        this.currentProgressEl = document.getElementById('currentProgress');
        this.targetProgressEl = document.getElementById('targetProgress');
        this.goalStatusEl = document.getElementById('goalStatus');

        // Summary elements
        this.classesToAttendEl = document.getElementById('classesToAttend');
        this.currentStreakEl = document.getElementById('currentStreak');
        this.bestStreakEl = document.getElementById('bestStreak');

        // Toast
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        // PDF Upload events
        this.uploadPdfBtn.addEventListener('click', () => this.uploadPdf());
        this.importEventsBtn.addEventListener('click', () => this.importExtractedEvents());
        this.setupFileUpload();
        
        // Timetable Upload events
        this.uploadTimetableBtn.addEventListener('click', () => this.uploadTimetable());
        this.importTimetableBtn.addEventListener('click', () => this.importTimetableEvents());
        this.setupTimetableUpload();
        
        // Combined Processing events
        this.processCombinedBtn.addEventListener('click', () => this.processCombined());
        this.importCombinedBtn.addEventListener('click', () => this.importCombinedEvents());
        
        // Calendar events
        this.addEventBtn.addEventListener('click', () => this.addEvent());
        
        // Attendance events
        this.markAttendanceBtn.addEventListener('click', () => this.markAttendance());
        
        // Goal events
        this.updateGoalBtn.addEventListener('click', () => this.updateGoal());
        
        // Set default dates
        this.setDefaultDates();
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        this.eventDateInput.value = today;
        this.attendanceDateInput.value = today;
    }

    setupFileUpload() {
        // File input change event
        this.pdfFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.updateFileInputDisplay(file.name);
            }
        });

        // Drag and drop functionality
        this.fileInputWrapper.addEventListener('click', () => {
            this.pdfFileInput.click();
        });

        this.fileInputWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileInputWrapper.classList.add('dragover');
        });

        this.fileInputWrapper.addEventListener('dragleave', () => {
            this.fileInputWrapper.classList.remove('dragover');
        });

        this.fileInputWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileInputWrapper.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.pdfFileInput.files = files;
                this.updateFileInputDisplay(files[0].name);
            } else {
                this.showToast('Please select a valid PDF file', 'error');
            }
        });
    }

    setupTimetableUpload() {
        // File input change event
        this.timetableFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.updateTimetableInputDisplay(file.name);
            }
        });

        // Drag and drop functionality
        this.timetableWrapper.addEventListener('click', () => {
            this.timetableFileInput.click();
        });

        this.timetableWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.timetableWrapper.classList.add('dragover');
        });

        this.timetableWrapper.addEventListener('dragleave', () => {
            this.timetableWrapper.classList.remove('dragover');
        });

        this.timetableWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            this.timetableWrapper.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.timetableFileInput.files = files;
                this.updateTimetableInputDisplay(files[0].name);
            } else {
                this.showToast('Please select a valid PDF file', 'error');
            }
        });
    }

    updateFileInputDisplay(fileName) {
        const placeholder = this.fileInputWrapper.querySelector('.file-input-placeholder');
        placeholder.innerHTML = `
            <i class="fas fa-file-pdf"></i>
            <span>${fileName}</span>
        `;
    }

    updateTimetableInputDisplay(fileName) {
        const placeholder = this.timetableWrapper.querySelector('.file-input-placeholder');
        placeholder.innerHTML = `
            <i class="fas fa-file-pdf"></i>
            <span>${fileName}</span>
        `;
    }

    async uploadPdf() {
        const file = this.pdfFileInput.files[0];
        if (!file) {
            this.showToast('Please select a PDF file first', 'error');
            return;
        }

        if (file.type !== 'application/pdf') {
            this.showToast('Please select a valid PDF file', 'error');
            return;
        }

        // Show progress
        this.uploadProgress.style.display = 'block';
        this.uploadProgressFill.style.width = '0%';
        this.uploadPdfBtn.disabled = true;

        try {
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress > 90) progress = 90;
                this.uploadProgressFill.style.width = `${progress}%`;
            }, 200);

            // Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // Upload to backend
            const response = await fetch('/upload-calendar', {
                method: 'POST',
                body: formData
            });

            clearInterval(progressInterval);
            this.uploadProgressFill.style.width = '100%';

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Store extracted data
            this.extractedData = result;
            
            // Display results
            this.displayPdfResults(result);
            
            this.showToast('PDF processed successfully!', 'success');

        } catch (error) {
            console.error('Error uploading PDF:', error);
            this.showToast('Error processing PDF. Please try again.', 'error');
        } finally {
            this.uploadProgress.style.display = 'none';
            this.uploadPdfBtn.disabled = false;
        }
    }

    async uploadTimetable() {
        const file = this.timetableFileInput.files[0];
        if (!file) {
            this.showToast('Please select a timetable PDF file first', 'error');
            return;
        }

        if (file.type !== 'application/pdf') {
            this.showToast('Please select a valid PDF file', 'error');
            return;
        }

        // Show progress
        this.timetableProgress.style.display = 'block';
        this.timetableProgressFill.style.width = '0%';
        this.uploadTimetableBtn.disabled = true;

        try {
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress > 90) progress = 90;
                this.timetableProgressFill.style.width = `${progress}%`;
            }, 200);

            // Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // Upload to backend
            const response = await fetch('/upload-timetable', {
                method: 'POST',
                body: formData
            });

            clearInterval(progressInterval);
            this.timetableProgressFill.style.width = '100%';

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Store extracted timetable data
            this.timetableData = result;
            
            // Display results
            this.displayTimetableResults(result);
            
            this.showToast('Timetable processed successfully!', 'success');

        } catch (error) {
            console.error('Error uploading timetable:', error);
            this.showToast('Error processing timetable. Please try again.', 'error');
        } finally {
            this.timetableProgress.style.display = 'none';
            this.uploadTimetableBtn.disabled = false;
        }
    }

    async processCombined() {
        const calendarFile = this.combinedCalendarFile.files[0];
        const timetableFile = this.combinedTimetableFile.files[0];
        
        if (!calendarFile || !timetableFile) {
            this.showToast('Please select both calendar and timetable PDF files', 'error');
            return;
        }

        if (calendarFile.type !== 'application/pdf' || timetableFile.type !== 'application/pdf') {
            this.showToast('Please select valid PDF files', 'error');
            return;
        }

        // Show progress
        this.combinedProgress.style.display = 'block';
        this.combinedProgressFill.style.width = '0%';
        this.processCombinedBtn.disabled = true;

        try {
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 90) progress = 90;
                this.combinedProgressFill.style.width = `${progress}%`;
            }, 300);

            // Create FormData
            const formData = new FormData();
            formData.append('calendar_file', calendarFile);
            formData.append('timetable_file', timetableFile);

            // Upload to backend
            const response = await fetch('/process-combined', {
                method: 'POST',
                body: formData
            });

            clearInterval(progressInterval);
            this.combinedProgressFill.style.width = '100%';

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Store combined data
            this.combinedData = result;
            
            // Display results
            this.displayCombinedResults(result);
            
            this.showToast('Both files processed successfully!', 'success');

        } catch (error) {
            console.error('Error processing combined files:', error);
            this.showToast('Error processing files. Please try again.', 'error');
        } finally {
            this.combinedProgress.style.display = 'none';
            this.processCombinedBtn.disabled = false;
        }
    }

    displayPdfResults(result) {
        this.extractedEventsEl.textContent = result.events.length;
        this.workingDaysEl.textContent = result.total_working_days;
        this.confidenceScoreEl.textContent = `${Math.round(result.confidence_score * 100)}%`;
        
        this.pdfResults.style.display = 'block';
        
        // Scroll to results
        this.pdfResults.scrollIntoView({ behavior: 'smooth' });
    }

    displayTimetableResults(result) {
        this.timetableEventsEl.textContent = result.timetable_events.length;
        this.timetableWorkingDaysEl.textContent = result.total_working_days;
        this.timetableConfidenceEl.textContent = `${Math.round(result.confidence_score * 100)}%`;
        
        // Display weekly schedule if available
        if (result.weekly_schedule && Object.keys(result.weekly_schedule).length > 0) {
            this.displayWeeklySchedule(result.weekly_schedule);
            this.weeklySchedule.style.display = 'block';
        }
        
        this.timetableResults.style.display = 'block';
        
        // Scroll to results
        this.timetableResults.scrollIntoView({ behavior: 'smooth' });
    }

    displayCombinedResults(result) {
        this.combinedTotalDaysEl.textContent = result.total_working_days;
        this.calendarDaysEl.textContent = result.calendar_working_days;
        this.timetableDaysEl.textContent = result.timetable_working_days;
        this.combinedConfidenceEl.textContent = `${Math.round(result.confidence_score * 100)}%`;
        
        // Update summary
        const summary = `Calendar analysis found ${result.calendar_working_days} working days, ` +
                       `timetable analysis found ${result.timetable_working_days} working days. ` +
                       `Combined total: ${result.total_working_days} working days.`;
        this.combinedSummaryEl.textContent = summary;
        
        this.combinedResults.style.display = 'block';
        
        // Scroll to results
        this.combinedResults.scrollIntoView({ behavior: 'smooth' });
    }

    displayWeeklySchedule(weeklySchedule) {
        this.scheduleGrid.innerHTML = '';
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        days.forEach(day => {
            const dayEvents = weeklySchedule[day] || [];
            if (dayEvents.length > 0) {
                const daySchedule = document.createElement('div');
                daySchedule.className = 'day-schedule';
                
                daySchedule.innerHTML = `
                    <div class="day-header">${day}</div>
                    ${dayEvents.map(event => `
                        <div class="class-item">
                            <div class="class-subject">${event.subject}</div>
                            <div class="class-time">${event.time}</div>
                            ${event.room ? `<div class="class-room">Room: ${event.room}</div>` : ''}
                        </div>
                    `).join('')}
                `;
                
                this.scheduleGrid.appendChild(daySchedule);
            }
        });
    }

    importExtractedEvents() {
        if (!this.extractedData || !this.extractedData.events) {
            this.showToast('No extracted events to import', 'error');
            return;
        }

        let importedCount = 0;
        for (const eventData of this.extractedData.events) {
            // Check if event already exists
            const existingEvent = this.events.find(event => 
                event.date === eventData.date && event.name === eventData.name
            );
            
            if (!existingEvent) {
                const event = {
                    id: Date.now() + Math.random(),
                    name: eventData.name,
                    date: eventData.date,
                    time: eventData.time || '',
                    type: eventData.type || 'lecture',
                    description: eventData.description || '',
                    createdAt: new Date().toISOString(),
                    imported: true
                };
                
                this.events.push(event);
                importedCount++;
            }
        }

        this.saveData();
        this.updateUI();
        
        this.showToast(`Successfully imported ${importedCount} events!`, 'success');
        
        // Hide results after import
        this.pdfResults.style.display = 'none';
    }

    importTimetableEvents() {
        if (!this.timetableData || !this.timetableData.timetable_events) {
            this.showToast('No extracted timetable events to import', 'error');
            return;
        }

        let importedCount = 0;
        for (const eventData of this.timetableData.timetable_events) {
            // Convert timetable event to calendar event format
            const event = {
                id: Date.now() + Math.random(),
                name: eventData.subject,
                date: this.getNextDateForDay(eventData.day),
                time: eventData.time || '',
                type: 'lecture',
                description: `${eventData.subject} - ${eventData.day} ${eventData.time}`,
                createdAt: new Date().toISOString(),
                imported: true
            };
            
            this.events.push(event);
            importedCount++;
        }

        this.saveData();
        this.updateUI();
        
        this.showToast(`Successfully imported ${importedCount} timetable events!`, 'success');
        
        // Hide results after import
        this.timetableResults.style.display = 'none';
    }

    importCombinedEvents() {
        if (!this.combinedData) {
            this.showToast('No combined data to import', 'error');
            return;
        }

        let importedCount = 0;
        
        // Import calendar events
        if (this.combinedData.calendar_events) {
            for (const eventData of this.combinedData.calendar_events) {
                const event = {
                    id: Date.now() + Math.random(),
                    name: eventData.name,
                    date: eventData.date,
                    time: eventData.time || '',
                    type: eventData.type || 'lecture',
                    description: eventData.description || '',
                    createdAt: new Date().toISOString(),
                    imported: true
                };
                
                this.events.push(event);
                importedCount++;
            }
        }
        
        // Import timetable events
        if (this.combinedData.timetable_events) {
            for (const eventData of this.combinedData.timetable_events) {
                const event = {
                    id: Date.now() + Math.random(),
                    name: eventData.subject,
                    date: this.getNextDateForDay(eventData.day),
                    time: eventData.time || '',
                    type: 'lecture',
                    description: `${eventData.subject} - ${eventData.day} ${eventData.time}`,
                    createdAt: new Date().toISOString(),
                    imported: true
                };
                
                this.events.push(event);
                importedCount++;
            }
        }

        this.saveData();
        this.updateUI();
        
        this.showToast(`Successfully imported ${importedCount} combined events!`, 'success');
        
        // Hide results after import
        this.combinedResults.style.display = 'none';
    }

    getNextDateForDay(dayName) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = days.indexOf(dayName);
        const today = new Date();
        const currentDay = today.getDay();
        
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysToAdd);
        
        return nextDate.toISOString().split('T')[0];
    }

    addEvent() {
        const name = this.eventNameInput.value.trim();
        const date = this.eventDateInput.value;
        const time = this.eventTimeInput.value;
        const type = this.eventTypeSelect.value;

        if (!name || !date) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const event = {
            id: Date.now(),
            name,
            date,
            time,
            type,
            createdAt: new Date().toISOString()
        };

        this.events.push(event);
        this.saveData();
        this.updateUI();
        this.clearEventForm();
        this.showToast('Event added successfully!', 'success');
    }

    markAttendance() {
        const date = this.attendanceDateInput.value;
        const status = this.attendanceStatusSelect.value;
        const notes = this.attendanceNotesInput.value.trim();

        if (!date) {
            this.showToast('Please select a date', 'error');
            return;
        }

        // Check if attendance already exists for this date
        const existingIndex = this.attendance.findIndex(record => record.date === date);
        
        if (existingIndex !== -1) {
            // Update existing record
            this.attendance[existingIndex] = {
                ...this.attendance[existingIndex],
                status,
                notes,
                updatedAt: new Date().toISOString()
            };
            this.showToast('Attendance updated successfully!', 'success');
        } else {
            // Add new record
            const record = {
                id: Date.now(),
                date,
                status,
                notes,
                createdAt: new Date().toISOString()
            };
            this.attendance.push(record);
            this.showToast('Attendance marked successfully!', 'success');
        }

        this.saveData();
        this.updateUI();
        this.clearAttendanceForm();
    }

    updateGoal() {
        const newTarget = parseInt(this.targetPercentageInput.value);
        
        if (newTarget < 0 || newTarget > 100) {
            this.showToast('Please enter a valid percentage (0-100)', 'error');
            return;
        }

        this.targetPercentage = newTarget;
        localStorage.setItem('targetPercentage', newTarget.toString());
        this.updateUI();
        this.showToast('Goal updated successfully!', 'success');
    }

    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(event => event.id !== eventId);
            this.saveData();
            this.updateUI();
            this.showToast('Event deleted successfully!', 'success');
        }
    }

    deleteAttendance(recordId) {
        if (confirm('Are you sure you want to delete this attendance record?')) {
            this.attendance = this.attendance.filter(record => record.id !== recordId);
            this.saveData();
            this.updateUI();
            this.showToast('Attendance record deleted successfully!', 'success');
        }
    }

    saveData() {
        localStorage.setItem('academicEvents', JSON.stringify(this.events));
        localStorage.setItem('attendanceRecords', JSON.stringify(this.attendance));
    }

    loadData() {
        this.targetPercentageInput.value = this.targetPercentage;
    }

    updateUI() {
        this.renderCalendar();
        this.renderAttendance();
        this.updateStats();
        this.updateGoalProgress();
        this.updateSummary();
    }

    renderCalendar() {
        if (this.events.length === 0) {
            this.calendarList.innerHTML = '<p style="text-align: center; color: #718096; font-style: italic;">No events added yet. Add your first academic event above!</p>';
            return;
        }

        const sortedEvents = this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        this.calendarList.innerHTML = sortedEvents.map(event => `
            <div class="calendar-item fade-in">
                <button class="btn btn-danger delete-btn" onclick="attendanceTracker.deleteEvent(${event.id})">
                    <i class="fas fa-trash"></i>
                </button>
                <h4>${event.name}</h4>
                <div class="event-details">
                    <span><i class="fas fa-calendar"></i> ${this.formatDate(event.date)}</span>
                    ${event.time ? `<span><i class="fas fa-clock"></i> ${event.time}</span>` : ''}
                    <span class="event-type">${event.type}</span>
                </div>
            </div>
        `).join('');
    }

    renderAttendance() {
        if (this.attendance.length === 0) {
            this.attendanceList.innerHTML = '<p style="text-align: center; color: #718096; font-style: italic;">No attendance records yet. Mark your first attendance above!</p>';
            return;
        }

        const sortedAttendance = this.attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.attendanceList.innerHTML = sortedAttendance.map(record => `
            <div class="attendance-item fade-in">
                <button class="btn btn-danger delete-btn" onclick="attendanceTracker.deleteAttendance(${record.id})">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="status ${record.status}">${record.status}</div>
                <div class="date">${this.formatDate(record.date)}</div>
                ${record.notes ? `<div class="notes">${record.notes}</div>` : ''}
            </div>
        `