
document.addEventListener('DOMContentLoaded', function () {
    const orderLinesForm = document.getElementById('orderLinesForm');
    const orderLinesContainer = orderLinesForm.querySelector('.form-row');
    const addProductButton = document.getElementById('addProductRow');

    const vatOption = document.querySelector('.vatOption');
    const totalFields = document.querySelectorAll('.total');
    const totalAmountElement = document.getElementById('totalAmount'); // Get the total amount element

    

    vatOption.addEventListener('change', function () {
        calculateTotalAmount(); // Recalculate total amount when VAT option changes
    });



    const persistentTextArea = document.getElementById('persistentTextArea');
    const storedValue = localStorage.getItem('persistentTextAreaValue');
        if (storedValue) {
        persistentTextArea.value = storedValue;
        }

    persistentTextArea.addEventListener('input', function () {
    localStorage.setItem('persistentTextAreaValue', persistentTextArea.value);
    adjustTextAreaHeight(persistentTextArea); // Adjust the height of the text area
    });

    // Adjust the height of the text area initially
    adjustTextAreaHeight(persistentTextArea);

    function adjustTextAreaHeight(textarea) {
        textarea.style.height = ''; // Reset the height to auto
        textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to fit the content
    }

    function addNewProductRow() {
    const orderLinesContainer = document.getElementById('orderLinesContainer');

    if (orderLinesContainer.firstElementChild) {
     const newRow = orderLinesContainer.firstElementChild.cloneNode(true);

    newRow.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        input.value = '';
        input.removeAttribute('readonly');
    });

    // Check if VAT option is selected
    if (vatOption.value === 'vat') {
        // Apply VAT (12%) to the total amount
        totalAmount *= 1.12; // 1 + 0.12 (VAT rate)
        vatIndicator = 'VAT Applied';
    } else {
        vatIndicator = 'VAT Not Applied';
    }


    
    const totalField = newRow.querySelector('.total');
    if (totalField) {
        totalField.value = '';
        totalField.removeAttribute('readonly');
    }

    const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.classList.add('btn', 'btn-danger', 'deleteRow');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function () {
            orderLinesContainer.removeChild(newRow);
            calculateTotalAmount(); // Recalculate total amount when a row is deleted
        });

    newRow.appendChild(deleteButton);

    orderLinesContainer.appendChild(newRow);

    newRow.addEventListener('input', function (event) {
        if (event.target.type === 'number') {
            calculateTotal(newRow);
            calculateTotalAmount(); // Recalculate total amount when any input changes
        }
    });
}
}

addProductButton.addEventListener('click', addNewProductRow);

orderLinesContainer.addEventListener('input', function (event) {
    if (event.target.type === 'number') {
        calculateTotal(event.target.closest('.form-row'));
        calculateTotalAmount(); // Recalculate total amount when any input changes
    }
});


function calculateTotal(row) {

    
var quantity = parseFloat(row.querySelector('.quantity').value) || 0;
var unitPrice = parseFloat(row.querySelector('.unitPrice').value) || 0;
var discountPercentage = parseFloat(row.querySelector('.discountPercentage').value) || 0;


var totalWithoutDiscount = quantity * unitPrice;
var discountAmount = (discountPercentage / 100) * totalWithoutDiscount;
var totalWithDiscount = totalWithoutDiscount - discountAmount;



row.querySelector('.total').value = totalWithDiscount.toFixed(2);
}

function calculateTotalAmount() {

    const vatIndicatorElement = document.createElement('span');
    vatIndicatorElement.style.textTransform = 'uppercase'; // Make text uppercase
    vatIndicatorElement.style.marginLeft = '10px'; // Add some space
    vatIndicatorElement.textContent = vatOption.value === 'vat' ? 'VAT Applied' : 'VAT Not Applied';

    // Clear any existing VAT indicator
    totalAmountElement.innerHTML = '';
   
    totalAmountElement.appendChild(vatIndicatorElement);
    
const totalFields = document.querySelectorAll('.total');
let totalAmount = 0;
totalFields.forEach(field => {
totalAmount += parseFloat(field.value) || 0;
});

if (vatOption.value === 'vat') {
    // Apply VAT (12%) to the total amount
    totalAmount *= 1.12; // 1 + 0.12 (VAT rate)
}


// Format the total amount with PHP currency formatting
const formattedTotalAmount = 'PHP ' + totalAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

// Display the formatted total amount below the order lines
document.getElementById('totalAmount').textContent = formattedTotalAmount;
}
});