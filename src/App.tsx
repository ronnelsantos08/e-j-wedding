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
      <audio controls>
        <source src="/audio/music.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
        <div className="hero-content">
             <div className="flex justify-center items-center py-8">
   
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

      <GiftSection />
         {/* Footer Section */}
         <Footer />
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
      <video 
        className="video-frame" 
        controls 
        poster="/prenup/prenup1.jpeg" // your thumbnail image
      >
        <source src="/video/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </section>
  );
};


const LocationSlider: React.FC = () => {
  return (
    <section className="location-section" id="location">
      <div className="location-container">
        <h2 className="location-title">Our Wedding Venues</h2>
        <p className="location-description">
          Join us as we celebrate our union at these beautiful locations.
        </p>
     

        <div className="location-grid">
          {/* Ceremony Card */}
          <div className="location-card">
            <h3 className="venue-type">Ceremony</h3>
            <img
              src="locations/Church-of-Barasoain.jpg"
              alt="Church of Barasoain"
              className="venue-image"
            />
            <h4 className="venue-name">Church of Barasoain</h4>
            <p className="venue-address">
              Paseo del Congreso, Malolos, 3000 Bulacan, Philippines
            </p>
            <p className="venue-time">Ceremony Time: 2:30 PM</p>
            <a
              href="https://maps.app.goo.gl/EgE3KXnctAcq357w8"
              target="_blank"
              rel="noopener noreferrer"
              className="map-button"
            >
              View on Google Maps
            </a>
          </div>

          {/* Reception Card */}
          <div className="location-card">
            <h3 className="venue-type">Reception</h3>
            <img
              src="locations/San-Pablo-MPC-Pavilion.jpg"
              alt="San Pablo MPC Pavilion"
              className="venue-image"
            />
            <h4 className="venue-name">San Pablo MPC Pavilion</h4>
            <p className="venue-address">
            346 Calle Bonifacio, Malolos, Bulacan, Philippines
            </p>
            <a
              href="https://maps.app.goo.gl/ABM5avZ23NQ5dCXGA"
              target="_blank"
              rel="noopener noreferrer"
              className="map-button"
            >
              View on Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Define the updated data structure
const entourageData = {
  parentsOfTheGroom: [
    "Venancio Baronda",
    "Eva Baronda",
  ],
  parentsOfTheBride: [
    "Eutiquio Abrio, Jr (+)",
    "Ma. Victoria Abrio",
  ],
  principalSponsorsMr: [
    "Virgilio Abrio",
    "Engr. Domingo Relao",
    "Engr. Matias Juan",
    "Alvin Patnon",
    "Alberto Pineda",
    "Alvin Lauderes",
    "Dante Lauderes",
    "Manny Lauderes",
  ],
  principalSponsorsMrs: [
    "Mila Abrio",
    "Erlinda Abrio-Relao",
    "Glenda Juan",
    "Antonia Patnon",
    "Haide Pineda",
    "Mary Rose Lauderes",
    "Gerlie Lauderes",
    "Julieta Capili",
  ],
  bestMan: "Dexon Baronda",
  matronOfHonor: "Patricia May Patnon",
  maidOfHonor: "Janelle Ericka Abrio",
  bridesmaids: [
    "Rizalyn Bristol",
    "Camille Lauderes",
    "Nicole Ann Aczon",
    "Anna May Allapitan",
    "Jonesa Lauderes",
    "Shane Abrio",
    "Shena Abrio",
  ],
  groomsmen: [
    "John Mark Abrio",
    "Vien Bronson Baronda",
    "Lloyd Lauderes",
    "Leonard Lauderes",
    "Kenneth Lauderes",
  ],
  secondarySponsors: [
    { role: "Candle", names: ["Rhodalyn Baronda", "David Paul Relao"] },
    { role: "Veil", names: ["Lendy Bagalayos", "Rossco Bagalayos"] },
    { role: "Cord", names: ["Jessica Anastacio", "Melson Baronda"] },
  ],
  bearers: [
    { role: "Ring Bearer", name: "Kody Cadampog" },
    { role: "Arrhae Bearer", name: "Thirdy Patnon" },
    { role: "Bible Bearer", name: "Kervin Cadampog" },
  ],
  flowerGirls: [
    "Ingrid Finette De Leon",
  ],
  littleBride: "NA",
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
            <td colSpan={2} className="category-header"><h3>Principal Sponsors (Mr)</h3></td>
          </tr>
          {entourageData.principalSponsorsMr.map((name, index) => (
            <tr key={`principal-sponsor-mr-${index}`}><td colSpan={2}>{name}</td></tr>
          ))}
          <tr>
            <td colSpan={2} className="category-header"><h3>Principal Sponsors (Mrs/Ms)</h3></td>
          </tr>
          {entourageData.principalSponsorsMrs.map((name, index) => (
            <tr key={`principal-sponsor-mrs-${index}`}><td colSpan={2}>{name}</td></tr>
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
            <td colSpan={2} className="category-header"><h3>Matron of Honor</h3></td>
          </tr>
          <tr><td colSpan={2}>{entourageData.matronOfHonor}</td></tr>
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
          <tr>
            <td colSpan={2} className="category-header"><h3>Groomsmen</h3></td>
          </tr>
          {entourageData.groomsmen.map((name, index) => (
            <tr key={`groomsmen-${index}`}><td colSpan={2}>{name}</td></tr>
          ))}
        </tbody>
      </table>

      {/* Secondary Sponsors & Bearers Section */}
      <table className="entourage-table">
        <tbody>
          <tr>
            <td colSpan={2} className="category-header"><h3>Secondary Sponsors</h3></td>
          </tr>
          {entourageData.secondarySponsors.map((sponsor, index) => (
            <tr key={`secondary-sponsor-${index}`}>
              <td className="sponsor-role-col">{sponsor.role}:</td>
              <td className="sponsor-col">{sponsor.names.join(" & ")}</td>
            </tr>
          ))}
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
            <td colSpan={2} className="category-header"><h3>Flower Girl</h3></td>
          </tr>
          {entourageData.flowerGirls.map((name, index) => (
            <tr key={`flowergirl-${index}`}><td colSpan={2}>{name}</td></tr>
          ))}
          <tr>
            <td colSpan={2} className="category-header"><h3>Little Bride</h3></td>
          </tr>
          <tr><td colSpan={2}>{entourageData.littleBride}</td></tr>
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
              src="dress/female.png"
              alt="Example of formal attire"
            />
          </div>
          <div className="image-card">
            <img
              src="dress/couple.png"
              alt="Example of semi-formal attire"
            />
          </div>
          <div className="image-card">
            <img
              src="dress/male.png"
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
              <div className="color-swatch" style={{ backgroundColor: '#FADADD' }}></div>
              <span className="color-label">Ivory</span>
            </div>
            <div className="color-swatch-container">
              <div className="color-swatch" style={{ backgroundColor: '#E6A4B4' }}></div>
              <span className="color-label">Sage</span>
            </div>
            <div className="color-swatch-container">
              <div className="color-swatch" style={{ backgroundColor: '#A267AC' }}></div>
              <span className="color-label">Dusty Rose</span>
            </div>
            <div className="color-swatch-container">
              <div className="color-swatch" style={{ backgroundColor: '#6A1E55' }}></div>
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

const GiftSection: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (src: string) => {
    setSelectedImage(src);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <section className="gift-section" id="gifts">
      <div className="gift-container">
        <h2 className="gift-title">Gifts for the Couple</h2>
        <p className="gift-message">
          Your presence and support on our wedding day are the greatest gifts we could receive. If you wish to honor us with a gift, a monetary contribution would be warmly appreciated as we begin our new life together.
        </p>
        <div className="gift-reasons">
          <p>Your generous contributions will help us in three significant ways:</p>
          <ul>
            <li><span className="emoji"></span> HONEYMOON</li>
            <li><span className="emoji"></span> NEW HOME</li>
            <li><span className="emoji"></span> FUTURE KIDS</li>
          </ul>
        </div>
        <div className="qr-codes">
          <p className="qr-text">You can scan one of the QR codes below to make a contribution for our future.</p>
          <div className="qr-code-grid">
            <div className="qr-code-item">
              <img
                src="gift/gcash.jpg"
                alt="GCash QR Code"
                className="qr-code-img"
                onClick={() => handleImageClick('gift/gcash.jpg')}
              />
            </div>
            <div className="qr-code-item">
              <img
                src="gift/bpi.jpg"
                alt="BPI QR Code"
                className="qr-code-img"
                onClick={() => handleImageClick('gift/bpi.jpg')}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Enlarged QR Code" className="modal-img" />
            <button className="close-button" onClick={handleCloseModal}>
              &times;
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      
      <p className="footer-text">
        &copy; {new Date().getFullYear()} Our Wedding. All Rights Reserved. Emerson and Justine Wedding.
        <br />
        Site Developed by: Webworks
      </p>
      <div className="social-icons">
        {/* Facebook Icon */}
        <a href="https://www.facebook.com/ronnel.santos08" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Facebook">
          <svg className="social-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2.04C6.5 2.04 2 6.54 2 12.04c0 4.98 3.65 9.13 8.43 9.87v-7.75H7.72V12.04h2.71V9.77c0-2.68 1.63-4.16 4.04-4.16 1.16 0 2.16.21 2.16.21v2.37h-1.2c-1.18 0-1.54.73-1.54 1.48v1.78h2.64l-.42 2.7H14.1V21.9c4.78-.74 8.43-4.89 8.43-9.87C22 6.54 17.5 2.04 12 2.04z"/>
          </svg>
        </a>
        {/* Messenger Icon */}
        <a href="https://m.me/ronnel.santos08" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Messenger">
          <svg className="social-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.03 2 11.01c0 3.32 1.9 6.2 4.7 7.73l-.7 2.04 2.1-.64c.8.24 1.64.37 2.5.37 5.52 0 10-4.03 10-9.01S17.52 2 12 2zm0 16c-1.8 0-3.5-.47-5-1.3l-.6.18.3 1.05.7-.21c1.2-.36 2.4-.54 3.6-.54 4.41 0 8-3.13 8-7s-3.59-7-8-7-8 3.13-8 7c0 3.87 3.59 7 8 7zM10.5 8.5h3v2h-3v-2zm-3 0h2v2h-2v-2zm6 0h2v2h-2v-2z"/>
          </svg>
        </a>
        {/* Email Icon */}
        <a href="mailto:ronnel.santos08@gmail.com.com" className="social-icon-link" aria-label="Email">
          <svg className="social-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </a>
      </div>
    </footer>
  );
};

// We combine the components for a single export
export default () => (
  <>
    <App />
  </>
);
