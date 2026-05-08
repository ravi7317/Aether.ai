// Intersection Observer for Scroll Animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .testimonial-card, .section-header').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

// Interactive Terminal Typing Effect
const aiMessage = document.querySelector('.ai .message-content');
const originalText = aiMessage.textContent.trim();
aiMessage.innerHTML = ''; // Clear for typing effect

let i = 0;
function typeWriter() {
    if (i < originalText.length) {
        aiMessage.innerHTML += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 20);
    } else {
        // Show typing indicator after text if needed or just finish
        document.querySelector('.typing-indicator').style.display = 'none';
    }
}

// Start typing effect when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        setTimeout(typeWriter, 1000);
        heroObserver.unobserve(entries[0].target);
    }
});

heroObserver.observe(document.querySelector('.hero'));

// Mobile Menu Placeholder (Basic Toggle)
const menuToggle = document.querySelector('.mobile-menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        alert('Mobile menu clicked! (Implementation would go here)');
    });
}

// Add reveal styles dynamically
const style = document.createElement('style');
style.textContent = `
    .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease-out;
    }
    .reveal.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
