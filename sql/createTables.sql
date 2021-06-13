create schema authentication


create table authentication.passwords (
	id varchar(320) primary Key,
	password varchar(50),
	key varchar(100)
)

create table authentication.keys (
	key varchar(100),
	created timestamp default CURRENT_TIMESTAMP 
)


create table authentication.users (
	id UUID UNIQUE,
	first_name varchar(700),
	last_name varchar(600),
	username varchar(320) UNIQUE,
	email varchar(320) primary key,
	phone varchar(20),
	verified boolean default false,
	created_date timestamp default CURRENT_TIMESTAMP
)


create table authentication.user_verification (
	email varchar(320) UNIQUE,
	verification_code UUID primary key,
	created timestamp default CURRENT_TIMESTAMP
)

create table authentication.temporary_password (
	id varchar(320) primary Key,
	password varchar(15),
	created timestamp default CURRENT_TIMESTAMP
)







