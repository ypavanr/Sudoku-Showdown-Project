import React from "react";
import "./About.css";
import Mail from "../../assets/mail.svg";
import Git from "../../assets/github.svg";
import Logo from "../features/logo"

function AboutProject() {
  return (
    <div>
      <div className="header">
        <Logo/>
        <h1>Sudoku Savvy</h1>
        <div className="code-links" >
          <a href="https://github.com/ypavanr/Sudoku-Showdown-Project.git" target="_blank" rel="noopener noreferrer">
            <img src={Git} alt="GitHub" className="icon"/>
            <u>Link to the Source Code</u>
          </a>
          
          <div className="email">
            <i><img src={Mail} alt="Mail" className="icon" />
              sudokusavvy.project@gmail.com
            </i>
          </div>
        </div>

        <h2>About The Project</h2>
        </div>
          <div className="about-container">
            <div className="developer dev-violet">
              <div className="developer-header">
                <h2><u><b>Motivation</b></u></h2>
              </div>
              <p> What began as a friendly competition among us quickly turned into a full-fledged project. 
                  We used to challenge each other to solve Sudoku puzzles faster, but we couldn’t find any 
                  good applications that let us compete on the same puzzle in real-time. Most apps focused 
                  only on solo play, and none offered the multiplayer experience we were looking for.
                  So, we decided to build our own.
                  At first, our focus was on competition—racing to finish the same puzzle faster than our friends. 
                  But as we started developing, we realized that solving puzzles together was just as fun. 
                  That led us to implement a cooperative mode, where multiple players could work together 
                  on the same Sudoku grid. As the project grew, we kept adding more user-friendly features 
                  and better interfaces to make the experience more engaging. Sudoku Savvy evolved from just 
                  a personal challenge into a polished multiplayer Sudoku platform—designed to bring people 
                  together, whether they want to compete, collaborate, or just have fun solving puzzles.
              </p>
            </div>
          </div>

          <div className="about-container">
            <div className="developer dev-violet">
             <div className="developer-header">
              <h2><u><b>Key Features</b></u></h2>
            </div>
            <ul>
              <li><b>User Icon and Username</b> – A fun way to personalize your profile! Choose an icon and a name that suits your vibe.</li>
              <li><b>Competitive Mode</b> – Compete against others in real time to see who can conquer the Grid the fastest!</li>
              <li><b>Cooperative Mode</b> – Join forces with friends and solve the same puzzle together as a team.</li>
              <li><b>Solo Mode</b> – Just want to chill and solve on your own? Perfect for practice or casual play.</li>
              <li><b>Expert Level (66 empty cells)</b> – The ultimate challenge! Unlike other levels, puzzles here can have multiple solutions and disable validation and scoring for added intensity.</li>
              <li><b>Difficulty Levels</b> – Choose from Easy (35 empty cells), Medium (45), Hard (55), or Expert (66) based on your skill and mood.</li>
              <li><b>Custom Puzzle Generator</b> – Automatically generates puzzles with unique solutions for Easy, Medium, and Hard levels.</li>
              <li><b>Expert Mode Generator</b> – Creates very challenging puzzles that can have multiple valid solutions.</li>
              <li><b>Solution Verifier</b> – Ensures generated puzzles have a unique solution in all levels except Expert.</li>
              <li><b>Room Creation</b> – Players can create multiple rooms, each with its own settings and game mode.</li>
              <li><b>One Room per Player</b> – Each user can only join one room at a time to keep gameplay consistent.</li>
              <li><b>Host Privileges</b> – The host chooses the level, mode, and time before starting the game.</li>
              <li><b>Host Transfer</b> – If the host leaves, another player automatically becomes the new host.</li>
              <li><b>Custom Validation Toggle</b> – The host can decide whether to enable or disable the automatic validation system before starting a game.</li>
              <li><b>Real-Time Chat</b> – Communicate with other players while you play—strategize, trash talk, or just vibe.</li>
              <li><b>Quit Button</b> – Lets you leave the room or game at any time with a single click.</li>
              <li><b>New Game Trigger</b> – Hosts can launch a new game round directly from the room settings.</li>
              <li><b>Leaderboard (Competitive Mode)</b> – Tracks and displays player rankings based on speed and accuracy.</li>
              <li><b>Point System</b> – Awards points in competitive mode based on how quickly and accurately players complete the puzzle (not available in Expert Mode or when validation is disabled; in these cases, the fastest solver earns the highest points).</li>
              <li><b>Mid-Game Join (Cooperative)</b> – Players who join after a match has started automatically sync with the ongoing game—receiving the puzzle, remaining time, and current progress to continue alongside others seamlessly.</li>
              <li><b>Collapsible Chat</b> – The in-game chat can be minimized or maximized using (+/–) buttons, letting you hide or show conversations whenever you want.</li>
            </ul>
          </div>
        </div>

        <div className="about-container">
          <div className="developer dev-violet">
            <div className="developer-header">
              <h2><u><b>Tech Stack</b></u></h2>
            </div>
            <ul>
              <li><b>React.js (with Vite)</b> – For building a fast and modular user interface.</li>
              <li><b>localStorage</b> – Used to persist the username and avatar/icon locally across sessions.</li>
              <li><b>Socket.IO Client</b> – Enables real-time communication with the backend server via WebSockets.</li>
              <li><b>Node.js + Express.js</b> – Handles API routing, socket events, and game logic.</li>
              <li><b>Socket.IO Server</b> – Manages real-time multiplayer interaction between players.</li>
              <li><b>Supabase (PostgreSQL)</b> – Stores analytics data such as room ID, game mode, level, and usernames for tracking user engagement and improving the experience.</li>
              <li><b>nanoid</b> – Used to generate short, unique room IDs for each game session.</li>
              <li><b>VS Code</b> – Primary code editor for frontend and backend development.</li>
              <li><b>Git</b> – Version control system for tracking code changes and collaboration.</li>
              <li><b>Vercel</b> – Deployed the React frontend for fast global delivery.</li>
              <li><b>Render</b> – Hosted the Node.js + Express backend server.</li>
            </ul>
          </div>
        </div>

        <div className="about-container">
          <div className="developer dev-violet">
            <div className="developer-header">
              <h2><u><b>What We Learnt</b></u></h2>
            </div>
          <p>Through building this project, we gained valuable experience with Socket.IO and real-time communication. 
            We learned how to create and manage rooms, handle events between clients and the server, and implement a 
            lot of features. This gave us a deeper understanding of WebSockets and how real-time multiplayer systems 
            work behind the scenes.<br></br>
            We also significantly improved our skills in frontend design and user experience. From developing responsive 
            layouts to adding smooth transitions and intuitive controls, we focused on making the interface both attractive 
            and user-friendly. Styling the platform to support different game modes and adapting layouts for multiplayer 
            interaction challenged us to think about design from the user's perspective.<br></br>
            Another major learning area was Sudoku puzzle generation and validation. We built a custom algorithm that 
            could generate puzzles of varying difficulty levels, ensuring unique solutions for Easy to Hard modes, while 
            allowing multi-solution flexibility in Expert mode. Implementing input validation and dynamically updating 
            the grid further enhanced our understanding of game logic and UI integration.<br></br>
            Finally, we learned how an actual real-time game flow works—from game setup and starting sequences to 
            handling restarts, host transitions, and edge cases like player disconnection. Working through these systems 
            gave us insight into how robust multiplayer games are structured and the kinds of challenges that come with 
            building them.
          </p>
        </div>
      </div>

      <div className="about-container">
        <div className="developer dev-violet">
          <div className="developer-header">
           <h2><u><b>Future Plans</b></u></h2>
          </div>
          <ul>
            <li><b>CC Mode (Team Competition)</b> –  A new mode where players can form teams and compete against each other in coordinated matches.</li>
            <li><b>16x16 Sudoku Support</b> – Expanding beyond the classic 9x9 grid to offer more challenging 16x16 puzzles for advanced players.</li>
            <li><b>Mobile Design Layout</b> – Implementing a fully responsive interface to ensure smooth gameplay across phones and tablets.</li>
            <li><b>Audio Effects</b> – Adding sound cues for actions like placing numbers, making errors, starting games, and winning, to boost interactivity and feedback.</li>
            </ul>
        </div>
      </div>

      <div className="survey-section">
          <div className="email">
            <img src={Mail} alt="Mail" className="icon" />
              sudokusavvy.project@gmail.com
          </div>

          <p>We would love it if you could spend some time on a survey! TOTALLY UP TO YOU 😊</p>
          <a
            href="https://forms.gle/99px39FzZFUK7yuo9"
            className="survey-button"
          >
            Take Our Survey
          </a>
      </div>
    </div>
  );
}

export default AboutProject;
