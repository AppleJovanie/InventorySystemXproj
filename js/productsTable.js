 // Function to fetch product data and update the table
 function fetchAndDisplayProducts() {
    fetch('http://localhost:3000/readProducts')
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const productTable = document.getElementById('productTable');
                const tbody = productTable.querySelector('tbody');

                // Clear existing rows
                tbody.innerHTML = '';

                // Populate the table with product data
                result.data.forEach(product => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.Product_Name}</td>
                        <td>${product.Variant}</td>
                        <td>${product.Quantity}</td>
                        <td>${product.Price}</td>
                        <td class="action-buttons">
                            ${isUserAuthenticated() ? 
                                `<button class="btn btn-sm btn-primary" onclick="updateProduct(${product.Product_ID})">Update</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.Product_ID})">Delete</button>`
                                : ''}
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                // After populating the table, show or hide buttons
                showButtons();
            } else {
                console.error('Error fetching product data:', result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to show or hide update and delete buttons based on authentication
function showButtons() {
    const updateButtons = document.querySelectorAll('.btn-primary');
    const deleteButtons = document.querySelectorAll('.btn-danger');

    if (!isNavigatedFromHomepage()) {
        // User is not navigating from the homepage, show/hide buttons based on authentication
        if (isUserAuthenticated()) {
            updateButtons.forEach(button => button.style.display = 'inline-block');
            deleteButtons.forEach(button => button.style.display = 'inline-block');
        } else {
            updateButtons.forEach(button => button.style.display = 'none');
            deleteButtons.forEach(button => button.style.display = 'none');
        }
    } else {
        // User is navigating from the homepage, hide buttons
        updateButtons.forEach(button => button.style.display = 'none');
        deleteButtons.forEach(button => button.style.display = 'none');
    }
}

// Function to check if the user is authenticated (replace with your actual authentication logic)
function isUserAuthenticated() {
    // You can implement your authentication logic here
    // For demonstration purposes, I'm using a simple condition
    return true;
}

// Function to check if the user is navigating from the homepage
function isNavigatedFromHomepage() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('fromHomepage') === 'true';
}

function updateProduct(productId) {
if (isUserAdmin()) {
const existingProduct = getProductById(productId);
const updatedProduct = promptForUpdatedData(existingProduct);

fetch('http://localhost:3000/updateProduct', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedProduct)
})
.then(response => response.json())
.then(result => {
    if (result.success) {
        fetchAndDisplayProducts();
        showAlert('Product update successfully','success')
    } else {
        console.error('Error updating product:', result.message);
        showAlert(`Error updating product: ${result.message}`, 'danger');
    }
    
})
.catch(error => {
    console.error('Error:', error);
    showAlert('Error updating product. Please try again later.', 'danger');
});
} else {
alert('You do not have permission to edit and update products.');
}
}
document.getElementById('searchInput').addEventListener('input', searchProducts);

function deleteProduct(productId) {
    // Check if the user is authenticated as an admin
    if (isUserAdmin()) {
        // Confirm deletion with the user
        const confirmDelete = confirm('Are you sure you want to delete this product?');

        if (confirmDelete) {
            // Call the delete API or stored procedure with the product ID
            fetch('http://localhost:3000/deleteProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ Product_ID: productId })
            })
            .then(response => response.json())
          .then(result => {
    console.log(result);  // Log the entire result object
    if (result.success) {
        removeTableRow(productId);
        showAlert('Product deleted successfully!', 'success');
    } else {
        console.error('Error deleting product:', result.message);
        showAlert(`Error deleting product: ${result.message}`, 'danger');
    }
})
            .catch(error => {
                console.error('Error:', error);
                // Show error alert
                showAlert('Error deleting product. Please try again later.', 'danger');
            });
        }
    } else {
        alert('You do not have permission to delete products.');
    }
}
function isUserAdmin() {
    
    return true;
}

// Function to get the existing data for a product by ID (replace with your actual logic to fetch product data)
function getProductById(productId) {
  
    return {
        Product_ID: productId,
        Product_Name: 'Existing Product',
        Variant: 'Existing Variant',
        Quantity: 10,
        Price: 20.50
    };
}

// Function to remove a table row based on the product ID
function removeTableRow(productId) {
const table = document.getElementById('productTable');
const tbody = table.querySelector('tbody');

// Find and remove the row with the specified product ID
const rowToRemove = tbody.querySelector(`tr[data-product-id="${productId}"]`);
if (rowToRemove) {
rowToRemove.remove();
}
}
// Function to prompt the admin for updated data

function promptForUpdatedData(existingProduct) {
    // Replace this with your logic to prompt the admin for updated data
    // For demonstration purposes, I'm using a prompt, but you might want to use a form or a modal
    const updatedProduct = {
        Product_ID: existingProduct.Product_ID,
        Product_Name: prompt('Enter updated product name', existingProduct.Product_Name),
        Variant: prompt('Enter updated variant', existingProduct.Variant),
        Quantity: parseInt(prompt('Enter updated quantity', existingProduct.Quantity), 10),
        Price: parseFloat(prompt('Enter updated price', existingProduct.Price))
    };

    return updatedProduct;
}

// Fetch and display products when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayProducts();
});
// Searching Products
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();

    // Get all table rows
    const rows = document.querySelectorAll('#productTable tbody tr');

    // Loop through rows and hide/show based on the search term
    rows.forEach(row => {
        const productName = row.querySelector('td:first-child').textContent.toLowerCase();

        if (productName.includes(searchTerm)) {
            row.style.display = '';  // Show the row
        } else {
            row.style.display = 'none';  // Hide the row
        }
    });
}

function showAlert(message, alertType) {
const alertsContainer = document.getElementById('alerts-container');

// Create alert div
const alertDiv = document.createElement('div');
alertDiv.className = `alert alert-${alertType} alert-dismissible fade show`;
alertDiv.role = 'alert';
alertDiv.innerHTML = `
    ${message}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>
`;
alertsContainer.appendChild(alertDiv);

// Automatically close the alert after 3 seconds (adjust as needed)
setTimeout(() => {
    alertsContainer.removeChild(alertDiv);
}, 3000);
}

