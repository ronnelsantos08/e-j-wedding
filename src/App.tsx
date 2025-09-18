import React, { useState, useEffect, useRef } from 'react';
import type { Ref } from 'react';
import { createPortal } from "react-dom";

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
            <img src="decorations/deco1.png" alt="Decorative flower" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="nav-links-desktop">
            <a href="#home" onClick={() => handleScrollToSection('home')} className="nav-link">Home</a>
            <a href="#prenup" onClick={() => handleScrollToSection('prenup-gallery')} className="nav-link">Prenup</a>
            <a href="#location" onClick={() => handleScrollToSection('location')} className="nav-link">Location</a>
            <a href="#" onClick={() => setCurrentPage('entourage')} className="nav-link">Entourage</a>
            <a href="#dresscode" onClick={() => handleScrollToSection('dresscode')} className="nav-link">Dresscode</a>
            <a href="#rsvp" onClick={() => handleScrollToSection('rsvp')} className="nav-link rsvp-button">RSVP</a>
          </div>

          {/* Right decoration image */}
          <div className="nav-decoration-right">
            <img src="decorations/deco2.png" alt="Decorative flower" />
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

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // We'll run the canvas setup only once on component mount.
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Defines the properties and behavior of a single particle.
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      ctx: CanvasRenderingContext2D;
      canvas: HTMLCanvasElement;

      constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = 'rgba(255, 255, 255, 0.5)';
      }

      // Moves the particle based on its speed and reverses direction if it hits a wall.
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > this.canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > this.canvas.height || this.y < 0) this.speedY = -this.speedY;
      }

      // Draws the particle as a circle on the canvas.
      draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    let particles: Particle[] = [];

    // Initializes the particles based on the canvas size.
    const init = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle(canvas, ctx));
      }
    };

    // The main animation loop that updates and draws all particles.
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };

    // Handles resizing the canvas when the window size changes.
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    animate();

    // Cleans up the event listener when the component is removed.
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Position the canvas on top of the background image with a higher z-index.
  return <canvas ref={canvasRef} className="particle-canvas"></canvas>;
};
const HomePage: React.FC = () => {
  const [ref1, isInView1] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const [ref3, isInView3] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  return (
    <>
     <div className="app-container">
      <style>
        {`
        .app-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          font-family: sans-serif;
          background-color: #0c0a09;
          color: #fff;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          background-size: cover;
          background-position: center;
        }

        .particle-canvas {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10;
        }

        .hero-section {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1.5rem;
        }
        
        .hero-content {
          position: relative;
          z-index: 20;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin-bottom: 1rem;
        }
        
        @media (min-width: 768px) {
          .hero-title {
            font-size: 4.5rem;
          }
        }

        .hero-subtitle {
          font-size: 1.125rem;
          color: #e5e7eb;
          max-width: 42rem;
        }

        @media (min-width: 768px) {
          .hero-subtitle {
            font-size: 1.25rem;
          }
        }

        .other-content-section {
          position: relative;
          z-index: 20;
          width: 100%;
          height: 100vh;
          background-color: #0c0a09;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .other-content-title {
          font-size: 2.25rem;
          font-weight: 600;
        }
        `}
      </style>

      {/* Background image layer with a lower z-index */}
      <div 
        className="hero-background"
        style={{ backgroundImage: "url('https://placehold.co/1920x1080/000000/FFFFFF?text=Hero+Image')" }}
      ></div>

      {/* The ParticleBackground component, now positioned on top of the image */}
      <ParticleBackground />

      {/* The Hero Section content, which sits on top of both layers */}
      <section className="hero-section">
        <div className="hero-content">
             <div className="flex justify-center items-center py-8">
      <audio controls>
        <source src="/audio/music.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
        </div>
      </section>

      {/* A placeholder for other content on the page */}
      <section className="other-content-section">
        <h2 className="other-content-title">
          Other Content Here
        </h2>
      </section>
    </div>
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
              <img src="invite/invite1.jpeg" alt="Couple's engagement photo" className="photo-image" />
              <div className="photo-caption">
                <h3>Emerson & Justine</h3>
                <p>January 31, 2026</p>
              </div>
            </div>
            <div className="photo-card">
              <img src="invite/invite2.jpeg" alt="Couple laughing" className="photo-image" />
              <div className="photo-caption">
                <h3>Our Journey</h3>
                <p>Shared moments</p>
              </div>
            </div>
            <div className="photo-card">
              <img src="invite/invite3.jpeg" alt="Couple holding hands" className="photo-image" />
              <div className="photo-caption">
                <h3>Our Vows</h3>
                <p>Promise forever</p>
              </div>
            </div>
            <div className="photo-card">
              <img src="invite/invite4.jpeg" alt="Couple in a field" className="photo-image" />
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
            <img className="about-us-image" src="lovestory/lovestory.jpeg" alt="Couple's photo" />
            {/* The floating heart decoration */}
            <div className="heart-decoration-container">
            <img
          src="/decorations/ring6.png"  // <-- path to your local image
          alt="Heart Decoration"
          className="heart-decoration"
        />
            </div>
          </div>
        </div>
      </section>

      {/* Prenup Gallery Section */}
      <PrenupGallery />
      <VideoSection />
      {/* Location Section */}
      <LocationSlider />

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Replace with your own images
  const images = Array.from({ length: 20 }, (_, i) => ({
    thumb: `/prenup/prenup${i + 1}.jpeg`,
    full: `/prenup/prenup${i + 1}.jpeg`,
  }));

  const openModal = (img: string) => setSelectedImage(img);
  const closeModal = () => setSelectedImage(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedImage ? "hidden" : "";
  }, [selectedImage]);

  return (
    <section className="new-gallery" id="prenup-gallery">
      <h2 className="gallery-title">Captured Moments</h2>
      <p className="gallery-subtitle">
        Memories leading up to our special day.
      </p>

      <div className="masonry-grid">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="masonry-item"
            onClick={() => openModal(img.full)}
          >
            <img
              src={img.thumb}
              alt={`Gallery ${idx + 1}`}
              loading="lazy"
              className="masonry-img"
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedImage &&
        createPortal(
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-body" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
              <img
                src={selectedImage}
                alt="Enlarged"
                className="modal-photo"
              />
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};
const VideoSection: React.FC = () => {
  return (
    <section className="video-section" id="video">

      <div className="video-wrapper">
        <iframe
          className="video-frame"
          src="video/video.mp4" // 
          title="Prenup Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
};



const LocationSlider: React.FC = () => {
  const cardTrackRef = useRef<HTMLDivElement>(null);
  const fullscreenBgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Data for the slider. Using placeholders for images.
  const sliderData = [
    {
      image: "/locations/location1.jpg",
      title: "Wedding Ceremony",
      text: "The beautiful ceremony will take place at sunset in the garden, with a view of the ocean."
    },
    {
      image: "locations/location2.jpg",
      title: "Reception Party",
      text: "Join us for an evening of dinner, dancing, and celebration under the stars at the grand ballroom."
    }
  ];

  useEffect(() => {
    if (fullscreenBgRef.current && titleRef.current && textRef.current) {
      fullscreenBgRef.current.style.backgroundImage = `url(${sliderData[activeIndex].image})`;
      titleRef.current.innerText = sliderData[activeIndex].title;
      textRef.current.innerText = sliderData[activeIndex].text;
    }

    const scrollToCard = () => {
      if (cardTrackRef.current) {
        // Calculate the width of a single card plus its margin.
        const cardElement = cardTrackRef.current.querySelector('.card') as HTMLElement;
        if (cardElement) {
          const cardWidth = cardElement.offsetWidth + 16;
          const scrollX = cardWidth * activeIndex;
          cardTrackRef.current.scrollTo({ left: scrollX, behavior: "smooth" });
        }
      }
    };
    scrollToCard();
  }, [activeIndex, sliderData]);

  const handleNav = (direction: 'left' | 'right') => {
    let newIndex = activeIndex;
    if (direction === 'left') {
      newIndex = (activeIndex - 1 + sliderData.length) % sliderData.length;
    } else {
      newIndex = (activeIndex + 1) % sliderData.length;
    }
    setActiveIndex(newIndex);
  };

  return (
    <section className="page-section" id="location">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        
        .location-container {
          position: relative;
          min-width: 100vw;
          min-height: 100vh;
          overflow: hidden;
          font-family: 'Playfair Display', serif;
          color: white;
          z-index: 30;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        
          /* Elegant neon purple border */
          border: 2px solid rgba(186, 85, 211, 0.7); /* soft purple border */
          border-radius: 20px; /* smooth edges */
          box-shadow: 0 0 15px rgba(186, 85, 211, 0.8), 
                      0 0 30px rgba(186, 85, 211, 0.5),
                      inset 0 0 10px rgba(186, 85, 211, 0.4);
        }
        

        .fullscreen-background {
          position: relative;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-size: cover;
          background-position: center;
          z-index: 1;
          transition: background 0.8s ease;
          display: flex;
          align-items: center;
          justify-content: normal;
          text-align: center;
          padding: 2rem;
          padding-left: 100px;
        }
        .fullscreen-background:after {
          content: "";
          background: linear-gradient(2deg, black -21%, transparent);
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          z-index: 2;
        }

        .fullscreen-content {
          z-index: 3;
          display: flex;
          align-items: center;
          line-height: 1.4;
        }
        
        .fullscreen-content h1 {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
          line-height: 1;
          flex-basis: 40%;
          text-align: left;
        }
        
        .text-and-map {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: right;
        }
        
        .text-and-map p {
          font-size: 1.5rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
        }

        .map-icon-container {
            display: inline-block;
            cursor: pointer;
            transition: transform 0.2s ease;
            filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
        }

        .map-icon-container:hover {
            transform: scale(1.1);
        }

        .map-icon {
            width: 40px;
            height: 40px;
        }
        
        .slider-container {
          position: relative;
          top: -10rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 10;
        }
        
        .card-track {
          display: flex;
          gap: 1rem;
          overflow-x: hidden;
          max-width: 80vw;
          transition: transform 0.5s ease;
        }
        
        .card {
          flex: 0 0 auto;
          width: 200px;
          height: 130px;
          background-color: #222;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transform: scale(1);
          transition: all 0.4s ease;
          opacity: 0;
          animation: fadeUp 0.8s ease forwards;
        }

        .card:first-child { animation-delay: 0s; }
        .card:nth-child(2) { animation-delay: 0.1s; }
        
        .card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .card-text {
          position: relative;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.6);
          font-size: 1rem;
          text-align: center;
        }
        
        .card.active {
          transform: scale(1.1);
          box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2);
          z-index: 1;
        }
        
        .card.active img {
          transition: all 0.3s ease;
          transform: scale(1.5);
        }
        
        .card.active .card-text {
          display: none;
        }
        
        .nav-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .nav-btn:hover {
          transform: scale(1.2);
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        /* Base font scaling for responsiveness */
html {
  font-size: 16px; /* desktop default */
}

@media (max-width: 1200px) {
  html {
    font-size: 15px;
  }
}

@media (max-width: 992px) {
  html {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  html {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  html {
    font-size: 12px;
  }
}

/* Container adjustments */
.location-container {
  border-radius: 12px;
  padding: 1rem;
}

/* Background content */
.fullscreen-background {
  padding: 1.5rem;
  padding-left: 2rem;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: center;
}

.fullscreen-content {
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
}

.fullscreen-content h1 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  text-align: center;
  flex-basis: auto;
}

.text-and-map {
  align-items: center;
  text-align: center;
}

.text-and-map p {
  font-size: clamp(1rem, 3vw, 1.5rem);
}

/* Map Icon */
.map-icon {
  width: clamp(30px, 6vw, 40px);
  height: clamp(30px, 6vw, 40px);
}

/* Slider container */
.slider-container {
  top: -5rem;
  flex-direction: row;
  gap: 0.5rem;
}

.card-track {
  max-width: 90vw;
  gap: 0.5rem;
}

.card {
  width: clamp(140px, 40vw, 200px);
  height: clamp(90px, 30vw, 130px);
}

.card-text {
  font-size: clamp(0.8rem, 2.5vw, 1rem);
}

/* Responsive tweaks */
@media (max-width: 768px) {
  .fullscreen-background {
    padding-left: 1rem;
  }

  .slider-container {
    top: -3rem;
  }
}

@media (max-width: 480px) {
  .slider-container {
    flex-direction: column;
    gap: 0.8rem;
  }

  .nav-btn {
    font-size: 1.5rem;
  }

  .card {
    width: 80vw;
    height: 150px;
  }
}

        `}
      </style>
      
      <div ref={fullscreenBgRef} className="fullscreen-background" id="fullscreen-bg">
        <div className="fullscreen-content">
          <h1 ref={titleRef}></h1>
          <div className="text-and-map">
            <p ref={textRef}></p>
            <a 
              href="https://maps.app.goo.gl/354n28BvB9gR5d3P6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="map-icon-container"
              aria-label="View on Google Maps"
            >
              <img src="/locations/mapicon.png" alt="Google Maps icon" className="map-icon" />
            </a>
          </div>
        </div>
      </div>

      <div className="slider-container">
        <button className="nav-btn left" onClick={() => handleNav('left')} aria-label="Scroll Left">
          <i data-lucide="chevron-left">{'<'}</i>
        </button>

        <div className="card-track" ref={cardTrackRef}>
          {sliderData.map((item, index) => (
            <div
              key={index}
              className={`card ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img src={item.image} alt={item.title} />
              <div className="card-text">{item.title}</div>
            </div>
          ))}
        </div>

        <button className="nav-btn right" onClick={() => handleNav('right')} aria-label="Scroll Right">
          <i data-lucide="chevron-right">{'>'}</i>
        </button>
      </div>
    </section>
  );
};

