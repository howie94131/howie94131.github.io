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

            // --- IMPORTANT CHANGE HERE ---
            // The items array is now located at data.data.items
            if (data && data.data && Array.isArray(data.data.items)) {
                const items = data.data.items; // <--- Changed from data.data to data.data.items
            // --- END IMPORTANT CHANGE ---

                if (items.length > 0) {
                    // Get all possible keys to form headers
                    let allKeys = new Set();
                    items.forEach(item => {
                        Object.keys(item).forEach(key => allKeys.add(key));
                    });

                    // Sort keys. You mentioned 'name' was important, but based on your JSON,
                    // the name is under key "200009" (Chinese) and "200024" (English).
                    // Let's prioritize "200024" (English name) and "200009" (Chinese name)
                    // and then the default "0" (ID/Symbol).
                    let sortedKeys = Array.from(allKeys).sort((a, b) => {
                        const order = ["0", "200024", "200009"]; // Desired display order for these specific keys
                        const indexA = order.indexOf(a);
                        const indexB = order.indexOf(b);

                        if (indexA !== -1 && indexB !== -1) {
                            return indexA - indexB;
                        }
                        if (indexA !== -1) return -1; // Keep 'a' at the front if it's in our special order
                        if (indexB !== -1) return 1;  // Keep 'b' at the front if it's in our special order

                        return a.localeCompare(b); // Default alphabetical sort for others
                    });

                    // Create table headers
                    sortedKeys.forEach(key => {
                        const th = document.createElement('th');
                        // You can map these numeric keys to more readable names if desired
                        const readableNames = {
                            "0": "Symbol",
                            "200009": "Name (Chinese)",
                            "200024": "Name (English)",
                            "200026": "Last Price",
                            "200040": "Change (%)",
                            "200038": "Change",
                            "200045": "Open",
                            "200043": "High",
                            "200042": "Low",
                            "200007": "Timestamp",
                            // Add more mappings as you identify what each number represents
                        };
                        th.textContent = readableNames[key] || key; // Use readable name or the key itself
                        tableHeaders.appendChild(th);
                    });

                    // Populate table rows
                    items.forEach(item => {
                        const tr = document.createElement('tr');
                        sortedKeys.forEach(key => {
                            const td = document.createElement('td');
                            td.textContent = item[key] !== undefined && item[key] !== null ? item[key] : ''; // Handle null values
                            tr.appendChild(td);
                        });
                        tableBody.appendChild(tr);
                    });

                    dataTable.style.display = 'table'; // Show the table
                } else {
                    errorDiv.textContent = 'No items found in the response data.';
                    errorDiv.style.display = 'block';
                }
            } else {
                errorDiv.textContent = 'Invalid data format received: Expected data.data.items array.';
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
