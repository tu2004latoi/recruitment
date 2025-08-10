CREATE DATABASE IF NOT EXISTS recruitmentdb;
USE recruitmentdb;

create table job_types(
	job_type_id int auto_increment primary key,
    name varchar(50)
);

create table institutions(
	institution_id int auto_increment primary key,
    name varchar(50) not null,
    country varchar(50) not null,
    domain varchar(50) not null, 
    website varchar(255) not null
);

create table job_industries(
	industry_id int auto_increment primary key,
    name varchar(100) not null
);

create table levels(
	level_id int auto_increment primary key,
    name varchar(100) not null,
    description text
);

create table users(
	user_id int auto_increment primary key,
    username varchar(255) not null unique,
    password varchar(255),
    email varchar(255) not null unique,
    first_name varchar(50),
    last_name varchar(50),
    phone varchar(10),
    avatar varchar(500),
    role enum ('ADMIN', 'RECRUITER', 'APPLICANT', 'MODERATOR'),
    provider enum ('LOCAL','GOOGLE'),
    provider_id varchar(255),
    created_at datetime default current_timestamp,
    is_active boolean default true
);

create table locations(
	location_id int auto_increment primary key,
    province varchar(50) not null,
    district varchar(50) not null,
    address varchar(100),
    notes text
);

create table admins(
	admin_id int primary key,
    foreign key (admin_id) references users(user_id) on delete cascade
);

create table moderators(
	moderator_id int auto_increment primary key,
    created_at datetime default current_timestamp,
    
    foreign key (moderator_id) references users(user_id)
);

create table recruiters (
    recruiter_id int primary key,
    company_name varchar(250) not null,
    bio text,
    company_website varchar(255),
    location_id int,
    position varchar(100),
    logo_url varchar(500),

	foreign key (location_id) references locations(location_id) on delete set null,
    foreign key (recruiter_id) references users(user_id) on delete cascade
);


create table applicants(
	applicant_id int primary key,
    dob date,
    gender enum ('MALE', 'FEMALE'),
    location_id int,
    experience_years int,
    skills text,
	job_title VARCHAR(100), 
    bio text,
    
    foreign key (location_id) references locations(location_id) on delete set null,
    foreign key (applicant_id) references users(user_id) on delete cascade
);

create table educations(
	education_id int auto_increment primary key,
    user_id int not null,
    title varchar(100) not null,
    level_id int,
    institution_id int,
    year year,
    
    foreign key (level_id) references levels(level_id) on delete set null,
    foreign key (institution_id) references institutions(institution_id) on delete set null,
    foreign key (user_id) references users(user_id) on delete cascade
);

create table jobs(
	job_id int auto_increment primary key,
    user_id int not null,
    title varchar(255) not null,
    description text,
    location_id int,
    level_id int,
    salary int,
    views_count int default 0,
    application_count int default 0,
    quantity INT NOT NULL DEFAULT 1,
    job_type_id int,
    industry_id int,
    created_at datetime default current_timestamp,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expired_at datetime,
    status enum ('PENDING','APPROVED','REJECTED') default 'PENDING',
    is_featured boolean default false,
    is_active boolean default true,
    moderator_id INT DEFAULT NULL,
    
    foreign key (location_id) references locations(location_id) on delete set null,
    foreign key (moderator_id) references users(user_id) on delete set null,
    foreign key (level_id) references levels(level_id) on delete set null,
    foreign key (industry_id) references job_industries(industry_id) on delete set null,
    foreign key (user_id) references users(user_id) on delete cascade,
    foreign key (job_type_id) references job_types(job_type_id) on delete set null
    
);

create table applications(
	application_id int auto_increment primary key,
    user_id int not null,
    job_id int not null,
    cv text,
    cover_letter text,
    applied_at datetime default current_timestamp,
    status enum('PENDING', 'ACCEPTED', 'REJECTED') default 'PENDING',
    interview_schedule_sent boolean default false,
    
    foreign key (user_id) references users(user_id) on delete cascade,
    foreign key (job_id) references jobs(job_id) on delete cascade,
    unique (user_id, job_id)
);

create table cvs(
	cv_id int auto_increment primary key,
    user_id int not null,
    title varchar(255),
    summary text,
    skills text,
    experience int,
    education_id int,
    certifications text,
    languages text,
    projects text,
    achievements text,
    cv_file varchar(255),
    created_date datetime,
    is_active boolean default true,
    
    foreign key (user_id) references users(user_id) on delete cascade,
    foreign key (education_id) references educations(education_id) on delete set null
);

create table favorite_jobs(
	favorite_job_id int auto_increment primary key,
    job_id int not null,
    user_id int not null,
    favorited_at datetime default current_timestamp,
    foreign key (job_id) references jobs(job_id) on delete cascade,
    foreign key (user_id) references users(user_id) on delete cascade
);

CREATE TABLE interviews (
    interview_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id int not null,
    scheduled_at DATETIME,
	location_id int,
    notes TEXT,
    status ENUM('SCHEDULED', 'DONE', 'CANCELLED'),
    
    foreign key (job_id) references jobs(job_id) on delete cascade,
    foreign key (location_id) references locations(location_id) on delete set null,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);