// Define the data structure as before
const entourageData = {
  parentsOfTheGroom: [
    'ERMINIO GONZALES OLIVAR',
    'ELENITA GONZALES OLIVAR',
  ],
  parentsOfTheBride: [
    'ALEX DIMAPILIS MOJICA',
    'MA. ALICE MOJICA DOMINGO',
  ],
  principalSponsors: [
    ['OSCAR OLIVAR JR.', 'LOIDA OLIVAR'],
    ['AQUINO OLIVAR', 'MARY GRACE MERCADO'],
    ['ARWIN DEMILLO', 'ALELI DEMILLO'],
    ['ARGEL JOSEPH MOJICA', 'ABIGAIL LOURDES MOJICA'],
    ['MICHAEL JOHN MONTENEGRO', 'MA. ANGELICA MONTENEGRO'],
    ['APOLO ALCAZAR', 'ELENA ALCAZAR'],
    ['NORBELL DOMINGO', 'MA. VICTORIA CORTEZ'],
    ['JAY VILLANUEVA', 'MYLENE VILLANUEVA'],
    ['STEPHEN CHARLES KEPPLER', 'MARISSA ASITOGUE'],
    ['CHRISTOPHER GARCIA', 'LOIDA GARCIA'],
    ['HON. CELSO DE CASTRO', 'MARIAN VIDALLO'],
    ['ENGR. WILLIAM REYES', 'HON. LEONOR REYES'],
    ['RIZALINO CRYSTAL', 'DEM CRYSTAL'],
    ['GEOK HEE TERENCE CHUA', 'LORELEI CHUA'],
    ['GENEROSO BUNYI', 'OLIVIA BUNYI'],
  ],
  secondarySponsors: [
    { role: 'VEIL', names: ['RALPH MARON EDBERT DOMINGO', 'DANICA LANDICHO'] },
    { role: 'CANDLE', names: ['JOHN LAURENCE OLIVAR', 'CARLA OPINION'] },
    { role: 'CORD', names: ['ROVIN JOHN SALAUM', 'MIL ANN ELLA NOZON'] },
  ],
  bestMan: 'MARC GIAN VILLANUEVA',
  groomsmen: [
    'JUDE ANDREW DE GRANO',
    'JETHRO AREVALO',
    'JOHN EDRIAN LEGASPI',
    'LESTER TORDECILLA',
    'KIM XAVIER LABAGALA',
    'KHRYZS ANDREW ALIPIO',
    'JEFFERSON ROSALES',
    'KRISTIAN JAY RAMOS',
  ],
  maidOfHonor: 'MIKHAJOY MANALO',
  bridesmaids: [
    'DIANNE DE GRANO',
    'LEAH MAE CUADRA',
    'JEAN KLAIRE VISCO',
    'MARICEL BACOS',
    'MILCA DECENA',
    'QUEEN ANNACELLE REOSA',
    'KORINE JADE AMBAT',
    'ANGELYN GUAB',
  ],
  bearers: [
    { role: 'RING BEARER', name: 'JOHN LAURIEL OLIVAR' },
    { role: 'BIBLE BEARER', name: 'ALWYN ISAAC FABIAN DEMILLO' },
    { role: 'COIN BEARER', name: 'JOHN LOURVINCE OLIVAR' },
  ],
  flowerGirls: [
    'AIOFE DENISE ANGELINE PEJI',
    'BETINA MAE MERCADO',
    'YLLOIDA JEAN OLIVAR',
    'YLLOIDA JADE OLIVAR',
  ],
};

