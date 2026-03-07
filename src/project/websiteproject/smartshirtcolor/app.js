/**
 * Auspicious Shirt Color Picker
 * Vanilla JS app with:
 * - Light/Dark theme toggle with persistence & system preference
 * - Language toggle (TH/EN) with dynamic UI strings
 * - Custom date picker calendar (no native input)
 * - Aspect selector with localized labels
 * - Auspicious color logic with recommended/avoid colors
 * - Copy summary & reset functionality
 * - Responsive, accessible UI
 */

(() => {
    'use strict';
  
    // Constants and data
  
    // Language strings
    const STRINGS = {
      en: {
        appTitle: 'Smart Shirt Color Picker',
        dateSectionTitle: 'Select Date',
        useTodayLabel: 'Use Today (default)',
        aspectSectionTitle: 'Select Aspect',
        resultsTitle: 'Results',
        recommendedTitle: 'Recommended Colors',
        avoidTitle: 'Avoid',
        copyButton: 'Copy',
        resetButton: 'Reset',
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        months: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ],
        aspects: [
          'Career/Study',
          'Finance',
          'Love',
          'Exams/Study',
          'Luck',
          'Health',
          'Negotiation'
        ],
        dayLabels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      th: {
        appTitle: 'ตัวช่วยเลือกสีเสื้ออัจฉริยะ',
        dateSectionTitle: 'เลือกวันที่',
        useTodayLabel: 'ใช้วันนี้ (ค่าเริ่มต้น)',
        aspectSectionTitle: 'เลือกด้าน',
        resultsTitle: 'ผลลัพธ์',
        recommendedTitle: 'สีที่แนะนำ',
        avoidTitle: 'หลีกเลี่ยง',
        copyButton: 'คัดลอก',
        resetButton: 'รีเซ็ต',
        weekdays: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
        months: [
          'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
          'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ],
        aspects: [
          'การงาน/เรียน',
          'การเงิน',
          'ความรัก',
          'การเรียน/สอบ',
          'โชคลาภ',
          'สุขภาพ',
          'การเจรจา'
        ],
        dayLabels: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
      }
    };
  
    // Auspicious colors data: weekday (0-6) -> aspect -> { recommended: [...], avoid: [...] }
    const AUSPICIOUS_DATA = {
      0: { // Sunday
        0: { recommended: ['Gold', 'Yellow', 'Orange'], avoid: ['Black', 'Blue'] },
        1: { recommended: ['Green', 'White'], avoid: ['Red', 'Brown'] },
        2: { recommended: ['Pink', 'Red', 'Purple'], avoid: ['Black', 'Gray'] },
        3: { recommended: ['Yellow', 'Orange'], avoid: ['Blue', 'Green'] },
        4: { recommended: ['Gold', 'Silver'], avoid: ['Brown', 'Dark'] },
        5: { recommended: ['Green', 'Blue'], avoid: ['Red', 'Black'] },
        6: { recommended: ['Red', 'White'], avoid: ['Black', 'Gray'] }
      },
      1: { // Monday
        0: { recommended: ['Blue', 'Black'], avoid: ['Red', 'Yellow'] },
        1: { recommended: ['Green', 'Gold'], avoid: ['Orange', 'Brown'] },
        2: { recommended: ['Yellow', 'White'], avoid: ['Black', 'Blue'] },
        3: { recommended: ['Red', 'Gold'], avoid: ['Green', 'Blue'] },
        4: { recommended: ['White', 'Silver'], avoid: ['Black', 'Brown'] },
        5: { recommended: ['Green', 'White'], avoid: ['Red', 'Purple'] },
        6: { recommended: ['Blue', 'White'], avoid: ['Yellow', 'Red'] }
      },
      2: { // Tuesday
        0: { recommended: ['Red', 'Black'], avoid: ['Blue', 'Yellow'] },
        1: { recommended: ['Red', 'Orange'], avoid: ['Green', 'White'] },
        2: { recommended: ['Pink', 'White'], avoid: ['Brown', 'Gray'] },
        3: { recommended: ['Purple', 'Black'], avoid: ['Green', 'Yellow'] },
        4: { recommended: ['Red', 'Gold'], avoid: ['Blue', 'White'] },
        5: { recommended: ['Blue', 'Green'], avoid: ['Red', 'Black'] },
        6: { recommended: ['Purple', 'Red'], avoid: ['Yellow', 'White'] }
      },
      3: { // Wednesday
        0: { recommended: ['Green', 'Gold'], avoid: ['Red', 'Blue'] },
        1: { recommended: ['Yellow', 'Green'], avoid: ['Brown', 'Blue'] },
        2: { recommended: ['Blue', 'White'], avoid: ['Black', 'Red'] },
        3: { recommended: ['Yellow', 'White'], avoid: ['Purple', 'Black'] },
        4: { recommended: ['Green', 'Silver'], avoid: ['Red', 'Brown'] },
        5: { recommended: ['Yellow', 'Gold'], avoid: ['Blue', 'Gray'] },
        6: { recommended: ['Green', 'White'], avoid: ['Red', 'Black'] }
      },
      4: { // Thursday
        0: { recommended: ['Yellow', 'White'], avoid: ['Black', 'Green'] },
        1: { recommended: ['Gold', 'Green'], avoid: ['Blue', 'Red'] },
        2: { recommended: ['Pink', 'Yellow'], avoid: ['Gray', 'Brown'] },
        3: { recommended: ['Orange', 'Yellow'], avoid: ['Blue', 'Black'] },
        4: { recommended: ['Gold', 'White'], avoid: ['Red', 'Dark'] },
        5: { recommended: ['Red', 'Yellow'], avoid: ['Black', 'Blue'] },
        6: { recommended: ['White', 'Green'], avoid: ['Black', 'Red'] }
      },
      5: { // Friday
        0: { recommended: ['Blue', 'White'], avoid: ['Red', 'Black'] },
        1: { recommended: ['Red', 'White'], avoid: ['Green', 'Yellow'] },
        2: { recommended: ['Green', 'Red'], avoid: ['Black', 'Brown'] },
        3: { recommended: ['Red', 'White'], avoid: ['Blue', 'Green'] },
        4: { recommended: ['White', 'Pink'], avoid: ['Black', 'Gray'] },
        5: { recommended: ['Blue', 'Green'], avoid: ['Red', 'Yellow'] },
        6: { recommended: ['Blue', 'White'], avoid: ['Black', 'Red'] }
      },
      6: { // Saturday
        0: { recommended: ['Purple', 'Black'], avoid: ['Red', 'Yellow'] },
        1: { recommended: ['Purple', 'Gold'], avoid: ['Green', 'White'] },
        2: { recommended: ['White', 'Pink'], avoid: ['Black', 'Gray'] },
        3: { recommended: ['Black', 'White'], avoid: ['Red', 'Blue'] },
        4: { recommended: ['Purple', 'Silver'], avoid: ['Orange', 'Brown'] },
        5: { recommended: ['Purple', 'Green'], avoid: ['Yellow', 'Red'] },
        6: { recommended: ['Black', 'White'], avoid: ['Yellow', 'Green'] }
      }
    };
  
    // Color aliases: map alternate names to hex codes
    const COLOR_ALIASES = {
      // French/Common mappings
      'Gold': '#FFD700',
      'Silver': '#C0C0C0',
      'Yellow': '#FFFF00',
      'Orange': '#FFA500',
      'Red': '#FF0000',
      'Green': '#008000',
      'Blue': '#0000FF',
      'Purple': '#800080',
      'Pink': '#FFC0CB',
      'White': '#FFFFFF',
      'Black': '#000000',
      'Gray': '#808080',
      'Brown': '#A52A2A',
      'Dark': '#333333',
      // Thai mappings if needed
      'ครีม': '#FFFFFF', // Cream -> White
      'ฟ้าเข้ม': '#000080' // Dark blue -> Navy
    };
  
    // State variables
    let currentLang = localStorage.getItem('lang') || 'en';
    let currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    let selectedDate = new Date();
    let selectedAspect = 0;
    let currentViewDate = new Date();
  
    // DOM elements
    const html = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const langToggleBtn = document.getElementById('lang-toggle');
    const useTodayCb = document.getElementById('use-today');
    const datePickerBtn = document.getElementById('date-picker-button');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const calendarPopup = document.getElementById('calendar-popup');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarWeekdays = document.getElementById('calendar-weekdays');
    const calendarDays = document.getElementById('calendar-days');
    const aspectButtons = document.getElementById('aspect-buttons');
    const pillWeekday = document.getElementById('pill-weekday');
    const pillAspect = document.getElementById('pill-aspect');
    const recommendedColors = document.getElementById('recommended-colors');
    const avoidColors = document.getElementById('avoid-colors');
    const copyButton = document.getElementById('copy-summary');
    const resetButton = document.getElementById('reset-button');
  
    // Utility functions
  
    // Update UI strings based on current language
    function updateUI() {
      const s = STRINGS[currentLang];
      document.getElementById('app-title').textContent = s.appTitle;
      document.getElementById('date-section-title').textContent = s.dateSectionTitle;
      document.getElementById('use-today-label').textContent = s.useTodayLabel;
      document.getElementById('aspect-section-title').textContent = s.aspectSectionTitle;
      document.getElementById('results-title').textContent = s.resultsTitle;
      document.getElementById('recommended-title').textContent = s.recommendedTitle;
      document.getElementById('avoid-title').textContent = s.avoidTitle;
      document.getElementById('copy-summary').textContent = s.copyButton;
      document.getElementById('reset-button').textContent = s.resetButton;
  
      langToggleBtn.textContent = currentLang === 'en' ? 'TH' : 'EN';
      updateDayPickerButton();
      renderAspectButtons();
      updateResults();
    }
  
    // Set theme
    function setTheme() {
      html.setAttribute('data-theme', currentTheme);
      themeToggleBtn.textContent = currentTheme === 'light' ? '🌙' : '🌤️';
      localStorage.setItem('theme', currentTheme);
    }
  
    // Toggle theme
    function toggleTheme() {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme();
    }
  
    // Toggle language
    function toggleLang() {
      currentLang = currentLang === 'en' ? 'th' : 'en';
      localStorage.setItem('lang', currentLang);
      updateUI();
      renderCalendar(); // Update calendar headers
    }
  
    // Update selected date display
    function updateDayPickerButton() {
      const s = STRINGS[currentLang];
      if (useTodayCb.checked) {
        selectedDate = new Date();
        // Close calendar if open when using today's date
        closeCalendar();
        datePickerBtn.setAttribute('aria-expanded', 'false');
      }
      const day = s.dayLabels[selectedDate.getDay()];
      const month = s.months[selectedDate.getMonth()];
      const dateNum = selectedDate.getDate();
      const year = currentLang === 'th' ? selectedDate.getFullYear() + 543 : selectedDate.getFullYear();
      selectedDateDisplay.textContent = currentLang === 'th'
        ? `${day} ${month} ${dateNum} พ.ศ. ${year}`
        : `${day}, ${month} ${dateNum}, ${year}`;
      datePickerBtn.disabled = useTodayCb.checked;
      updateResults();
    }
  
    // Toggle calendar visibility
    function toggleCalendar() {
      const isOpen = !calendarPopup.hasAttribute('hidden');
      if (isOpen) {
        closeCalendar();
      } else {
        openCalendar();
      }
      datePickerBtn.setAttribute('aria-expanded', !isOpen);
    }
  
    function openCalendar() {
      calendarPopup.style.display = '';
      calendarPopup.removeAttribute('hidden');
      currentViewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      renderCalendar();
    }
  
    function closeCalendar() {
      calendarPopup.setAttribute('hidden', '');
      calendarPopup.style.display = 'none';
    }
  
    // Render calendar
    function renderCalendar() {
      const s = STRINGS[currentLang];
      const now = new Date();
      const todayStr = now.toDateString();
      const selectedStr = selectedDate.toDateString();
      const year = currentViewDate.getFullYear();
      const month = currentViewDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const lastDayPrev = new Date(year, month, 0).getDate();
  
      // Month/year display
      calendarMonthYear.textContent = `${s.months[month]} ${currentLang === 'th' ? year + 543 : year}`;
  
      // Weekdays header
      calendarWeekdays.innerHTML = '';
      for (let i = 0; i < 7; i++) {
        const th = document.createElement('th');
        th.textContent = s.weekdays[i];
        th.setAttribute('abbr', s.dayLabels[i]);
        calendarWeekdays.appendChild(th);
      }
  
      // Days (build proper table rows)
      calendarDays.innerHTML = '';
      let dayCounter = 1;
      for (let row = 0; row < 6; row++) {
        const tr = document.createElement('tr');
        tr.setAttribute('role', 'row');
        for (let col = 0; col < 7; col++) {
          const td = document.createElement('td');
          const cellIndex = row * 7 + col;
          if (cellIndex < firstDay) {
            // Previous month
            const prevDay = lastDayPrev - (firstDay - col - 1);
            td.textContent = prevDay;
            td.classList.add('muted');
          } else if (dayCounter <= daysInMonth) {
            // Current month
            td.textContent = dayCounter;
            const dateObj = new Date(year, month, dayCounter);
            const dateStr = dateObj.toDateString();
            if (dateStr === todayStr) td.classList.add('today');
            if (dateStr === selectedStr) td.classList.add('selected');
            td.tabIndex = 0;
            td.addEventListener('click', () => selectDate(dateObj));
            td.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { selectDate(dateObj); e.preventDefault(); } });
            dayCounter++;
          } else {
            // Next month
            const nextDay = dayCounter - daysInMonth;
            td.textContent = nextDay;
            td.classList.add('muted');
            dayCounter++;
          }
          tr.appendChild(td);
        }
        calendarDays.appendChild(tr);
      }
    }
  
    // Select date from calendar
    function selectDate(date) {
      selectedDate = date;
      selectedAspect = 0; // Reset to default aspect?
      updateDayPickerButton();
      renderAspectButtons();
      closeCalendar();
    }
  
    // Navigate months
    function navMonth(delta) {
      currentViewDate.setMonth(currentViewDate.getMonth() + delta);
      renderCalendar();
    }
  
    // Render aspect buttons
    function renderAspectButtons() {
      const s = STRINGS[currentLang];
      aspectButtons.innerHTML = '';
      s.aspects.forEach((aspect, idx) => {
        const btn = document.createElement('button');
        btn.textContent = aspect;
        btn.setAttribute('role', 'listitem');
        btn.setAttribute('aria-pressed', idx === selectedAspect);
        if (idx === selectedAspect) btn.classList.add('selected');
        btn.addEventListener('click', () => {
          selectedAspect = idx;
          renderAspectButtons();
          updateResults();
        });
        aspectButtons.appendChild(btn);
      });
    }
  
    // Update results
    function updateResults() {
      const s = STRINGS[currentLang];
      const data = AUSPICIOUS_DATA[selectedDate.getDay()][selectedAspect];
      pillWeekday.textContent = s.dayLabels[selectedDate.getDay()];
      pillAspect.textContent = s.aspects[selectedAspect];
  
      renderColors(recommendedColors, data.recommended);
      renderColors(avoidColors, data.avoid);
    }
  
    // Render color swatches
    function renderColors(container, colors) {
      container.innerHTML = '';
      colors.forEach(color => {
        const div = document.createElement('div');
        div.className = 'color-swatch';
        div.innerHTML = `
          <div class="color-box" style="background-color: ${COLOR_ALIASES[color] || '#ccc'}"></div>
          <span class="color-name">${color}</span>
        `;
        div.setAttribute('role', 'listitem');
        container.appendChild(div);
      });
    }
  
    // Copy summary
    function copySummary() {
      const s = STRINGS[currentLang];
      const data = AUSPICIOUS_DATA[selectedDate.getDay()][selectedAspect];
      const summary = `
  Weekday: ${s.dayLabels[selectedDate.getDay()]}\n
  Aspect: ${s.aspects[selectedAspect]}\n
  Recommended: ${data.recommended.join(', ')}\n
  Avoid: ${data.avoid.join(', ')}
      `.trim();
      navigator.clipboard.writeText(summary).then(() => {
        // Visual feedback could be added here
        console.log('Summary copied');
      });
    }
  
    // Reset to defaults
    function resetToDefaults() {
      useTodayCb.checked = true;
      selectedAspect = 0;
      selectedDate = new Date();
      updateDayPickerButton();
      renderAspectButtons();
      updateResults();
      currentLang = 'en';
      localStorage.setItem('lang', 'en');
      updateUI();
    }
  
    // Event listeners
    document.addEventListener('DOMContentLoaded', () => {
      setTheme();
      updateUI();
  
      themeToggleBtn.addEventListener('click', toggleTheme);
      langToggleBtn.addEventListener('click', toggleLang);
      useTodayCb.addEventListener('change', () => {
        updateDayPickerButton();
      });
      datePickerBtn.addEventListener('click', toggleCalendar);
      prevMonthBtn.addEventListener('click', () => navMonth(-1));
      nextMonthBtn.addEventListener('click', () => navMonth(1));
      copyButton.addEventListener('click', copySummary);
      resetButton.addEventListener('click', resetToDefaults);
  
      // Close calendar on outside click
      document.addEventListener('click', (e) => {
        if (!datePickerBtn.contains(e.target) && !calendarPopup.contains(e.target)) {
          closeCalendar();
        }
      });
    });
  })();