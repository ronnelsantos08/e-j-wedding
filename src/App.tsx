import React, { useState, useEffect, useRef } from 'react';
import type { Ref } from 'react';

/**
 * A custom React Hook to create a fade-in-on-scroll effect using IntersectionObserver.
 * It's now explicitly typed to work with HTMLElement refs, preventing a type mismatch error.
 * @param {object} options - Options for the IntersectionObserver.
 * @returns {Array} - An array containing a ref to attach to the element and a boolean for visibility.
 */
const useIntersectionObserver = <T extends HTMLElement>(options: IntersectionObserverInit): [Ref<T>, boolean] => {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    // Correctly destructuring the entry from the observer's callback argument
    const observer = new IntersectionObserver(([entry]) => {
      // Update our state when the observer detects a change in visibility
      if (entry.isIntersecting) {
        setIsInView(true);
        // We can stop observing once the element has faded in
        observer.unobserve(entry.target);
      }
    }, options);

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      // Correcting the cleanup function to use a stable variable
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [options]);

  // The hook now returns the ref directly, compatible with a Ref<T>
  return [elementRef as Ref<T>, isInView];
};

/**
 * The main App component for the wedding website.
 * This component will manage the main content of the site.
 */
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  // The render logic now checks if the page is 'entourage' or a single-page section.
  const renderPage = () => {
    if (currentPage === 'entourage') {
      return <EntouragePage />;
    }
    return <HomePage />;
  };

  return (
    <div className="website-container">
      <Navbar setCurrentPage={setCurrentPage} currentPage={currentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

/**
 * The Navbar component for the wedding website.
 * It provides navigation links and a responsive menu.
 */
const Navbar: React.FC<{ setCurrentPage: (page: string) => void, currentPage: string }> = ({ setCurrentPage, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to handle smooth scrolling for anchor links
  const handleScrollToSection = (id: string) => {
    // If we're on a different page, switch back to home page view and then scroll
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const targetSection = document.getElementById(id);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small delay to allow page switch
    } else {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsOpen(false); // Close the mobile menu after clicking
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Mobile Menu Button */}
        <div className="mobile-menu-button-container">
          <button
            onClick={toggleMenu}
            type="button"
            className="mobile-menu-button"
            aria-controls="mobile-menu"
            aria-expanded={isOpen ? 'true' : 'false'}
          >
            <span className="sr-only">Open main menu</span>
            <svg className={`icon-hamburger ${isOpen ? 'hidden' : 'block'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className={`icon-close ${isOpen ? 'block' : 'hidden'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Brand Name - Top Row on Desktop */}
        <div className="navbar-top">
          <div className="navbar-brand">
            <a href="#home" onClick={() => handleScrollToSection('home')} className="brand-link">
              Emerson & Justine
            </a>
          </div>
        </div>

        {/* Navigation Links and Decorations - Bottom Row on Desktop */}
        <div className="navbar-bottom">
          {/* Left decoration image */}
          <div className="nav-decoration-left">
            <img src="https://placehold.co/150x150/f0e8f0/8c78a0?text=FLOWER" alt="Decorative flower" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="nav-links-desktop">
            <a href="#home" onClick={() => handleScrollToSection('home')} className="nav-link">Home</a>
            <a href="#prenup-gallery" onClick={() => handleScrollToSection('prenup-gallery')} className="nav-link">Prenup</a>
            <a href="#location" onClick={() => handleScrollToSection('location')} className="nav-link">Location</a>
            <a href="#" onClick={() => setCurrentPage('entourage')} className="nav-link">Entourage</a>
            <a href="#dresscode" onClick={() => handleScrollToSection('dresscode')} className="nav-link">Dresscode</a>
            <a href="#rsvp" onClick={() => handleScrollToSection('rsvp')} className="nav-link rsvp-button">RSVP</a>
          </div>

          {/* Right decoration image */}
          <div className="nav-decoration-right">
            <img src="https://placehold.co/150x150/f0e8f0/8c78a0?text=FLOWER" alt="Decorative flower" />
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu ${isOpen ? 'show' : 'hidden'}`} id="mobile-menu">
        <a href="#home" onClick={() => handleScrollToSection('home')} className="mobile-menu-link">Home</a>
        <a href="#prenup-gallery" onClick={() => handleScrollToSection('prenup-gallery')} className="mobile-menu-link">Prenup</a>
        <a href="#location" onClick={() => handleScrollToSection('location')} className="mobile-menu-link">Location</a>
        <a href="#" onClick={() => setCurrentPage('entourage')} className="mobile-menu-link">Entourage</a>
        <a href="#dresscode" onClick={() => handleScrollToSection('dresscode')} className="mobile-menu-link">Dresscode</a>
        <a href="#rsvp" onClick={() => handleScrollToSection('rsvp')} className="mobile-menu-link rsvp-button-mobile">RSVP</a>
      </div>
    </nav>
  );
};

/**
 * The single-page content component. It combines all sections into one page.
 */
const HomePage: React.FC = () => {
  const [ref1, isInView1] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const [ref3, isInView3] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section" id="home">
        {/* The hero section now only contains a background image */}
      </section>

      {/* Invitation Section */}
      <section className="invite-section" ref={ref1}>
        <div className={`invite-container ${isInView1 ? 'fade-in' : ''}`}>
          <div className="invite-message">
            <p className="invite-text-date">January 31, 2026</p>
            <h2 className="invite-title">The time has come!</h2>
            <p className="invite-text-body">
              With joyful hearts and great excitement, we invite you to join us as we begin our new life together.
              Your presence is the most cherished gift we could ask for, and we can't wait to share this special day with you.
            </p>
          </div>

          {/* Neon-light Gallery moved inside the invite section */}
          <div className="photo-gallery">
            <div className="photo-card">
              <img src="https://placehold.co/400x400/6b4d85/FFFFFF?text=Photo+A" alt="Couple's engagement photo" className="photo-image" />
              <div className="photo-caption">
                <h3>Emerson & Justine</h3>
                <p>January 31, 2026</p>
              </div>
            </div>
            <div className="photo-card">
              <img src="https://placehold.co/400x400/8c78a0/FFFFFF?text=Photo+B" alt="Couple laughing" className="photo-image" />
              <div className="photo-caption">
                <h3>Our Journey</h3>
                <p>Shared moments</p>
              </div>
            </div>
            <div className="photo-card">
              <img src="https://placehold.co/400x400/9f7fc9/FFFFFF?text=Photo+C" alt="Couple holding hands" className="photo-image" />
              <div className="photo-caption">
                <h3>Our Vows</h3>
                <p>Promise forever</p>
              </div>
            </div>
            <div className="photo-card">
              <img src="https://placehold.co/400x400/6b4d85/FFFFFF?text=Photo+D" alt="Couple in a field" className="photo-image" />
              <div className="photo-caption">
                <h3>Our Adventure</h3>
                <p>A new beginning</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Countdown Section */}
      <CountdownSection />

      {/* About Us Section */}
      <section className="about-us-section" ref={ref3}>
        <div className={`about-us-content ${isInView3 ? 'fade-in' : ''}`}>
          <div className="about-us-text-container">
            <h2 className="about-us-title">Our Story</h2>
            <p className="about-us-text-body">
              Our journey began years ago with a simple hello. From that moment, a bond was formed that grew stronger with every shared laugh, every late-night conversation, and every challenge we faced together. We've built a life filled with love, adventure, and unwavering support. Now, we are ready to take the next step and promise forever to each other.
            </p>
          </div>
          <div className="about-us-image-container">
            <img className="about-us-image" src="https://placehold.co/400x600/6b4d85/FFFFFF?text=YOUR+IMAGE+HERE" alt="Couple's photo" />
            {/* The floating heart decoration */}
            <div className="heart-decoration-container">
              <svg className="heart-decoration" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9f7fc9" stroke="#fff" strokeWidth="1.5">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Prenup Gallery Section */}
      <PrenupGallery />

      {/* Location Section */}
      <LocationPage />

      {/* Dresscode Section */}
      <DresscodePage />

      {/* RSVP Section */}
      <RsvpPage />
    </>
  );
};


/**
 * The countdown section component.
 * It calculates and displays the time remaining until the wedding date.
 */
const CountdownSection: React.FC = () => {
  const weddingDate = new Date('January 31, 2026 00:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  const [ref, isInView] = useIntersectionObserver<HTMLElement>({ threshold: 0.5 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  return (
    <section className="countdown-section" ref={ref}>
      <div className={`countdown-overlay ${isInView ? 'fade-in' : ''}`}>
        <p className="countdown-message">Join us as we say 'I do' on our special day.</p>
        <h2 className="countdown-title">The big day is coming!</h2>
        <div className="countdown-timer">
          <div className="timer-unit">
            <span className="timer-value">{timeLeft.days}</span>
            <span className="timer-label">Days</span>
          </div>
          <div className="timer-unit">
            <span className="timer-value">{timeLeft.hours}</span>
            <span className="timer-label">Hours</span>
          </div>
          <div className="timer-unit">
            <span className="timer-value">{timeLeft.minutes}</span>
            <span className="timer-label">Mins</span>
          </div>
          <div className="timer-unit">
            <span className="timer-value">{timeLeft.seconds}</span>
            <span className="timer-label">Secs</span>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * The Prenup Gallery page component.
 * It displays a grid of photos and a modal for enlarging images.
 */
const PrenupGallery: React.FC = () => {
  // State to manage the selected image for the modal, now correctly typed
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ref, isInView] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  const galleryImages = [
    'https://placehold.co/800x600/6b4d85/FFFFFF?text=Photo+1',
    'https://placehold.co/600x800/8c78a0/FFFFFF?text=Photo+2',
    'https://placehold.co/900x700/9f7fc9/FFFFFF?text=Photo+3',
    'https://placehold.co/700x900/6b4d85/FFFFFF?text=Photo+4',
    'https://placehold.co/800x800/8c78a0/FFFFFF?text=Photo+5',
    'https://placehold.co/900x600/9f7fc9/FFFFFF?text=Photo+6',
    'https://placehold.co/600x900/6b4d85/FFFFFF?text=Photo+7',
    'https://placehold.co/700x700/8c78a0/FFFFFF?text=Photo+8',
    'https://placehold.co/900x500/9f7fc9/FFFFFF?text=Photo+9',
  ];

  // Function to open the modal with a specific image
  const openModal = (image: string) => {
    setSelectedImage(image);
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <section className={`prenup-gallery-section ${isInView ? 'fade-in-section' : ''}`} ref={ref} id="prenup-gallery">
      <h2 className="page-title">Our Prenup Gallery</h2>
      <p className="page-subtitle">A collection of our favorite moments leading up to the big day.</p>
      <div className="prenup-gallery">
        {galleryImages.map((image, index) => (
          <div key={index} className="gallery-item" onClick={() => openModal(image)}>
            <img src={image} alt={`Prenup Photo ${index + 1}`} className="gallery-image" />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>&times;</button>
            <img src={selectedImage} alt="Enlarged Prenup Photo" className="modal-image" />
          </div>
        </div>
      )}
    </section>
  );
};


const LocationPage: React.FC = () => (
  <section className="page-section" id="location">
    <h2 className="page-title">Location & Details</h2>
    <p>Here you can find information about the ceremony and reception venue.</p>
  </section>
);

const EntouragePage: React.FC = () => (
  <section className="page-section">
    <h2 className="page-title">Entourage</h2>
    <p>This page will introduce the wedding party.</p>
  </section>
);

const DresscodePage: React.FC = () => (
  <section className="page-section" id="dresscode">
    <h2 className="page-title">Dress Code</h2>
    <p>Here you can inform guests about the suggested attire.</p>
  </section>
);

const RsvpPage: React.FC = () => (
  <section className="page-section" id="rsvp">
    <h2 className="page-title">RSVP</h2>
    <p>This will be the RSVP form for guests.</p>
  </section>
);

const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=Playfair+Display:wght@400;700&display=swap');

  /* Use a fluid size variable for scalable typography and spacing */
  :root {
    --fluid-size: clamp(0.5rem, 2vw, 2.5rem);
  }

  .website-container {
    min-height: 100vh;
    background-color: #f2f0f5; /* Light purple background */
    font-family: 'Cormorant Garamond', serif;
    color: #333;
  }

  .main-content {
    max-width: 3840px;
  }

  .navbar {
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .navbar-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--fluid-size);
    display: flex;
    flex-direction: column; /* Stack elements vertically */
    justify-content: center;
    align-items: center;
  }

  /* New containers for the two-row layout */
  .navbar-top,
  .navbar-bottom {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .navbar-top {
    margin-bottom: clamp(1rem, 2vw, 2rem); /* Space between the name and menu */
  }

  .navbar-bottom {
    justify-content: space-between; /* Push decorations to the ends */
  }

  .navbar-brand {
    flex-grow: 1;
    text-align: center;
  }

  .brand-link {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 6vw, 4rem); /* Fluid font size for brand name */
    font-weight: 700;
    color: #6b4d85; /* Dark purple */
    text-decoration: none;
    letter-spacing: 1px;
    transition: color 0.3s ease-in-out;
  }

  .brand-link:hover {
    color: #9f7fc9; /* Lighter purple on hover */
  }

  .nav-links-desktop {
    display: none; /* Hidden by default */
    gap: clamp(1rem, 3vw, 2rem);
    justify-content: center;
    flex-grow: 1;
  }

  @media (min-width: 768px) {
    .nav-links-desktop {
      display: flex; /* Show only on desktop */
    }
  }

  .nav-link {
    color: #8c78a0; /* Muted purple */
    font-size: clamp(1rem, 2vw, 1.2rem);
    font-weight: 500;
    text-decoration: none;
    transition: color 0.3s ease-in-out;
  }

  .nav-link:hover {
    color: #6b4d85; /* Darker purple on hover */
  }

  .rsvp-button {
    background-color: #9f7fc9; /* Light purple */
    color: #fff !important;
    padding: var(--fluid-size) calc(var(--fluid-size) * 2);
    border-radius: 30px;
    font-weight: 700;
    letter-spacing: 1px;
    transition: background-color 0.3s ease-in-out, transform 0.2s ease-in-out;
  }

  .rsvp-button:hover {
    background-color: #8367a7;
    transform: translateY(-2px);
  }

  .mobile-menu-button-container {
    display: flex;
    width: 100%;
    justify-content: flex-end; /* Push button to the right on mobile */
  }

  @media (min-width: 768px) {
    .mobile-menu-button-container {
      display: none;
    }
  }

  .mobile-menu-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }

  .icon-hamburger,
  .icon-close {
    height: 2rem;
    width: 2rem;
    color: #6b4d85;
  }

  .mobile-menu {
    display: none;
    flex-direction: column;
    padding: var(--fluid-size);
    background-color: #fff;
    border-top: 1px solid #e0d9d4;
  }

  .mobile-menu.show {
    display: flex;
  }

  .mobile-menu-link {
    font-size: clamp(1rem, 2vw, 1.2rem);
    padding: calc(var(--fluid-size) * 0.75) 0;
    text-decoration: none;
    color: #8c78a0;
    border-bottom: 1px solid #f2f0f5;
    transition: color 0.3s ease-in-out;
  }

  .mobile-menu-link:hover {
    color: #6b4d85;
  }

  .rsvp-button-mobile {
    margin-top: var(--fluid-size);
    background-color: #9f7fc9;
    color: #fff !important;
    padding: 0.75rem 1.5rem;
    border-radius: 30px;
    font-weight: 700;
    letter-spacing: 1px;
    text-align: center;
    transition: background-color 0.3s ease-in-out;
  }

  .rsvp-button-mobile:hover {
    background-color: #8367a7;
  }

  .nav-decoration-left,
  .nav-decoration-right {
    display: none; /* Hide by default on mobile */
  }

  @media (min-width: 768px) {
    .nav-decoration-left,
    .nav-decoration-right {
      display: block; /* Show on desktop */
      width: 150px; /* Increased size */
      height: 150px;
      object-fit: contain;
    }

    .nav-decoration-right {
      transform: scaleX(-1); /* Flip the image horizontally for symmetry */
    }
  }

  .hidden {
    display: none;
  }
  .block {
    display: block;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  .page-section {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: clamp(3rem, 8vw, 6rem) clamp(1rem, 5vw, 4rem);
  }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 4rem);
    color: #6b4d85; /* Dark purple */
    margin-bottom: 1rem;
  }

  .page-subtitle {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: #8c78a0;
    line-height: 1.6;
    max-width: 60ch;
    margin: 0 auto 3rem;
  }

  .hero-section {
    position: relative;
    width: 100%;
    height: 100vh;
    background-image: url('https://placehold.co/1920x1080/8c78a0/FFFFFF?text=YOUR+IMAGE+HERE');
    background-size: cover;
    background-position: center;
  }

  .hero-content {
    background-color: rgba(0, 0, 0, 0.4);
    padding: var(--fluid-size);
    border-radius: 10px;
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(3rem, 10vw, 6rem);
    font-weight: 700;
    letter-spacing: 2px;
  }

  .hero-subtitle {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1rem, 4vw, 2.5rem);
    font-weight: 400;
    margin-top: 1rem;
  }

  .invite-section {
    position: relative;
    margin-top: -10rem; /* Overlap the hero section */
    z-index: 10;
    padding: 2rem 0;
    text-align: center;
  }

  .invite-container {
    background-color: #fff;
    border-radius: 15px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    max-width: 80%;
    margin: 0 auto;
    padding: clamp(2rem, 5vw, 4rem);
    transform: translateY(-20%);
    opacity: 0; /* Default state for the fade-in effect */
    transition: transform 1s ease-out, opacity 1s ease-out;
  }

  .invite-container.fade-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  .invite-content {
    text-align: center;
  }

  .invite-message {
    margin-bottom: clamp(1rem, 2vw, 3rem);
  }

  .invite-text-date {
    font-size: clamp(1.2rem, 2.5vw, 1.8rem);
    color: #6b4d85;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .invite-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    color: #6b4d85;
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }

  .invite-text-body {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: #8c78a0;
    line-height: 1.6;
    max-width: 60ch;
    margin: 0 auto;
  }

  .countdown-section {
    position: relative;
    width: 100%;
    height: 60vh;
    background-image: url('https://placehold.co/1920x1080/6b4d85/FFFFFF?text=YOUR+IMAGE+HERE');
    background-size: cover;
    background-position: center;
    color: #fff;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  .countdown-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Darken overlay */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    opacity: 0; /* Default state for the fade-in effect */
    transition: opacity 1s ease-out;
  }

  .countdown-overlay.fade-in {
    opacity: 1;
  }
  
  .countdown-message {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(1.2rem, 3vw, 2rem);
    margin-bottom: 0.5rem;
    letter-spacing: 1px;
    font-style: italic;
  }

  .countdown-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 4rem);
    margin-bottom: 2rem;
  }

  .countdown-timer {
    display: flex;
    gap: clamp(1rem, 4vw, 2.5rem);
  }

  .timer-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .timer-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(3rem, 10vw, 6rem);
    font-weight: 700;
  }

  .timer-label {
    font-size: clamp(0.8rem, 2vw, 1rem);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: -0.5rem;
  }

  .about-us-section {
    padding: clamp(3rem, 8vw, 6rem) 0;
    text-align: center;
  }

  .about-us-content {
    max-width: 80%;
    margin: 0 auto;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 1s ease-out, transform 1s ease-out;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    gap: 4rem;
  }

  .about-us-content.fade-in {
    opacity: 1;
    transform: translateY(0);
  }
  
  .about-us-text-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .about-us-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    color: #6b4d85;
    margin-bottom: 1rem;
  }

  .about-us-text-body {
    font-size: clamp(1rem, 2vw, 1.2rem);
    color: #8c78a0;
    line-height: 1.6;
    max-width: 60ch;
  }

  .about-us-image-container {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    position: relative;
  }

  .about-us-image {
    width: 100%;
    height: auto;
    max-width: 400px;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .heart-decoration-container {
    position: absolute;
    bottom: -20px;
    right: -20px;
    width: 80px;
    height: 80px;
  }

  .heart-decoration {
    width: 100%;
    height: 100%;
    animation: bounce 2s infinite ease-in-out;
    filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.2));
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-10px) scale(1.1);
    }
  }

  @media (max-width: 768px) {
    .about-us-content {
      flex-direction: column;
      text-align: center;
      gap: 2rem;
    }
    .about-us-image-container {
      justify-content: center;
    }
    .about-us-text-body {
      max-width: none;
    }
    .heart-decoration-container {
      bottom: -10px;
      right: -10px;
      width: 60px;
      height: 60px;
    }
  }

  /* --- Gallery Styles --- */
  .prenup-gallery-section {
    padding: clamp(3rem, 8vw, 6rem) clamp(1rem, 5vw, 4rem);
    text-align: center;
    opacity: 0; /* Initial state for fade-in */
    transform: translateY(20px);
    transition: opacity 1s ease-out, transform 1s ease-out;
  }

  .prenup-gallery-section.fade-in-section {
    opacity: 1;
    transform: translateY(0);
  }

  .prenup-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: clamp(1rem, 2vw, 2rem);
    margin-top: 2rem;
  }

  .gallery-item {
    border-radius: 15px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  }

  .gallery-item:hover {
    transform: scale(1.03);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .gallery-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* --- Modal Styles --- */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }

  .modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90vh;
    background: transparent;
    border-radius: 15px;
    overflow: hidden;
  }

  .modal-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .modal-close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 2rem;
    color: #fff;
    background: none;
    border: none;
    cursor: pointer;
    z-index: 2001;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }

  /* --- 4-Image Gallery Styles --- */
  .photo-gallery {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
    max-width: 90%;
    margin: 2rem auto;
  }

  .photo-card {
    position: relative;
    width: 250px;
    height: 250px;
    overflow: hidden;
    border-radius: 10px;
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  }

  .photo-card:hover {
    transform: rotateZ(3deg) scale(1.05);
    box-shadow: 0 0 15px 5px rgba(255, 105, 180, 0.8),
                0 0 25px 10px rgba(255, 105, 180, 0.6),
                0 0 40px 15px rgba(255, 105, 180, 0.4);
  }

  .photo-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .photo-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 0.5rem;
    text-align: center;
    transform: translateY(100%);
    transition: transform 0.3s ease-in-out;
  }

  .photo-card:hover .photo-caption {
    transform: translateY(0);
  }

  .photo-caption h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    color: #6b4d85;
    margin: 0;
  }

  .photo-caption p {
    font-size: 0.8rem;
    color: #8c78a0;
    margin: 0;
  }

  /* Mobile responsiveness for the new gallery */
  @media (max-width: 768px) {
    .photo-gallery {
      flex-direction: column;
      align-items: center;
    }
  }

  .hidden {
    display: none;
  }
  .block {
    display: block;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

const StyleWrapper = () => (
  <style>
    {styleSheet}
  </style>
);

// We combine the components for a single export
export default () => (
  <>
    <StyleWrapper />
    <App />
  </>
);
