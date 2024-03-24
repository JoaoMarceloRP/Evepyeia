create database if not exists evepyeiadb;

use evepyeiadb;

create table if not exists usuarios (
    id int auto_increment primary key,
    nome varchar(255) not null,
    senha varchar(255) not null,
    email varchar(255) not null,
    endereco varchar(255) not null,
    cpf varchar(14) not null
);