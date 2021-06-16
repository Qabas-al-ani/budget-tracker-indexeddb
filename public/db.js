let db; // file global scope variable
// create a new db request for a "BudgetDB" database.
const request = indexedDB.open('budgetDB', 1);

request.onupgradeneeded = function (event) {
  // create object store called "BudgetStore" and set autoIncrement to true
  db = event.target.result;

  db.createObjectStore('transactions', { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.error); //?
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(['transactions'], 'readwrite');

  // access your pending object store
  const transactionStore = transaction.objectStore('transactions');

  // add record to your store with add method.
  transactionStore.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(['transactions'], 'readwrite');

  // access your pending object store
  const transactionStore = transaction.objectStore('transactions');

  // get all records from store and set to a variable
  const getAll = transactionStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(['transactions'], 'readwrite');

          // access your pending object store
          const transactionStore = transaction.objectStore('transactions');

          // clear all items in your store
          transactionStore.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
