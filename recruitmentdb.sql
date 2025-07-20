CREATE DATABASE IF NOT EXISTS recruitmentdb;
USE recruitmentdb;

create table job_types(
	job_type_id int auto_increment primary key,
    name varchar(50)
);

create table educations(
	education_id int auto_increment primary key,
    name varchar(50)
);

create table job_industries(
	industry_id int auto_increment primary key,
    name varchar(100) not null
);

create table users(
	user_id int auto_increment primary key,
    username varchar(255) not null unique,
    password varchar(255) not null,
    email varchar(255) not null unique,
    first_name varchar(50),
    last_name varchar(50),
    phone varchar(10),
    avatar varchar(500),
    role enum ('ADMIN', 'RECRUITER', 'APPLICANT'),
    created_at datetime default current_timestamp,
    is_active boolean default true
);

create table admins(
	admin_id int primary key,
    foreign key (admin_id) references users(user_id) on delete cascade
);

create table recruiters(
	recruiter_id int primary key,
    company_name varchar(250),
    bio text,
    
    foreign key (recruiter_id) references users(user_id) on delete cascade
);

create table applicants(
	applicant_id int primary key,
    dob date,
    gender enum ('MALE', 'FEMALE'),
    address varchar(255),
    experience_years int,
    skills text,
    education_id int,
    bio text,
    
    foreign key (education_id) references educations(education_id) on delete set null,
    foreign key (applicant_id) references users(user_id) on delete cascade
);

create table jobs(
	job_id int auto_increment primary key,
    recruiter_id int not null,
    title varchar(255) not null,
    description text,
    location varchar(255),
    salary int,
    views_count int default 0,
    application_count int default 0,
    job_type_id int,
    industry_id int,
    created_at datetime default current_timestamp,
    expired_at datetime,
    is_featured boolean default false,
    is_active boolean default true,
    
    foreign key (industry_id) references job_industries(industry_id) on delete set null,
    foreign key (recruiter_id) references recruiters(recruiter_id) on delete cascade,
    foreign key (job_type_id) references job_types(job_type_id) on delete set null
    
);

create table applications(
	application_id int auto_increment primary key,
    applicant_id int not null,
    job_id int not null,
    applied_at datetime default current_timestamp,
    status enum('PENDING', 'ACCEPTED', 'REJECTED') default 'PENDING',
    
    foreign key (applicant_id) references applicants(applicant_id) on delete cascade,
    foreign key (job_id) references jobs(job_id) on delete cascade,
    unique (applicant_id, job_id)
);

create table cvs(
	cv_id int auto_increment primary key,
    applicant_id int not null,
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
    
    foreign key (applicant_id) references applicants(applicant_id) on delete cascade,
    foreign key (education_id) references educations(education_id) on delete set null
)