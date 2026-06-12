CREATE DATABASE IF NOT EXISTS intern_management;
USE intern_management;

CREATE TABLE IF NOT EXISTS interns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status ENUM('active', 'completed', 'terminated') DEFAULT 'active',
  university VARCHAR(200),
  major VARCHAR(150),
  supervisor VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS performance_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  intern_id INT NOT NULL,
  reviewer_name VARCHAR(200) NOT NULL,
  review_date DATE NOT NULL,
  technical_skills INT CHECK (technical_skills BETWEEN 1 AND 5),
  communication INT CHECK (communication BETWEEN 1 AND 5),
  teamwork INT CHECK (teamwork BETWEEN 1 AND 5),
  initiative INT CHECK (initiative BETWEEN 1 AND 5),
  punctuality INT CHECK (punctuality BETWEEN 1 AND 5),
  overall_score DECIMAL(3,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  intern_id INT NOT NULL,
  submitted_by VARCHAR(200) NOT NULL,
  feedback_date DATE NOT NULL,
  category ENUM('positive', 'constructive', 'neutral') DEFAULT 'neutral',
  message TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  intern_id INT NOT NULL,
  recommended_by VARCHAR(200) NOT NULL,
  recommendation_date DATE NOT NULL,
  recommendation_type ENUM('full_time', 'extend', 'decline', 'pending') DEFAULT 'pending',
  strengths TEXT,
  areas_for_improvement TEXT,
  summary TEXT NOT NULL,
  rating ENUM('exceptional', 'strong', 'adequate', 'below_expectations'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO interns (first_name, last_name, email, department, start_date, end_date, university, major, supervisor) VALUES
('Alex', 'Johnson', 'alex.johnson@example.com', 'Engineering', '2026-01-15', '2026-07-15', 'MIT', 'Computer Science', 'Sarah Chen'),
('Maria', 'Garcia', 'maria.garcia@example.com', 'Marketing', '2026-02-01', '2026-08-01', 'Stanford', 'Business', 'Tom Wilson'),
('James', 'Lee', 'james.lee@example.com', 'Data Science', '2026-01-20', '2026-07-20', 'Harvard', 'Statistics', 'Dr. Patel'),
('Priya', 'Sharma', 'priya.sharma@example.com', 'Engineering', '2026-03-01', '2026-09-01', 'UC Berkeley', 'Software Engineering', 'Sarah Chen'),
('Noah', 'Williams', 'noah.williams@example.com', 'Product', '2026-02-15', '2026-08-15', 'Carnegie Mellon', 'HCI', 'Lisa Park');

INSERT INTO performance_reviews (intern_id, reviewer_name, review_date, technical_skills, communication, teamwork, initiative, punctuality, overall_score, notes) VALUES
(1, 'Sarah Chen', '2026-03-15', 5, 4, 5, 4, 5, 4.60, 'Excellent technical skills, great team player'),
(2, 'Tom Wilson', '2026-03-15', 3, 5, 4, 4, 4, 4.00, 'Strong communication, growing technically'),
(3, 'Dr. Patel', '2026-03-20', 5, 4, 4, 5, 5, 4.60, 'Outstanding data analysis work'),
(4, 'Sarah Chen', '2026-04-10', 4, 4, 5, 5, 4, 4.40, 'Very proactive, excellent collaborator'),
(5, 'Lisa Park', '2026-04-01', 4, 5, 4, 4, 4, 4.20, 'Strong product thinking and user empathy');

INSERT INTO feedback (intern_id, submitted_by, feedback_date, category, message) VALUES
(1, 'Sarah Chen', '2026-04-01', 'positive', 'Alex delivered the API refactoring task ahead of schedule with clean, well-documented code.'),
(1, 'Team Lead', '2026-04-15', 'constructive', 'Could improve on asking for help earlier when blocked.'),
(2, 'Tom Wilson', '2026-04-05', 'positive', 'Maria created an excellent campaign report that impressed the client.'),
(3, 'Dr. Patel', '2026-03-25', 'positive', 'James built a dashboard that the whole team now uses daily.'),
(4, 'Sarah Chen', '2026-04-12', 'positive', 'Priya took ownership of a full feature end-to-end with minimal guidance.');

INSERT INTO recommendations (intern_id, recommended_by, recommendation_date, recommendation_type, strengths, areas_for_improvement, summary, rating) VALUES
(1, 'Sarah Chen', '2026-05-01', 'full_time', 'Strong coding skills, fast learner, team player', 'Time estimation on complex tasks', 'Alex is one of the strongest interns we have had. I strongly recommend a full-time offer.', 'exceptional'),
(3, 'Dr. Patel', '2026-05-01', 'full_time', 'Analytical mindset, self-starter, great output quality', 'Presentation skills', 'James produced high-quality work consistently. Recommend for full-time data science role.', 'strong'),
(2, 'Tom Wilson', '2026-05-01', 'extend', 'Creative, excellent communicator', 'Technical depth', 'Maria shows strong promise in marketing. Recommend extending to build more technical skills.', 'strong');
