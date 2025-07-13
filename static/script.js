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
        
        // Attendance calculation elements
        this.attendedClassesInput = document.getElementById('attendedClasses');
        this.targetPercentageInput = document.getElementById('targetPercentage');
        this.calculateAttendanceBtn = document.getElementById('calculateAttendanceBtn');
        this.attendanceResults = document.getElementById('attendanceResults');
        this.currentPercentageEl = document.getElementById('currentPercentage');
        this.classesToAttendEl = document.getElementById('classesToAttend');
        this.remainingClassesEl = document.getElementById('remainingClasses');
        this.goalStatusEl = document.getElementById('goalStatus');

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

        // Timetable upload elements
        this.timetableFileInput = document.getElementById('timetableFile');
        this.uploadTimetableBtn = document.getElementById('uploadTimetableBtn');
        this.uploadTimetableProgress = document.getElementById('uploadTimetableProgress');
        this.uploadTimetableProgressFill = document.getElementById('uploadTimetableProgressFill');
        this.timetableResults = document.getElementById('timetableResults');
        this.timetableExtracted = document.getElementById('timetableExtracted');
        this.timetableFileInputWrapper = document.querySelector('.timetable-file-input-wrapper');
        this.timetableFileInputPlaceholder = document.querySelector('.timetable-file-input-placeholder');
        
        // Combined upload elements
        this.uploadCombinedBtn = document.getElementById('uploadCombinedBtn');
    }

    bindEvents() {
        // PDF Upload events
        this.uploadPdfBtn.addEventListener('click', () => this.uploadPdf());
        this.importEventsBtn.addEventListener('click', () => this.importExtractedEvents());
        this.calculateAttendanceBtn.addEventListener('click', () => this.calculateAttendanceFromPDF());
        this.setupFileUpload();
        
        // Calendar events
        this.addEventBtn.addEventListener('click', () => this.addEvent());
        
        // Attendance events
        this.markAttendanceBtn.addEventListener('click', () => this.markAttendance());
        
        // Goal events
        this.updateGoalBtn.addEventListener('click', () => this.updateGoal());
        
        // Timetable upload events
        this.uploadTimetableBtn.addEventListener('click', () => this.uploadTimetable());
        this.setupTimetableFileUpload();
        
        // Combined upload events
        const uploadCombinedBtn = document.getElementById('uploadCombinedBtn');
        if (uploadCombinedBtn) {
            uploadCombinedBtn.addEventListener('click', () => this.uploadCombined());
        }
        
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

    setupTimetableFileUpload() {
        // File input change event
        this.timetableFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.updateTimetableFileInputDisplay(file.name);
            }
        });
        // Drag and drop functionality
        this.timetableFileInputWrapper.addEventListener('click', () => {
            this.timetableFileInput.click();
        });
        this.timetableFileInputWrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.timetableFileInputWrapper.classList.add('dragover');
        });
        this.timetableFileInputWrapper.addEventListener('dragleave', () => {
            this.timetableFileInputWrapper.classList.remove('dragover');
        });
        this.timetableFileInputWrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            this.timetableFileInputWrapper.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && (files[0].type === 'application/pdf' || files[0].type.startsWith('image/'))) {
                this.timetableFileInput.files = files;
                this.updateTimetableFileInputDisplay(files[0].name);
            } else {
                this.showToast('Please select a valid timetable file (PDF or image)', 'error');
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

    updateTimetableFileInputDisplay(fileName) {
        this.timetableFileInputPlaceholder.innerHTML = `
            <i class="fas fa-file"></i>
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
            this.showToast('Please select a timetable file first', 'error');
            return;
        }
        if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
            this.showToast('Please select a valid timetable file (PDF or image)', 'error');
            return;
        }
        // Show progress
        this.uploadTimetableProgress.style.display = 'block';
        this.uploadTimetableProgressFill.style.width = '0%';
        this.uploadTimetableBtn.disabled = true;
        try {
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress > 90) progress = 90;
                this.uploadTimetableProgressFill.style.width = `${progress}%`;
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
            this.uploadTimetableProgressFill.style.width = '100%';
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            // Store and display extracted timetable data
            this.displayTimetableResults(result);
            this.showToast('Timetable processed successfully!', 'success');
        } catch (error) {
            console.error('Error uploading timetable:', error);
            this.showToast('Error processing timetable. Please try again.', 'error');
        } finally {
            this.uploadTimetableProgress.style.display = 'none';
            this.uploadTimetableBtn.disabled = false;
        }
    }

    async uploadCombined() {
        const calendarFile = this.pdfFileInput.files[0];
        const timetableFile = this.timetableFileInput.files[0];
        
        if (!calendarFile) {
            this.showToast('Please select a calendar PDF file first', 'error');
            return;
        }
        
        if (!timetableFile) {
            this.showToast('Please select a timetable file first', 'error');
            return;
        }

        if (calendarFile.type !== 'application/pdf') {
            this.showToast('Calendar must be a PDF file', 'error');
            return;
        }

        if (!(timetableFile.type === 'application/pdf' || timetableFile.type.startsWith('image/'))) {
            this.showToast('Timetable must be a PDF or image file', 'error');
            return;
        }

        // Show progress
        this.uploadProgress.style.display = 'block';
        this.uploadProgressFill.style.width = '0%';
        this.uploadPdfBtn.disabled = true;
        this.uploadTimetableBtn.disabled = true;

        try {
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 90) progress = 90;
                this.uploadProgressFill.style.width = `${progress}%`;
            }, 200);

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
            this.uploadProgressFill.style.width = '100%';

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Store combined data
            this.combinedData = result;
            
            // Display combined results
            this.displayCombinedResults(result);
            
            this.showToast('Calendar and timetable processed successfully!', 'success');

        } catch (error) {
            console.error('Error uploading combined files:', error);
            this.showToast('Error processing files. Please try again.', 'error');
        } finally {
            this.uploadProgress.style.display = 'none';
            this.uploadPdfBtn.disabled = false;
            this.uploadTimetableBtn.disabled = false;
        }
    }

    displayPdfResults(result) {
        this.extractedEventsEl.textContent = result.events.length;
        this.workingDaysEl.textContent = result.total_working_days;
        this.confidenceScoreEl.textContent = `${Math.round(result.confidence_score * 100)}%`;
        
        // Store the total working days for calculations
        this.totalWorkingDays = result.total_working_days;
        
        this.pdfResults.style.display = 'block';
        
        // Scroll to results
        this.pdfResults.scrollIntoView({ behavior: 'smooth' });
    }

    displayTimetableResults(result) {
        this.timetableResults.style.display = 'block';
        if (result && result.timetable_events && result.timetable_events.length > 0) {
            let html = '<ul>';
            for (const event of result.timetable_events) {
                html += `<li><b>${event.day}</b> - ${event.subject} (${event.time})`;
                if (event.room) html += `, Room: ${event.room}`;
                if (event.instructor) html += `, Instructor: ${event.instructor}`;
                html += '</li>';
            }
            html += '</ul>';
            this.timetableExtracted.innerHTML = html;
        } else {
            this.timetableExtracted.innerHTML = '<p>No timetable events found.</p>';
        }
    }

    displayCombinedResults(result) {
        // Display calendar results
        this.extractedEventsEl.textContent = result.calendar_events.length;
        this.workingDaysEl.textContent = result.total_working_days;
        this.confidenceScoreEl.textContent = `${Math.round(result.confidence_score * 100)}%`;
        
        // Store the combined data for calculations
        this.totalWorkingDays = result.total_working_days;
        this.classesPerWorkingDay = result.classes_per_working_day;
        this.totalClasses = result.total_classes;
        
        // Display timetable results
        this.timetableResults.style.display = 'block';
        if (result.timetable_events && result.timetable_events.length > 0) {
            let html = '<ul>';
            for (const event of result.timetable_events) {
                html += `<li><b>${event.day}</b> - ${event.subject} (${event.time})`;
                if (event.room) html += `, Room: ${event.room}`;
                if (event.instructor) html += `, Instructor: ${event.instructor}`;
                html += '</li>';
            }
            html += '</ul>';
            this.timetableExtracted.innerHTML = html;
        } else {
            this.timetableExtracted.innerHTML = '<p>No timetable events found.</p>';
        }
        
        // Display combined summary
        const summaryHtml = `
            <div class="combined-summary">
                <h3>📊 Combined Analysis Summary</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">Working Days:</span>
                        <span class="value">${result.total_working_days}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Classes per Day:</span>
                        <span class="value">${result.classes_per_working_day}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Total Classes:</span>
                        <span class="value">${result.total_classes}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Confidence:</span>
                        <span class="value">${Math.round(result.confidence_score * 100)}%</span>
                    </div>
                </div>
                <div class="calculation-breakdown">
                    <small>📝 Calculation: ${result.total_working_days} working days × ${result.classes_per_working_day} classes/day = ${result.total_classes} total classes</small>
                </div>
            </div>
        `;
        
        // Add summary to timetable results
        this.timetableExtracted.insertAdjacentHTML('beforebegin', summaryHtml);
        
        this.pdfResults.style.display = 'block';
        this.timetableResults.style.display = 'block';
        
        // Scroll to results
        this.pdfResults.scrollIntoView({ behavior: 'smooth' });
    }

    calculateAttendanceFromPDF() {
        const attendedClasses = parseInt(this.attendedClassesInput.value) || 0;
        const targetPercentage = parseInt(this.targetPercentageInput.value) || 75;

        // Check if we have combined data (more accurate)
        if (this.combinedData && this.totalClasses > 0) {
            this.calculateCombinedAttendance(attendedClasses, targetPercentage);
            return;
        }

        // Fallback to working days only
        const totalWorkingDays = this.totalWorkingDays || 0;

        if (totalWorkingDays === 0) {
            this.showToast('No working days found. Please upload a valid academic calendar.', 'error');
            return;
        }

        if (attendedClasses < 0) {
            this.showToast('Please enter a valid number of attended classes.', 'error');
            return;
        }

        if (targetPercentage < 0 || targetPercentage > 100) {
            this.showToast('Please enter a valid target percentage (0-100).', 'error');
            return;
        }

        // Calculate attendance statistics
        const currentPercentage = totalWorkingDays > 0 ? (attendedClasses / totalWorkingDays) * 100 : 0;
        const remainingClasses = Math.max(0, totalWorkingDays - attendedClasses);
        
        // Calculate classes needed to reach target
        let classesToAttend = 0;
        if (currentPercentage < targetPercentage) {
            const targetAttended = Math.ceil((targetPercentage / 100) * totalWorkingDays);
            classesToAttend = Math.max(0, targetAttended - attendedClasses);
        }

        // Update the display
        this.currentPercentageEl.textContent = `${Math.round(currentPercentage)}%`;
        this.classesToAttendEl.textContent = classesToAttend;
        this.remainingClassesEl.textContent = remainingClasses;

        // Update goal status
        if (currentPercentage >= targetPercentage) {
            this.goalStatusEl.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Great job! You've reached your target attendance goal of ${targetPercentage}%.
            `;
            this.goalStatusEl.className = 'goal-status on-track';
        } else {
            this.goalStatusEl.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> 
                You need to attend ${classesToAttend} more classes to reach your ${targetPercentage}% goal.
            `;
            this.goalStatusEl.className = 'goal-status behind';
        }

        // Show results
        this.attendanceResults.style.display = 'block';
        
        // Scroll to results
        this.attendanceResults.scrollIntoView({ behavior: 'smooth' });

        this.showToast('Attendance calculation completed!', 'success');
    }

    calculateCombinedAttendance(attendedClasses, targetPercentage) {
        if (this.totalClasses <= 0) {
            this.showToast('No classes found in the combined data.', 'error');
            return;
        }

        if (attendedClasses < 0) {
            this.showToast('Please enter a valid number of attended classes.', 'error');
            return;
        }

        if (targetPercentage < 0 || targetPercentage > 100) {
            this.showToast('Please enter a valid target percentage (0-100).', 'error');
            return;
        }

        // Calculate attendance statistics using actual classes
        const currentPercentage = (attendedClasses / this.totalClasses) * 100;
        const remainingClasses = Math.max(0, this.totalClasses - attendedClasses);
        
        // Calculate classes needed to reach target
        let classesToAttend = 0;
        if (currentPercentage < targetPercentage) {
            const targetAttended = Math.ceil((targetPercentage / 100) * this.totalClasses);
            classesToAttend = Math.max(0, targetAttended - attendedClasses);
        }

        // Update the display
        this.currentPercentageEl.textContent = `${Math.round(currentPercentage)}%`;
        this.classesToAttendEl.textContent = classesToAttend;
        this.remainingClassesEl.textContent = remainingClasses;

        // Update goal status with more detailed information
        if (currentPercentage >= targetPercentage) {
            this.goalStatusEl.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Great job! You've reached your target attendance goal of ${targetPercentage}%.
                <br><small>Based on ${this.totalClasses} total classes (${this.totalWorkingDays} working days × ${this.classesPerWorkingDay} classes/day)</small>
            `;
            this.goalStatusEl.className = 'goal-status on-track';
        } else {
            this.goalStatusEl.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> 
                You need to attend ${classesToAttend} more classes to reach your ${targetPercentage}% goal.
                <br><small>Based on ${this.totalClasses} total classes (${this.totalWorkingDays} working days × ${this.classesPerWorkingDay} classes/day)</small>
            `;
            this.goalStatusEl.className = 'goal-status behind';
        }

        // Show results
        this.attendanceResults.style.display = 'block';
        
        // Scroll to results
        this.attendanceResults.scrollIntoView({ behavior: 'smooth' });

        this.showToast('Attendance calculation completed using combined calendar and timetable data!', 'success');
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
        `).join('');
    }

    updateStats() {
        const totalClasses = this.events.length;
        const attendedClasses = this.attendance.filter(record => record.status === 'present').length;
        const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
        const remainingClasses = Math.max(0, totalClasses - attendedClasses);

        this.totalClassesEl.textContent = totalClasses;
        this.attendedClassesEl.textContent = attendedClasses;
        this.attendancePercentageEl.textContent = `${attendancePercentage}%`;
        this.remainingClassesEl.textContent = remainingClasses;
    }

    updateGoalProgress() {
        const totalClasses = this.events.length;
        const attendedClasses = this.attendance.filter(record => record.status === 'present').length;
        const currentPercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
        
        this.progressFill.style.width = `${Math.min(currentPercentage, 100)}%`;
        this.currentProgressEl.textContent = `${Math.round(currentPercentage)}%`;
        this.targetProgressEl.textContent = `${this.targetPercentage}%`;

        // Calculate classes needed to reach target
        const classesNeeded = this.calculateClassesNeeded(currentPercentage);
        
        // Update goal status
        if (currentPercentage >= this.targetPercentage) {
            this.goalStatusEl.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Great job! You've reached your target attendance goal of ${this.targetPercentage}%.
            `;
            this.goalStatusEl.className = 'goal-status on-track';
        } else {
            this.goalStatusEl.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> 
                You need to attend ${classesNeeded} more classes to reach your ${this.targetPercentage}% goal.
            `;
            this.goalStatusEl.className = 'goal-status behind';
        }
    }

    calculateClassesNeeded(currentPercentage) {
        const totalClasses = this.events.length;
        const attendedClasses = this.attendance.filter(record => record.status === 'present').length;
        
        if (currentPercentage >= this.targetPercentage) return 0;
        
        // Calculate how many more classes needed to reach target
        const targetAttended = Math.ceil((this.targetPercentage / 100) * totalClasses);
        return Math.max(0, targetAttended - attendedClasses);
    }

    updateSummary() {
        const totalClasses = this.events.length;
        const attendedClasses = this.attendance.filter(record => record.status === 'present').length;
        const currentPercentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
        
        // Classes to attend to reach target
        const classesToAttend = this.calculateClassesNeeded(currentPercentage);
        this.classesToAttendEl.textContent = classesToAttend;

        // Calculate streaks
        const { currentStreak, bestStreak } = this.calculateStreaks();
        this.currentStreakEl.textContent = currentStreak;
        this.bestStreakEl.textContent = bestStreak;
    }

    calculateStreaks() {
        if (this.attendance.length === 0) return { currentStreak: 0, bestStreak: 0 };

        const sortedAttendance = this.attendance
            .filter(record => record.status === 'present')
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedAttendance.length === 0) return { currentStreak: 0, bestStreak: 0 };

        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        let lastDate = null;

        // Calculate current streak (consecutive present days from most recent)
        const today = new Date();
        const mostRecentDate = new Date(sortedAttendance[0].date);
        const daysDiff = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
            // Check consecutive days from most recent
            for (let i = 0; i < sortedAttendance.length - 1; i++) {
                const currentDate = new Date(sortedAttendance[i].date);
                const nextDate = new Date(sortedAttendance[i + 1].date);
                const dayDiff = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));
                
                if (dayDiff === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
            currentStreak++; // Include the most recent day
        }

        // Calculate best streak
        for (let i = 0; i < sortedAttendance.length - 1; i++) {
            const currentDate = new Date(sortedAttendance[i].date);
            const nextDate = new Date(sortedAttendance[i + 1].date);
            const dayDiff = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
                tempStreak++;
            } else {
                bestStreak = Math.max(bestStreak, tempStreak + 1);
                tempStreak = 0;
            }
        }
        bestStreak = Math.max(bestStreak, tempStreak + 1);

        return { currentStreak, bestStreak };
    }

    clearEventForm() {
        this.eventNameInput.value = '';
        this.eventTimeInput.value = '';
        this.eventTypeSelect.value = 'lecture';
        this.setDefaultDates();
    }

    clearAttendanceForm() {
        this.attendanceNotesInput.value = '';
        this.attendanceStatusSelect.value = 'present';
        this.setDefaultDates();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showToast(message, type = 'info') {
        const toast = this.toast;
        const messageEl = toast.querySelector('.toast-message');
        
        messageEl.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Export data functionality
    exportData() {
        const data = {
            events: this.events,
            attendance: this.attendance,
            targetPercentage: this.targetPercentage,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully!', 'success');
    }

    // Import data functionality
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.events && data.attendance) {
                    this.events = data.events;
                    this.attendance = data.attendance;
                    if (data.targetPercentage) {
                        this.targetPercentage = data.targetPercentage;
                        this.targetPercentageInput.value = this.targetPercentage;
                    }
                    
                    this.saveData();
                    this.updateUI();
                    this.showToast('Data imported successfully!', 'success');
                } else {
                    this.showToast('Invalid data format', 'error');
                }
            } catch (error) {
                this.showToast('Error importing data', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the application
let attendanceTracker;

document.addEventListener('DOMContentLoaded', () => {
    attendanceTracker = new AttendanceTracker();
    
    // Add export/import functionality
    addExportImportButtons();
});

function addExportImportButtons() {
    const header = document.querySelector('.header');
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-info';
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Data';
    exportBtn.onclick = () => attendanceTracker.exportData();
    
    const importBtn = document.createElement('button');
    importBtn.className = 'btn btn-info';
    importBtn.innerHTML = '<i class="fas fa-upload"></i> Import Data';
    importBtn.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            if (e.target.files[0]) {
                attendanceTracker.importData(e.target.files[0]);
            }
        };
        input.click();
    };
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.appendChild(exportBtn);
    buttonContainer.appendChild(importBtn);
    
    header.appendChild(buttonContainer);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'e':
                e.preventDefault();
                attendanceTracker.exportData();
                break;
            case 'i':
                e.preventDefault();
                document.querySelector('input[type="file"]')?.click();
                break;
        }
    }
});

// Add service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
} 