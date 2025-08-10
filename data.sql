use recruitmentdb;

INSERT INTO users (username, email, password, first_name, last_name, phone, avatar, role, provider, provider_id, created_at) VALUES
('admin', 'admin@gmail.com', '$2a$10$Okh2cGnAQ1jAGnUnxhEqluSm.FhhJn6JMMe7hOdGZjz2iaUjcdOMG', 'Admin', 'System', 123456789, 'https://res.cloudinary.com/druxxfmia/image/upload/v1751448454/f9l6og6hmofqfcqllvoj.png', 'ADMIN', 'LOCAL', null, NOW());

insert into admins(admin_id) values
(1);



INSERT INTO levels (name, description) VALUES
('High School', 'Completed secondary education, typically before entering university.'),
('Associate Degree', 'An undergraduate academic degree awarded by colleges and community colleges.'),
('Bachelor', 'Undergraduate academic degree awarded by universities.'),
('Master', 'Postgraduate academic degree awarded after a bachelor\'s degree.'),
('Doctorate (PhD)', 'The highest level of academic degree awarded by universities.'),
('Diploma/Certificate', 'Short-term or professional qualification below a degree level.'),
('Postdoctoral', 'Advanced academic or research position after completing a doctorate.');

INSERT INTO job_types (name) VALUES
('Full-time'),
('Part-time'),
('Internship'),
('Freelance'),
('Remote'),
('Contract');

INSERT INTO job_industries (name) VALUES
('Information Technology'),
('Finance'),
('Education'),
('Healthcare'),
('Marketing'),
('Manufacturing'),
('Construction'),
('Retail'),
('Legal'),
('Hospitality');
