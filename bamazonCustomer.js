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

    connection.query('SELECT * FROM Products', function (err, res) {
        if (err) throw err;
        console.log("Welcome to Bamazon, your ultimate shopping experience!");
        console.log("\n----------------------------------------------------------------\n");

        placeOrder();
    })
};

function placeOrder() {
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
                message: "\nPlease select the product you would like to buy.\n",
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like to buy?",
                validate: function (value) {
                    return !isNaN(value);

                }
            }
        ]).then(function (user) {
            // Get information for the selected item
            var chosenItem;
            console.log("You want to buy " + user.quantity + " of " + user.choice + ".");

            for (let item of res) {

                if (item.product_name === user.choice) {
                    chosenItem = item;
                    break;
                }
            }
            // Compare current inventory with the user's quantity
            if (chosenItem.stock_quantity < user.quantity) {
                console.log("Sorry, we only have " + chosenItem.stock_quantity + " left in stock.\nPlease enter another quantity.\n");
            } else {
                var userTotal = parseInt(user.quantity) * chosenItem.price;
                //var newQuantity = chosenItem.stock_quantity - parseInt(user.quantity);

                connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE ?",
                    [
                        parseInt(user.quantity),

                        {
                            item_id: chosenItem.item_id
                        }
                    ], function (err) {
                        if (err) throw err;
                        console.log("Purchase successful! Your total is: $" + userTotal.toFixed(2) + ".");
                        console.log("\n----------------------------------------------------------------\n");

                    }
                );
                connection.query("UPDATE products SET product_sales = product_sales + ? WHERE ?",
                [
                            userTotal,
                    {
                        item_id: chosenItem.item_id
                    }
                ], function (err) {
                    if (err) throw err;
                    //console.log("Product sales for this item updated to $" + productSalesTotal.toFixed(2) + ".");
                    //console.log("\n----------------------------------------------------------------\n");
                    console.log("\nThank you for shopping at Bamazon.\n");

                    whatNext();
                }
            );



              }
        });
    })
}

function whatNext() {
    inquirer.prompt([
        {
            name: "choice",
            type: "list",
            choices: ["BUY ANOTHER ITEM", "QUIT"],
            message: "\nWhat would you like to do next?\n"
        }
    ]).then(function (answer) {
        if (answer.choice.toUpperCase() === "BUY ANOTHER ITEM") {
            start();
        } else {
            console.log("\nHave a wonderful day!\n");
            process.exit();
        }
    }
    )
}