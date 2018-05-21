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
                    if (isNaN(value)) {
                        return false;
                    } else {
                        return true;
                    }
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
                var userTotal = user.quantity * chosenItem.price;
                var newQuantity = chosenItem.stock_quantity - user.quantity;
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
                        console.log("Purchase successful! Your total is: $" + userTotal + ".");
                        console.log("\n----------------------------------------------------------------\n");
                        console.log("Thank you for shopping at Bamazon.\n");

                        whatNext();
                    }
                );

            }

        });

    })
}

function whatNext () {
    inquirer.prompt([
        {
            name: "choice",
            type: "list",
            choices: ["BUY ANOTHER ITEM", "QUIT"],
            message: "\nWhat would you like to do next?\n"
        }
    ]).then( function (answer) {
       if (answer.choice.toUpperCase() === "BUY ANOTHER ITEM") {
           start();
       } else {
           console.log("Have a wonderful day!");
           process.exit();
       }
    }
)
}