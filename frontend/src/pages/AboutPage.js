// frontend/src/pages/AboutPage.js

import Nav from "../components/Nav";
import aboutpic1 from "../assets/aboutpic1.jpg";
import aboutpic2 from "../assets/aboutpic2.jpg";

function AboutPage({ darkMode, toggleDarkMode }) {
  return (
    <>
      <Nav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="about-container">
        <section className="aboutie">
          <h2>🏀 What I Love About Basketball</h2>
          <p>Basketball is a sport that challenges both the body and the mind, requiring physical endurance, strategic thinking, and teamwork. I enjoy the fast-paced nature of the game, which develops focus, discipline, and perseverance. Beyond improving my skills on the court, basketball teaches valuable life lessons in communication, leadership, and self-confidence. These experiences have shaped my personal growth and positively influenced my approach to academics and daily life.</p>
          <img src={aboutpic1} alt="Basketball practice session" />
        </section>
        <section className="aboutie">
          <h2>🌟 My Basketball Journey</h2>
          <p>I started playing basketball at a young age, learning the fundamentals through casual games and regular practice. Over time, I developed my skills by observing professional players and applying what I learned during training sessions. What started as a fun activity quickly became a passion that drives me to improve every day.</p>
          <h3>My Development Path:</h3>
          <ul><li>🎯 Learning fundamentals</li>
              <li>💪 Practicing skills daily</li>
              <li>👥 Playing with friends</li><li>📺 Watching professionals</li>
              <li>🏆 Participating in tournaments</li></ul>
          <img src={aboutpic2} alt="Basketball court with hoop" />
        </section>
      </div>
      <blockquote>“Basketball doesn’t build character. It reveals it.” – James Naismith</blockquote>
      <footer><p>📧 Email: aldrinvillanueva@email.com | 📞 Phone: 099-192-31885</p><p>🏀 &copy; 2026 Basketball Portfolio Project | Passion for the Game</p></footer>
    </>
  );
}

export default AboutPage;