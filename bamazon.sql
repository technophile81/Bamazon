DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(50) NULL,
  department_name VARCHAR(50) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  product_sales INT default 0,
  PRIMARY KEY (item_id)
);

CREATE TABLE departments (
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(50) NULL,
    over_head_costs INT default 0,
)

INSERT INTO products (product_name, department_name, price, quantity)
VALUES ("generic plunger", "home improvement", 2.50, 100),
("Nintendo Labo Kit", "video games", 70.00, 200),
("Black Panther", "movies", 24.00, 500),
("Sunjoy Wicker Seating Set", "patio & garden", 540.00, 10),
("Weekender Gel Pillow", "home & kitchen", 30.00, 60),
("Tylenol Pain Reliever", "health", 8.00, 850),
("Cala Makeup Sponges", "home & kitchen", 3.00, 1200),
("Anker USB Charger", "car accessories", 3.00, 300),
("Detective Pikachu", "video games", 39.00, 1500),
("The Hate U Give", "books", 12.00, 800);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("home improvement", 10000),
("video games", 30000),
("movies", 24000),
("patio & garden", 40000),
("home & kitchen", 70050),
("health", 5000),
("car accessories", 120000),
("books", 3000)