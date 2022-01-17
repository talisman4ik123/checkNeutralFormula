const PROPOSITIONAL_LETTERS = 'QWERTYUIOPASDFGHJKLZXCVBNM';
const symbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '0'];
const operations = ['~', '->', '|', '&', '!'];
const constants = ['1', '0'];
let formula;
let table;
let variables;
let subFormulas;

function run() {
    console.log('\\/ и \/\\');
    if (start()) {
        alert('Формула является нейтральной!');
    } else {
        alert('Формула не является нейтральной!');
    }
}

function findInArray(array, temp) {
    for (var index = 0; index < array.length; index++) {
        if (array[index].toString() == temp.toString()) {
            return true;
        }
    }
    return false;
}

function getSubFormula(memory, priority) {
    var open = 0;
    var close = 0;
    var subFormula = '';

    for (var index = memory; index < formula.length; index++) {
        subFormula += formula[index];
        if (formula[index] == '(') {
            open++;
        }

        if (formula[index] == ')') {
            close++;
        }

        if (open == close) {
            if (findInArray(subFormulas, subFormula) == false) {
                var temp = [];
                temp.push(priority);
                temp.push(subFormula);
                subFormulas.push(temp);
            }
            return;
        }
    }
}

function findSubformulas() {
    var numOfOpen = 0;
    for (var index = 0; index < formula.length; index++) {
        if (formula[index] == '(') {
            numOfOpen++;
            getSubFormula(index, numOfOpen);
        }

        else if (formula[index] == ')') {
            numOfOpen--;
        }

        else if ((findInArray(symbols, formula[index]) || findInArray(constants, formula[index])) && !findInArray(variables, formula[index])) {
            variables.push(formula[index]);
        }
    }
}

function changeConstant(constant) {
    if (constant == 0) {
        return 1;
    }
    else {
        return 0;
    }
}

function calculateNumberOfVars() {
    let number = 0;
    for (let indexI = 0; indexI < variables.length; indexI++) {
        if (!findInArray(constants, variables[indexI])) {
            number++;
        }
    }
    return number;
}

function createTable() {
    let number = calculateNumberOfVars() - 1;
    let numberOfValues = number + 1;
    for (let indexI = variables.length - 1; indexI >= 0; indexI--) {
        let row = [];
        if (!findInArray(constants, variables[indexI])) {
            let changeConst = Math.pow(2, number);    //чередование 0 и 1 в ТИ 
            let constant = 0;
            for (let indexJ = 0; indexJ < Math.pow(2, numberOfValues); indexJ++) {
                row.push(constant);
                if ((indexJ + 1) % changeConst == 0) {
                    constant = changeConstant(constant);
                }
            }
            number--;
        } else {
            let constant;
            if (variables[indexI] == '1') {
                constant = 1;
            } else if (variables[indexI] == '0') {
                constant = 0;
            }

            for (let indexJ = 0; indexJ < Math.pow(2, numberOfValues); indexJ++) {
                row.push(constant);
            }
        }

        let field = [];
        field.push(variables[indexI]);
        field.push(row);
        table.push(field);
    }
}

function findIndexOfOperation(sub) {
    var open = 0;
    var close = 0;
    for (var index = 0; index < sub.length; index++) {
        if (open - close == 1) {
            if (findInArray(operations, sub[index])) {
                return index;
            }

            else if ((sub[index] == '-' && sub[index + 1] == ">") || (sub[index] == '/' && sub[index + 1] == "\\") || (sub[index] == '\\' && sub[index + 1] == "/")) {
                return index;
            }
        }

        if (sub[index] == "(") {
            open++;
        }

        if (sub[index] == ")") {
            close++;
        }
    }
}

function findCol(variable) {
    for (var index = 0; index < table.length; index++) {
        if (table[index][0] == variable) {
            return table[index][1];
        }

    }
}

function findLeftPart(sub, indexOfOperation) {
    let leftPart = "";
    for (let index = 1; index < indexOfOperation; index++) {
        leftPart += sub[index];
    }
    return leftPart;
}

function findRightPart(sub, indexOfOperation) {
    let begin = indexOfOperation + 1;
    let rightPart = "";
    if (sub[indexOfOperation] == "-" || sub[indexOfOperation] == '/' || sub[indexOfOperation] == '\\') {
        begin++;
    }

    for (let index = begin; index < sub.length - 1; index++) {
        rightPart += sub[index];
    }

    return rightPart;
}

