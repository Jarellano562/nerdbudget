// CREATING VARIABLE TO HOLD DB CONNECTION 
let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) { //EMIT IF THE DATABASE VERSION CHANGES 
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransaction(); //SENDING TO UPLOADTRANSACTION()
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) { //NEED TO SAVE WITH NO INTERNET 
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_transaction');
    budgetObjectStore.add(record); //RECORD TO YOUR STORE 
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_transaction');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function () { //DATA WILL SEND IT TO THE TRANSACTION API 
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const budgetObjectStore = transaction.objectStore('new_transaction');
                    budgetObjectStore.clear();

                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
};

window.addEventListener('online', uploadTransaction); //ADD LISTENER