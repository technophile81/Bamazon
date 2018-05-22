var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);

    start();
});

function start() {

    console.log("\nWelcome to your Bamazon management application. What would you like to do?");
    console.log("\n----------------------------------------------------------------\n");

    inquirer.prompt({

        name: "choice",
        type: "list",
        message: "\nWhat would you like to do?\n",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product",
            "Quit"
        ]
    }).then(function (answer) {
        switch (answer.choice) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory":
                viewLowInventory();
                break;

            case "Add to Inventory":
                addToInventory();
                break;

            case "Add New Product":
                addNewProduct();
                break;

            case "Quit":
                process.exit();
                break;
        }
    });
}

function viewProducts() {

    connection.query('SELECT * FROM Products', function (err, res) {
        if (err) throw err;
        console.log("\nOur current inventory: ");
        console.log("\n----------------------------------------------------------------\n");

        if (err) throw err;

        var table = new Table({
            head: ["ID", "Product Name", "Price", "Stock Numbers"],
            colWidths: [10, 30, 15, 20]
        });

        for (let item of res) {
            table.push(
                [item.item_id, item.product_name, item.price.toFixed(2), item.stock_quantity]
            );
        }
        console.log(table.toString());
        start();
    })
};

function viewLowInventory() {

    connection.query('SELECT * FROM Products', function (err, res) {
        if (err) throw err;
        console.log("\nWhat is currently low: ");
        console.log("\n----------------------------------------------------------------\n");

        if (err) throw err;

        var table = new Table({
            head: ["ID", "Product Name", "Price", "Stock Numbers"],
            colWidths: [10, 30, 15, 20]
        });
        var allWellStocked = true;
        for (let item of res) {
            if (item.stock_quantity <= 5) {
                table.push(
                    [item.item_id, item.product_name, item.price.toFixed(2), item.stock_quantity]
                );
                console.log(table.toString());
                allWellStocked = false;
            }
        };
        if (allWellStocked) {
            console.log("\nAll products are currently well-stocked.\n");
        }
        start();
    })

};

function addNewProduct() {
    connection.query('SELECT * FROM departments', function (err, res) {

        inquirer.prompt([
            {
                name: "product",
                type: "input",
                message: "What is the product name?"
            },
            {
                name: "department",
                type: "list",
                choices: function () {
                    var choiceArray = [];
                    for (let item of res) {
                        choiceArray.push(item.department_name);
                    }
                    return choiceArray;
                },
                message: "\nPlease select the department.\n",
            },
            {
                name: "price",
                type: "input",
                message: "How much does the product cost?"
            },
            {
                name: "quantity",
                type: "input",
                message: "How many units?",
                validate: function (value) {
                    return !isNaN(value);
                }
            }
        ])
            .then(function (value) {
                connection.query(
                    "INSERT INTO products SET ?",
                    {
                        product_name: value.product,
                        department_name: value.department,
                        price: parseFloat(value.price),
                        stock_quantity: parseInt(value.quantity)
                    },
                    function (err) {
                        if (err) throw err;
                        console.log("Your product was successfully added!");
                        start();
                    }
                );
            });
    })
}

function addToInventory() {

    connection.query('SELECT * FROM products', function (err, res) {

        inquirer.prompt([
            {
                name: "choice",
                type: "list",
                choices: function () {
                    var choiceArray = [];
                    for (let item of res) {
                        choiceArray.push(item.product_name);
                    }
                    return choiceArray;
                },
                message: "\nPlease select the product you would like to update.\n",
            },
            {
                name: "quantity",
                type: "input",
                message: "Enter how many units you would like to add.",
                validate: function (value) {
                    return !isNaN(value);
                }
            }
        ]).then(function (user) {
            // Get information for the selected item
            var chosenItem;
            console.log("You want to add " + user.quantity + " units of " + user.choice + ".");

            for (let item of res) {

                if (item.product_name === user.choice) {
                    chosenItem = item;
                    break;
                }
            }
            // Update inventory
            var newQuantity = chosenItem.stock_quantity + parseInt(user.quantity);
            connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: newQuantity
                    },
                    {
                        item_id: chosenItem.item_id
                    }
                ],
                function (err) {
                    if (err) throw err;
                    console.log("The inventory was updated! " + chosenItem.product_name + " now has " + newQuantity + " units.");
                    console.log("\n----------------------------------------------------------------\n");

                    start();
                }
            )
        })
    })
}

