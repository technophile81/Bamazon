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

    console.log("\nWelcome to your Bamazon supervisor application. What would you like to do?");
    console.log("\n----------------------------------------------------------------\n");
    inquirer.prompt([
        {
            name: "choice",
            type: "list",
            choices: ["VIEW PRODUCT SALES BY DEPARTMENT", "CREATE NEW DEPARTMENT", "QUIT"],
            message: "\nWhat would you like to do?\n"
        }
    ]).then(function (answer) {
        if (answer.choice.toUpperCase() === "VIEW PRODUCT SALES BY DEPARTMENT") {
            viewProductSalesByDept();
        } else if (answer.choice.toUpperCase() === "CREATE NEW DEPARTMENT") {
            createNewDept();
        } else if (answer.choice.toUpperCase() === "QUIT") {
        process.exit(); 
    }
    })
}

function viewProductSalesByDept () {

//var query = "SELECT *, (product_sales - over_head_costs) AS total_profit FROM departments INNER JOIN products ON products.department_name = departments.department_name;";
var query = "SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS total_product_sales, (SUM(products.product_sales) - departments.over_head_costs) AS total_profit FROM departments INNER JOIN products ON products.department_name = departments.department_name GROUP BY departments.department_name ORDER BY departments.department_id ASC;";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("\nOur Department Sales: ");
        console.log("\n----------------------------------------------------------------\n");

        if (err) throw err;

        var table = new Table({
            head: ["Dept ID", "Dept Name", "Overhead Costs", "Product Sales", "Total Profit"],
            colWidths: [10, 26, 20, 18, 18]
        });


        for (let item of res) {

            table.push(
                [item.department_id, item.department_name, item.over_head_costs.toFixed(2), item.total_product_sales.toFixed(2), item.total_profit.toFixed(2)]
            );
        }
        console.log(table.toString());
        start();
    })

}

function createNewDept() {

    inquirer.prompt([
        {
            name: "departmentName",
            type: "input",
            message: "What is the department name?"
        },
        {
            name: "overheadCosts",
            type: "input",
            message: "What are the overhead costs for this department?",
            validate: function (value) {
                return !isNaN(value);
            }
        }
    ])
        .then(function (value) {
            connection.query(
                "INSERT INTO departments SET ?",
                {
                    department_name: value.departmentName,
                    over_head_costs: parseFloat(value.overheadCosts)
                },
                function (err) {
                    if (err) throw err;
                    console.log("\nYour department was successfully added!\n");
                    start();
                }
            );
        });


}


