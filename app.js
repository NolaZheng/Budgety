
//Budget

var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

        this.percentage = -1;
    };

    //add per
    Expense.prototype.calcPer = function(totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPer = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },

        totals: {
            exp: 0,
            inc: 0,
        },

        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            //create new item based on 'exp' or 'inc'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push to data structure
            data.allItems[type].push(newItem);

            //return new element
            return(newItem);
        },

        deleteItem: function(type, id) {
            var ids, index;

            //id = 6
            //data.allItems[type][id]
            //ids = [1 2 4 6 8]
            //index = 3

            ids = data.allItems[type].map(function (cur) {
                return cur.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },

        calculateBudget: function() {
            //calc total inc & exp
            calculateTotal('exp');
            calculateTotal('inc');

            //calc budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;

            //calc the percentage we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round (( data.totals.exp / data.totals.inc ) * 100) ;
            } else {
                data.percentage = -1;
            }
            
        },

        calculatePer: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPer(data.totals.inc);
            });
        },

        getPercentage: function() {
            var allPer = data.allItems.exp.map(function(cur) {
                return cur.getPer();
            });

            return allPer;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }

    }

})();



//UI

var UIController = (function() {

    //DOM UI class
    var DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPerLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var int, dec, numSplit, type;

        // + or -
        num = Math.abs(num);

        // 2 decimal points
        num = num.toFixed(2);//(小數點幾位)

        //comma seperate
        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];


        return (type === 'exp' ? '-' : '+' ) + ' ' + int;
        //加上小數點 + '.' + dec
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            //create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix"id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            };

            //Replace placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = ""
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber (obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber (obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber (obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentage: function(per) {
            var fields = document.querySelectorAll(DOMstrings.expensesPerLabel);

            nodeListForEach(fields, function(cur, index) {
                if (per[index] > 0) {
                cur.textContent = per[index] + '%';
                } else {
                   cur.textContent = '---'; 
                }
            });
        },

        displayMonth: function() {
            var now, year, month, months;
            now = new Date();

            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields,function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }
})();





//Global

var controller = (function(budgetCtrl,UICtrl) {

    var setupAddeventListener = function() {
        var DOMstrings_re = UICtrl.getDOMstrings();
        
        document.querySelector(DOMstrings_re.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress',function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOMstrings_re.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOMstrings_re.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // 1. Calc budget
        budgetCtrl.calculateBudget();

        // 2. Return budget
        var budget = budgetCtrl.getBudget();

        // 3. Display on UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentage = function() {

        // 1. calc per
        budgetCtrl.calculatePer();

        // 2. read from budget ctrl
        var perc = budgetCtrl.getPercentage();

        // 3. update UI
        UICtrl.displayPercentage(perc);
    };
    

    var ctrlAddItem = function() {
        var input,newItem;

        // 1. input data
        input = UICtrl.getInput();

        if ( input.description !== "" && !isNaN(input.value) && input.value > 0 ) { 

            // 2. add item to budget ctrl
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear fields
            UICtrl.clearFields();

            // 5. calc & display budget
            updateBudget();

            // 6. calc & update per
            updatePercentage();
        }
        
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt (splitID [1]);

            // 1. delet item from data
            budgetCtrl.deleteItem(type, ID);

            // 2. delet item from UI
            UICtrl.deleteListItem(itemID);

            // 3. update & show budget 
            updateBudget();

            // 4. calc & update per
            updatePercentage();
        }
    };

    return {
        init: function() {
            console.log('Start');            setupAddeventListener();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };

})(budgetController, UIController);

controller.init();