const EntouragePage: React.FC = () => (
  <section className="page-section">
    <h2 className="page-title">The Wedding Entourage</h2>
    <p className="page-description">
      We are so grateful for the love and support of these amazing people who
      will be standing by our side on our special day.
    </p>

    <div className="entourage-container">
      {/* Parents Section */}
      <table className="entourage-table">
        <tbody>
          <tr>
            <td colSpan={2} className="category-header"><h3>Parents of the Groom</h3></td>
          </tr>
          {entourageData.parentsOfTheGroom.map((name, index) => (
            <tr key={`groom-parent-${index}`}><td colSpan={2}>{name}</td></tr>
          ))}
          <tr>
            <td colSpan={2} className="category-header"><h3>Parents of the Bride</h3></td>
          </tr>
          {entourageData.parentsOfTheBride.map((name, index) => (
            <tr key={`bride-parent-${index}`}><td colSpan={2}>{name}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Principal Sponsors Section */}
      <table className="entourage-table">
        <tbody>
          <tr>
            <td colSpan={2} className="category-header"><h3>Principal Sponsors</h3></td>
          </tr>
          {entourageData.principalSponsors.map((sponsor, index) => (
            <tr key={`principal-sponsor-${index}`}>
              <td className="sponsor-col">{sponsor[0]}</td>
              <td className="sponsor-col">{sponsor[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Secondary Sponsors Section */}
      <table className="entourage-table">
        <tbody>
          <tr>
            <td colSpan={2} className="category-header"><h3>Secondary Sponsors</h3></td>
          </tr>
          {entourageData.secondarySponsors.map((sponsor, index) => (
            <tr key={`secondary-sponsor-${index}`}>
              <td className="sponsor-role-col">{sponsor.role}:</td>
              <td className="sponsor-col">{sponsor.names[0]} & {sponsor.names[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Wedding Party Section */}
      <table className="entourage-table">
        <tbody>
          <tr>
            <td colSpan={2} className="category-header"><h3>Best Man</h3></td>
          </tr>
          <tr><td colSpan={2}>{entourageData.bestMan}</td></tr>
          <tr>
            <td colSpan={2} className="category-header"><h3>Groomsmen</h3></td>
          </tr>
          {entourageData.groomsmen.map((name, index) => (
            <tr key={`groomsmen-${index}`}><td colSpan={2}>{name}</td></tr>
          ))}
          <tr>
            <td colSpan={2} className="category-header"><h3>Maid of Honor</h3></td>
          </tr>
          <tr><td colSpan={2}>{entourageData.maidOfHonor}</td></tr>
          <tr>
            <td colSpan={2} className="category-header"><h3>Bridesmaids</h3></td>
          </tr>
          {entourageData.bridesmaids.map((name, index) => (
            <tr key={`bridesmaid-${index}`}><td colSpan={2}>{name}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Bearers & Flower Girls Section */}
      <table className="entourage-table">
        <tbody>
          <tr>
            <td colSpan={2} className="category-header"><h3>Bearers</h3></td>
          </tr>
          {entourageData.bearers.map((bearer, index) => (
            <tr key={`bearer-${index}`}>
              <td className="bearer-role-col">{bearer.role}:</td>
              <td className="bearer-col">{bearer.name}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} className="category-header"><h3>Flower Girls</h3></td>
          </tr>
          {entourageData.flowerGirls.map((name, index) => (
            <tr key={`flowergirl-${index}`}><td colSpan={2}>{name}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
const DresscodePage: React.FC = () => {
  const [ref2, isInView] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
  const [gridRef2, isGridInView] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="page-section2" id="dresscode" ref={ref2}>
      <div className="particles-container">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 5 + 5}px`,
              height: `${Math.random() * 5 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100 + 100}vh`,
              animationDelay: `-${Math.random() * 20}s`,
              animationDuration: `${Math.random() * 15 + 15}s`,
            }}
          />
        ))}
      </div>

      <div className={`container fade-in-on-scroll ${isInView ? 'in-view' : ''}`}>
        <h2 className="heading-main text-center">Dress Code</h2>
        <p className="heading-sub text-center">
          We kindly request your presence in semi-formal or formal attire.
        </p>

        <div
          className={`image-grid fade-in-on-scroll ${isGridInView ? 'in-view' : ''}`}
          ref={gridRef2}
        >
          <div className="image-card">
            <img
              src="https://placehold.co/600x800/E5A9A9/FFFFFF?text=Formal+Attire"
              alt="Example of formal attire"
            />
          </div>
          <div className="image-card">
            <img
              src="https://placehold.co/600x800/B2D8D8/000000?text=Semi-Formal+Attire"
              alt="Example of semi-formal attire"
            />
          </div>
          <div className="image-card">
            <img
              src="https://placehold.co/600x800/EAEAEA/333333?text=Evening+Wear"
              alt="Example of evening wear"
            />
          </div>
        </div>

        <div className="text-center">
          <h3 className="heading-secondary">Our Color Palette</h3>
          <p className="heading-sub">
            While not required, we encourage you to wear a color from our wedding palette to complement the theme.
          </p>
          <div className="color-palette-wrapper">
            <div className="color-swatch-container">
              <div className="color-swatch" style={{ backgroundColor: '#F8F6F4' }}></div>
              <span className="color-label">Ivory</span>
            </div>
            <div className="color-swatch-container">
              <div className="color-swatch" style={{ backgroundColor: '#A2C2C2' }}></div>
              <span className="color-label">Sage</span>
            </div>
            <div className="color-swatch-container">
              <div className="color-swatch" style={{ backgroundColor: '#D4B9A7' }}></div>
              <span className="color-label">Dusty Rose</span>
            </div>
            <div className="color-swatch-container">
              <div className="color-swatch" style={{ backgroundColor: '#8B4513' }}></div>
              <span className="color-label">Chocolate</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const RsvpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [isAttending, setIsAttending] = useState(true);
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmissionStatus('submitting');

    const formData = new FormData();

    // ✅ Use your form’s entry IDs
    formData.append('entry.417451165', name); // Full Name
    formData.append('entry.1713735447', contact); // Contact Number
    formData.append('entry.1349849489', isAttending ? 'Yes' : 'No'); // Attending
    formData.append('entry.744453682', guests.toString()); // Guests
    formData.append('entry.383237546', message); // Message

    try {
      await fetch(
        'https://docs.google.com/forms/d/e/1FAIpQLScTiuZpbmWNOG_h97iE4OrcXgUB3PJ-segRZitRVvEv9yLqww/formResponse',
        {
          method: 'POST',
          mode: 'no-cors',
          body: formData,
        }
      );

      setSubmissionStatus('success');
      setName('');
      setContact('');
      setGuests(1);
      setIsAttending(true);
      setMessage('');
    } catch (error) {
      console.error('RSVP submission failed:', error);
      setSubmissionStatus('error');
    }
  };

  return (
    <section className="page-section" id="rsvp">
      <h2 className="page-title">RSVP</h2>
      <p className="page-description">
        Please let us know if you can join us by filling out the form below.
      </p>

      <form onSubmit={handleSubmit} className="rsvp-form">
        {/* Full Name */}
        <div className="form-field">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>

        {/* Contact Number */}
        <div className="form-field">
          <label htmlFor="contact" className="form-label">Contact Number</label>
          <input
            type="tel"
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="form-input"
          />
        </div>

        {/* Attending */}
        <div className="form-field">
          <label className="form-label">Will you be attending?</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="attending"
                value="yes"
                checked={isAttending === true}
                onChange={() => setIsAttending(true)}
                className="radio-input"
              />{' '}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="attending"
                value="no"
                checked={isAttending === false}
                onChange={() => setIsAttending(false)}
                className="radio-input"
              />{' '}
              No
            </label>
          </div>
        </div>

        {/* Guests */}
        {isAttending && (
          <div className="form-field">
            <label htmlFor="guests" className="form-label">
              How many guests will be attending with you?
            </label>
            <select
              id="guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              required={isAttending}
              className="form-input"
            >
              {[...Array(10).keys()].map((num) => (
                <option key={num + 1} value={num + 1}>
                  {num + 1}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Message */}
        <div className="form-field">
          <label htmlFor="message" className="form-label">
            Message for the couple (optional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="form-textarea"
          />
        </div>

        <button
          type="submit"
          disabled={submissionStatus === 'submitting'}
          className={`submit-button ${
            submissionStatus === 'submitting' ? 'submitting' : ''
          }`}
        >
          {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit RSVP'}
        </button>

        {submissionStatus === 'success' && (
          <p className="success-message">
            Thank you for your RSVP! We can't wait to celebrate with you.
          </p>
        )}
        {submissionStatus === 'error' && (
          <p className="error-message">
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </section>
  );
};

// We combine the components for a single export
export default () => (
  <>
    <App />
  </>
);
