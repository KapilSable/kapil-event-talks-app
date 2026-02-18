document.addEventListener('DOMContentLoaded', () => {
    const scheduleDiv = document.getElementById('schedule');
    const categorySearchInput = document.getElementById('categorySearch');
    const clearSearchButton = document.getElementById('clearSearch');
    let allTalks = [];

    // Function to format time
    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Function to calculate schedule and render talks
    const renderSchedule = (talksToRender) => {
        scheduleDiv.innerHTML = ''; // Clear existing schedule

        let currentTime = new Date();
        currentTime.setHours(10, 0, 0, 0); // Event starts at 10:00 AM

        const addTransition = (time) => {
            time.setMinutes(time.getMinutes() + 10);
            return time;
        };

        talksToRender.forEach((talk, index) => {
            const talkStartTime = new Date(currentTime);
            const talkEndTime = new Date(talkStartTime);
            talkEndTime.setMinutes(talkEndTime.getMinutes() + talk.duration);

            const timeSlotDiv = document.createElement('div');
            timeSlotDiv.classList.add('time-slot');

            const timeDiv = document.createElement('div');
            timeDiv.classList.add('time');
            timeDiv.textContent = `${formatTime(talkStartTime)} - ${formatTime(talkEndTime)}`;
            timeSlotDiv.appendChild(timeDiv);

            const talkDetailsDiv = document.createElement('div');
            talkDetailsDiv.classList.add('talk-details');

            const titleElement = document.createElement('h3');
            titleElement.classList.add('talk-title');
            titleElement.textContent = talk.title;
            talkDetailsDiv.appendChild(titleElement);

            const speakersElement = document.createElement('p');
            speakersElement.classList.add('talk-speakers');
            speakersElement.textContent = `Speakers: ${talk.speakers.join(', ')}`;
            talkDetailsDiv.appendChild(speakersElement);

            const categoryElement = document.createElement('p');
            categoryElement.classList.add('talk-category');
            talk.category.forEach(cat => {
                const span = document.createElement('span');
                span.textContent = cat;
                categoryElement.appendChild(span);
            });
            talkDetailsDiv.appendChild(categoryElement);

            const descriptionElement = document.createElement('p');
            descriptionElement.classList.add('talk-description');
            descriptionElement.textContent = talk.description;
            talkDetailsDiv.appendChild(descriptionElement);

            timeSlotDiv.appendChild(talkDetailsDiv);
            scheduleDiv.appendChild(timeSlotDiv);

            currentTime = talkEndTime;

            // Add transition after each talk, except the last one
            if (index < talksToRender.length - 1) {
                currentTime = addTransition(currentTime);
            }

            // Add lunch break after the third talk
            if (index === 2) {
                const lunchStartTime = new Date(currentTime);
                const lunchEndTime = new Date(lunchStartTime);
                lunchEndTime.setHours(lunchEndTime.getHours() + 1); // 1-hour lunch

                const lunchDiv = document.createElement('div');
                lunchDiv.classList.add('lunch-break');
                lunchDiv.textContent = `Lunch Break: ${formatTime(lunchStartTime)} - ${formatTime(lunchEndTime)}`;
                scheduleDiv.appendChild(lunchDiv);

                currentTime = lunchEndTime;
                currentTime = addTransition(currentTime); // Transition after lunch
            }
        });

        if (talksToRender.length === 0) {
            scheduleDiv.innerHTML = '<p class="no-talks">No talks found matching your criteria.</p>';
        }
    };

    // Fetch talks data
    fetch('/api/talks')
        .then(response => response.json())
        .then(data => {
            allTalks = data;
            renderSchedule(allTalks);
        })
        .catch(error => {
            console.error('Error fetching talks:', error);
            scheduleDiv.innerHTML = '<p class="no-talks">Failed to load talks schedule.</p>';
        });

    // Search functionality
    categorySearchInput.addEventListener('input', () => {
        const searchTerm = categorySearchInput.value.toLowerCase().trim();
        const filteredTalks = allTalks.filter(talk =>
            talk.category.some(cat => cat.toLowerCase().includes(searchTerm))
        );
        renderSchedule(filteredTalks);
    });

    // Clear search functionality
    clearSearchButton.addEventListener('click', () => {
        categorySearchInput.value = '';
        renderSchedule(allTalks);
    });
});