function mainCalculations() {
    for (let index = subFormulas.length - 1; index >= 0; index--) {
        let indexOfOperation = findIndexOfOperation(subFormulas[index][1]);
        let operation = subFormulas[index][1][indexOfOperation];

        if (operation == "-" && subFormulas[index][1][indexOfOperation + 1] == ">") {
            operation += ">";
        } else if (operation == "/" && subFormulas[index][1][indexOfOperation + 1] == "\\") {
            operation += '\\';
        } else if (operation == "\\" && subFormulas[index][1][indexOfOperation + 1] == "/") {
            operation += '/';
        }

        let row = [];
        if (operation == "!") {
            let variable = findRightPart(subFormulas[index][1], indexOfOperation);
            let col = findCol(variable);
            for (let indexJ = 0; indexJ < col.length; indexJ++) {
                let value = changeConstant(col[indexJ]);
                row.push(value);
            }
            let field = [];
            field.push(subFormulas[index][1]);
            field.push(row);
            table.push(field);
        } else {
            let leftPart = findLeftPart(subFormulas[index][1], indexOfOperation);
            let rightPart = findRightPart(subFormulas[index][1], indexOfOperation);
            let colForLeftPart = findCol(leftPart);
            let colForRightPart = findCol(rightPart);
            let newCol = [];
            if (operation == "/\\") {
                for (let indexI = 0; indexI < colForLeftPart.length; indexI++) {
                    if (colForLeftPart[indexI] == 1 && colForRightPart[indexI] == 1) {
                        newCol.push(1);
                    }
                    else {
                        newCol.push(0);
                    }
                }
            } else if (operation == "\\/") {
                for (let indexI = 0; indexI < colForLeftPart.length; indexI++) {
                    if (colForLeftPart[indexI] == 0 && colForRightPart[indexI] == 0) {
                        newCol.push(0);
                    }
                    else {
                        newCol.push(1);
                    }
                }
            } else if (operation == "~") {
                for (let indexI = 0; indexI < colForLeftPart.length; indexI++) {
                    if ((colForLeftPart[indexI] == 0 && colForRightPart[indexI] == 0) || (colForLeftPart[indexI] == 1 && colForRightPart[indexI] == 1)) {
                        newCol.push(1);
                    }
                    else {
                        newCol.push(0);
                    }
                }
            } else if (operation == "->") {
                for (let indexI = 0; indexI < colForLeftPart.length; indexI++) {
                    if ((colForLeftPart[indexI] == 0 && colForRightPart[indexI] == 0) || (colForLeftPart[indexI] == 0 && colForRightPart[indexI] == 1) || (colForLeftPart[indexI] == 1 && colForRightPart[indexI] == 1)) {
                        newCol.push(1);
                    }
                    else {
                        newCol.push(0);
                    }
                }
            }
            var newField = [];
            newField.push(subFormulas[index][1]);
            newField.push(newCol);
            table.push(newField);
        }
    }
}

function getArrayWithLiteral(input) {
    let arrayWithLiteral = [];
    for (let index = 0; index < formula.length; index++) {
        let str = formula[index];
        if (PROPOSITIONAL_LETTERS.includes(str) !== null && !arrayWithLiteral.includes(str)) {
            arrayWithLiteral.push(str);
        }
    }
    return arrayWithLiteral;
}

function renderTable(input, table, subFormulas) {
    let arrayWithLiteral = getArrayWithLiteral(input.value);
    let tr = "<tr>";
    let innerHTML = "<thead>";
    innerHTML += "</thead>";
    innerHTML += "<tbody>";
    innerHTML += tr;
    for (let i = 0; i < table.length; i++) {
        let row = table[i];
        let rowTr = "<tr>";
        for (var index = 0; index < row.length; index++) {
            let val = row[index];
            rowTr += "<td>" + val + "</td>";
        }
        rowTr += "</tr>";
        innerHTML += rowTr;
    }
    innerHTML += "</tbody>";
    document.getElementById("table").innerHTML = innerHTML;
}
function isNeitral() {
    let isFalse = false;
    let isTrue = false;
    let lastCol = table.length - 1;
    for (let index = 0; index < table[lastCol][1].length; index++) {
        if (table[lastCol][1][index] == 0) {
            isFalse = true;
        }
        if (table[lastCol][1][index] == 1) {
            isTrue = true;
        }
    }
    return (isTrue && isFalse);
}

function start() {
    let input = document.getElementById("formula").value;
    subFormulas = [];
    variables = [];
    table = [];
    if (input == "" || input.Empty) {
        return false;
    }

    if (checkWithRegularExpressionFormula(input)) {

        formula = input;

        findSubformulas();
        createTable();
        mainCalculations();

        if (isNeitral()) {
            renderTable(input, table, subFormulas);
            return true;
        }

        renderTable(input, table, subFormulas);

    } else {
        return false;
    }

}

function checkWithRegularExpressionFormula(formula) {
    let form = formula;

    if (form.length == 1 && (PROPOSITIONAL_LETTERS.includes(form) || form == 1 || form == 0)) {
        return true;
    } else {
        while (true) {
            let initLength = form.length;
            for (let i = 0; i < initLength; i++) {
                if (form[i] === '(' && (PROPOSITIONAL_LETTERS.includes(form[i + 1]) || form[i + 1] == 1 || form[i + 1] == 0) && ((form[i + 2] === '\\' && form[i + 3] === '\/') || (form[i + 2] === '\/' && form[i + 3] === '\\')) && (PROPOSITIONAL_LETTERS.includes(form[i + 4]) || form[i + 4] == 1 || form[i + 4] == 0) && form[i + 5] === ')') {
                    let temp = form.replace(i, i + 5);
                    form = form.replace(temp, '1');
                } else if (form[i] === '(' && form[i + 1] === '!' && (PROPOSITIONAL_LETTERS.includes(form[i + 2]) || form[i + 2] == 1 || form[i + 2] == 0) && form[i + 3] === ')') {
                    let temp = form.replace(i, i + 4);
                    form = form.replace(temp, '1');
                } else if (PROPOSITIONAL_LETTERS.includes(form[i]) || form[i] == 0 || form[i] == 1) {
                    let temp = form.replace(i, i + 1);
                    form = form.replace(temp, '1');
                }
            }

            if (form.length === initLength) {
                break;
            }
        }
        if ((form.length === 1) && (form == 1)) {
            return true;
        } else {
            return false;
        }
    }
} 