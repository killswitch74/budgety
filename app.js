var budgetController = (function () {
    
    var Expenses = function(id, description, value, percentage) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = percentage;
    };
    
    var Incomes = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },    
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };
    
    var calcTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };
    
    Expenses.prototype.calcPercentage = function(totalsInc) {
        if(totalsInc > 0) {
            this.percentage = Math.round((this.value / totalsInc) * 100);
        }
        else { this.percentage = -1; }
    };
    
    Expenses.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    return {
        addItem: function (type, desc, val) {
            var ID, newItem;
            
            if(data.allItems[type].length > 0) {
                
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                //[0, 1, 2, 4] -> length = 4 -> (3rd element's ID = 4) + 1 -> add ID = 5 -> [0, 1, 2, 4, 5]
                
                //WRONG MENTHOD I USED -- > ID = (data.allItems[type].length - 1) + 1;
                // [0, 1, 2, 4] -> length = 4 -> add ID -> [0, 1, 2, 4, 4]
            }
            else { ID = 0; }
            
            if(type === 'exp')
                {
                    newItem = new Expenses(ID, desc, val)
                }
            else if(type === 'inc')
                {
                    newItem = new Incomes(ID, desc, val)
                }
            
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        calcBudget: function () {
            
            calcTotal('exp');
            calcTotal('inc');
            
            data.budget = data.totals.inc - data.totals.exp;
            
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);    
            }
            else { data.percentage = -1; }
            
        },
        
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percent: data.percentage
            }
        },
        
        deleteItem: function(type, id) {
            var index, ids;
            
            ids = data.allItems[type].map(function(current) {
               return current.id; 
            });
            //console.log(ids);
            //console.log(data.allItems[type][id]);
            
            index = ids.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calcAllPercentage: function() {
            
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        
        getAllPercentage: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },
        
        getData: function () {
            console.log(data);
        }
    };
    
}) ();




var UIController = (function () {
    
    var DOM = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    
    };
    
    var format = function (num, type) {
        var numSplit, int, dec;
        
        num = Math.abs(num);
        
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        
        int = Number(int);
        int = int.toLocaleString();
        
        /*
        if(int > 999)
            {
                if (int > 999999) {
                    int = int.substr(0, int.length - 6) + ',' + int.substr(int.length - 6, 3) + ',' + int.substr(int.length - 3, 3);
                }
                else {
                    int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
                }
            }
        else {  int = int;  }
        */
        
        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(array, callbackFn) {
        for(var i =0; i < array.length; i++) {
            callbackFn(array[i], i);
        }
    };
    
    return {
        getInput: function () {
            return { 
                type: document.querySelector(DOM.inputType).value,
                description: document.querySelector(DOM.inputDesc).value,
                value: parseFloat(document.querySelector(DOM.inputValue).value)
            };
        },
        
        addListItem: function(newItem, type) {
            var element, html, newHtml;  
            if(type === 'exp')
                  {   element = document.querySelector(DOM.expenseContainer);
                      html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';                   
                  }
            else if(type === 'inc')
                {   element = document.querySelector(DOM.incomeContainer);
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
            
            newHtml = html.replace('%id%', newItem.id);
            newHtml = newHtml.replace('%description%', newItem.description);
            newHtml = newHtml.replace('%value%', format(newItem.value, type));
            
            element.insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        delListItem: function(selectorID) {
            var x = document.getElementById(selectorID);
            x.parentNode.removeChild(x);
        },
        
        clearFields: function() {
            
            var fields = document.querySelectorAll(DOM.inputDesc + ', ' + DOM.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current) {
                current.value = '';
            });
            document.querySelector(DOM.inputType).focus();
                        
            // Can ALSO Be Done in SIMPLE way
            /*
            document.querySelector(DOM.inputDesc).value = '';
            document.querySelector(DOM.inputValue).value = '';
            document.querySelector(DOM.inputDesc).focus();
            */
        },
        
        displayPercentage: function (allPerc) {
            
            var fields = document.querySelectorAll(DOM.expPercLabel);
            
            // Alternate Method :-
            /*
            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index) {
                current.textContent = allPerc[index] + '%';
            });
            */           
            
            // Callback Function is in Public Domain of UICtrl.
            nodeListForEach(fields, function(current, index) {
                if(allPerc[index] > 0) {
                    current.textContent = allPerc[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayBudget: function(budget) {
            var type;
            budget.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOM.budgetLabel).textContent = format(budget.budget, type);
            document.querySelector(DOM.incomeLabel).textContent = format(budget.totalInc, 'inc');
            document.querySelector(DOM.expenseLabel).textContent = format(budget.totalExp, 'exp');
            
            if (budget.percent > 0) {
                    document.querySelector(DOM.percentageLabel).textContent = budget.percent + '%';
                }
            else { document.querySelector(DOM.percentageLabel).textContent = '---' }
        },
        
        displayDate: function () {
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOM.dateLabel).textContent = months[month] + ', ' + year;
        },
        
        changeType: function() {
            var fields = document.querySelectorAll(DOM.inputType + ',' + DOM.inputDesc + ',' + DOM.inputValue);
            
            var nodeListForEach2 = function (array, callbackFn) {
                for(var i = 0; i < array.length; i++) {
                    callbackFn(array[i], i);
                }      
            };
            
            nodeListForEach2(fields, function(current, index) {
                current.classList.toggle('red-focus');
            });
            
            document.querySelector(DOM.inputBtn).classList.toggle('red');
            
        },
        
        getDOM: function () {
            return DOM;
        }
    };
    
}) ();




var controller = (function (budgetCtrl, UICtrl) {
    
    var DOM = UICtrl.getDOM();
        
    var updateBudget = function () {
        
        budgetCtrl.calcBudget();
        
        var budget = budgetCtrl.getBudget();
        
        UICtrl.displayBudget(budget);
        
        //budgetCtrl.getData();
        
    };
    
    var ctrlAdd = function () {
        var input, newItem
        
        input = UICtrl.getInput();
        //console.log(input);
        
        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            UICtrl.addListItem(newItem, input.type);
            
            UICtrl.clearFields();
        
            updateBudget();
            
            updatePercentages();
        }
    };
    
    
    var ctrlDel = function (event) {
        var itemID, splitID, type, id;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        //console.log(itemID);
        if(itemID) {
            
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            //console.log(splitID);
            
            budgetCtrl.deleteItem(type, id);
            
            UICtrl.delListItem(itemID);
            
            updateBudget();
            
            updatePercentages();
        }
        
    };
    
    var updatePercentages = function() {
        budgetCtrl.calcAllPercentage();
        
        var allPerc = budgetCtrl.getAllPercentage();
        
        UICtrl.displayPercentage(allPerc);
    };
    
    
    var setupEventListeners = function () {
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAdd);

        document.addEventListener('keypress', function (event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAdd();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDel);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    
    };
        
    return {
        init: function () {
            setupEventListeners();
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalExp: 0,
                totalInc: 0,
                percent: -1
            });
            console.log("Application has started.")
        }
    };
    
}) (budgetController, UIController);

controller.init();