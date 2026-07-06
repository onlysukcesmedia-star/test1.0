document.addEventListener('DOMContentLoaded', () => {
    // 1. Akordeon FAQ
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            
            // Prosty toggle klasy active na klikniętym nagłówku
            header.classList.toggle('active');
            
            // Obsługa max-height do płynnego wysuwania/wsuwania zawartości
            if (header.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });
    // 2. Płynne przewijanie do sekcji kontaktowej
    const ctaButtons = document.querySelectorAll('.cta-btn');
    
    ctaButtons.forEach(btn => {
        // Pomijamy przyciski submit w formularzu i link do kalendarza
        if (!btn.classList.contains('submit-btn') && !btn.classList.contains('calendar-btn')) {
            btn.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                // Upewnijmy się, że to na pewno kotwica (np. #kontakt)
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    });
    // 3. Obsługa formularza i webhooka
    const contactForm = document.getElementById('contactForm');
    const thankYouPopup = document.getElementById('thankYouPopup');
    const closeThankYouPopup = document.getElementById('closeThankYouPopup');
    const privacyCheckbox = document.getElementById('privacy');
    const submitBtn = document.querySelector('.submit-btn');
    const meetingDateInput = document.getElementById('meetingDate');
    const meetingDateField = document.getElementById('meetingDateField');

    if (meetingDateInput && meetingDateField) {
        const syncMeetingDateState = () => {
            meetingDateField.classList.toggle('has-value', meetingDateInput.value.trim() !== '');
        };

        meetingDateInput.addEventListener('input', syncMeetingDateState);
        meetingDateInput.addEventListener('change', syncMeetingDateState);
        syncMeetingDateState();
    }

    if (contactForm) {
        const updateSubmitState = () => {
            const formIsValid = contactForm.checkValidity() && privacyCheckbox.checked;
            submitBtn.disabled = !formIsValid;
            submitBtn.classList.toggle('is-ready', formIsValid);
        };

        contactForm.addEventListener('input', updateSubmitState);
        privacyCheckbox.addEventListener('change', updateSubmitState);
        updateSubmitState();

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Walidacja checkboxa polityki prywatności
            if (!privacyCheckbox.checked) {
                alert('Musisz zaakceptować politykę prywatności, aby wysłać formularz.');
                return; // Przerwij wysyłanie
            }
            // Pobieranie i walidacja danych formularza
            const formData = new FormData(contactForm);
            const fullName = formData.get('fullName');
            const phone = formData.get('phone');
            const email = formData.get('email');
            const businessProfile = formData.get('businessProfile');
            const meetingDate = formData.get('meetingDate');

            if (!fullName || !phone || !email || !businessProfile || !meetingDate) {
                alert('Proszę wypełnić wszystkie wymagane pola.');
                return;
            }
            // Stan ładowania przycisku
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Wysyłanie...';
            submitBtn.disabled = true;
            // Formatowanie daty na DD.MM.YYYY
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            const formattedDate = `${dd}.${mm}.${yyyy}`;
            const meetingDateFormatted = new Date(meetingDate).toLocaleString('pl-PL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Tworzenie payloadu do webhooka
            const payload = {
                date: formattedDate,
                fullName: fullName,
                phone: phone,
                email: email,
                businessProfile: businessProfile,
                meetingDate: meetingDate,
                meetingDateFormatted: meetingDateFormatted,
                calendarLink: 'https://calendar.app.google/8RJXWuWB91fFhBFFA'
            };
            const webhookUrl = 'https://hook.eu1.make.com/30ltvf5s8o2pjzoslygqew7bi38seo2y';
            try {
                // Wysłanie danych do Make.com metodą POST
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                // Sprawdzenie czy odpowiedź to sukces (z reguły status 200-299)
                if (response.ok) {
                    // Otwieramy popup z podziękowaniem
                    if (thankYouPopup) {
                        thankYouPopup.classList.remove('hidden');
                        thankYouPopup.setAttribute('aria-hidden', 'false');
                        document.body.classList.add('no-scroll');
                    }
                } else {
                    throw new Error('Błąd serwera. Status: ' + response.status);
                }
            } catch (error) {
                console.error('Wystąpił błąd podczas wysyłania do webhooka:', error);
                alert('Przepraszamy, wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie lub skontaktuj się z nami bezpośrednio.');
                
                // Przywrócenie przycisku po błędzie
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.classList.add('is-ready');
            }
        });
    }

    // Zamykanie popupu podziękowania
    if (thankYouPopup && closeThankYouPopup) {
        const closePopup = () => {
            thankYouPopup.classList.add('hidden');
            thankYouPopup.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll');
        };

        closeThankYouPopup.addEventListener('click', closePopup);

        thankYouPopup.addEventListener('click', (event) => {
            if (event.target === thankYouPopup) {
                closePopup();
            }
        });
    }
    // 4. Pętla karuzeli (Marquee) - JavaScript Animation
    const marqueeContent = document.getElementById('marqueeContent');
    if (marqueeContent) {
        const socialProofImages = [
            'assets/img/opinia1.jpg',
            'assets/img/opinia2.jpg',
            'assets/img/opinia3.jpg',
            'assets/img/opinia4.jpg',
            'assets/img/opinia5.jpg',
            'assets/img/opinia6.jpg',
            'assets/img/opinia7.jpg',
            'assets/img/opinia8.jpg',
            'assets/img/opinia9.jpg',
            'assets/img/opinia10.jpg',
            'assets/img/opinia11.jpg',
            'assets/img/opinia12.jpg',
            'assets/img/opinia13.jpg'
        ];

        const buildMarqueeImages = () => {
            const fragment = document.createDocumentFragment();

            socialProofImages.forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Opinia ${index + 1}`;
                img.loading = 'lazy';
                fragment.appendChild(img);
            });

            socialProofImages.forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Opinia ${index + 1}`;
                img.loading = 'lazy';
                fragment.appendChild(img);
            });

            marqueeContent.appendChild(fragment);
        };

        buildMarqueeImages();

        let offset = 0;
        let isAnimating = true;
        const speed = 1.2;

        function animateMarquee() {
            if (isAnimating) {
                offset -= speed;
                marqueeContent.style.transform = `translateX(${offset}px)`;

                const contentWidth = marqueeContent.scrollWidth / 2;
                if (Math.abs(offset) >= contentWidth) {
                    offset = 0;
                }
            }
            requestAnimationFrame(animateMarquee);
        }

        animateMarquee();

        marqueeContent.addEventListener('mouseenter', () => {
            isAnimating = false;
        });
        marqueeContent.addEventListener('mouseleave', () => {
            isAnimating = true;
        });
    }

    // 5. Manualna karuzela poleceń
    const manualCarousel = document.getElementById('manualCarousel');
    const manualCarouselLeft = document.getElementById('manualCarouselLeft');
    const manualCarouselRight = document.getElementById('manualCarouselRight');

    if (manualCarousel && manualCarouselLeft && manualCarouselRight) {
        const getStep = () => Math.max(260, Math.floor(manualCarousel.clientWidth * 0.8));
        let isDragging = false;
        let startX = 0;
        let startScrollLeft = 0;

        manualCarouselLeft.addEventListener('click', () => {
            manualCarousel.scrollBy({ left: -getStep(), behavior: 'smooth' });
        });

        manualCarouselRight.addEventListener('click', () => {
            manualCarousel.scrollBy({ left: getStep(), behavior: 'smooth' });
        });

        const pointerDown = (event) => {
            isDragging = true;
            startX = event.clientX;
            startScrollLeft = manualCarousel.scrollLeft;
            manualCarousel.classList.add('dragging');
            if (event.pointerId) {
                manualCarousel.setPointerCapture(event.pointerId);
            }
        };

        const pointerMove = (event) => {
            if (!isDragging) return;
            const deltaX = event.clientX - startX;
            manualCarousel.scrollLeft = startScrollLeft - deltaX;
        };

        const pointerUp = (event) => {
            if (!isDragging) return;
            isDragging = false;
            manualCarousel.classList.remove('dragging');
            if (event.pointerId) {
                manualCarousel.releasePointerCapture(event.pointerId);
            }
        };

        manualCarousel.addEventListener('pointerdown', pointerDown);
        manualCarousel.addEventListener('pointermove', pointerMove);
        manualCarousel.addEventListener('pointerup', pointerUp);
        manualCarousel.addEventListener('pointercancel', pointerUp);
        manualCarousel.addEventListener('pointerleave', pointerUp);
    }
});