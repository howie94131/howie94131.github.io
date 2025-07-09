// script.js

document.addEventListener('DOMContentLoaded', function() {
    const dataTable = document.getElementById('dataTable');
    const tableHeaders = document.getElementById('tableHeaders');
    const tableBody = document.getElementById('tableBody');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const apiUrl = 'https://ws.api.cnyes.com/ws/api/v2/universal/quote?column=C_FORMAT&type=TRMAIN';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadingDiv.style.display = 'none'; // Hide loading message

            if (data && data.data && Array.isArray(data.data)) {
                const items = data.data;

                if (items.length > 0) {
                    // Get all possible keys to form headers, ensuring 'name' is first if present
                    let allKeys = new Set();
                    items.forEach(item => {
                        Object.keys(item).forEach(key => allKeys.add(key));
                    });

                    let sortedKeys = Array.from(allKeys).sort((a, b) => {
                        if (a === 'name') return -1; // 'name' comes first
                        if (b === 'name') return 1;
                        return a.localeCompare(b);
                    });

                    // Create table headers
                    sortedKeys.forEach(key => {
                        const th = document.createElement('th');
                        th.textContent = key.replace(/_/g, ' ').toUpperCase(); // Make headers more readable
                        tableHeaders.appendChild(th);
                    });

                    // Populate table rows
                    items.forEach(item => {
                        const tr = document.createElement('tr');
                        sortedKeys.forEach(key => {
                            const td = document.createElement('td');
                            td.textContent = item[key] !== undefined ? item[key] : ''; // Handle missing keys
                            tr.appendChild(td);
                        });
                        tableBody.appendChild(tr);
                    });

                    dataTable.style.display = 'table'; // Show the table
                } else {
                    errorDiv.textContent = 'No data found in the response.';
                    errorDiv.style.display = 'block';
                }
            } else {
                errorDiv.textContent = 'Invalid data format received.';
                errorDiv.style.display = 'block';
            }
        })
        .catch(error => {
            loadingDiv.style.display = 'none'; // Hide loading message
            errorDiv.textContent = `Failed to fetch data: ${error.message}`;
            errorDiv.style.display = 'block';
            console.error('Error fetching data:', error);
        });
});
