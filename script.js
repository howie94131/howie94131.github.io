// script.js
function unixConvert(timestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString();
}
document.addEventListener('DOMContentLoaded', function() {
    const dataTable = document.getElementById('dataTable');
    const tableHeaders = document.getElementById('tableHeaders');
    const tableBody = document.getElementById('tableBody');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const apiUrl = 'https://ws.api.cnyes.com/ws/api/v2/universal/quote?column=C_FORMAT&type=TRMAIN';

    // List of keys to EXCLUDE from the table display
    const excludedKeys = new Set([
        "0",        // Symbol
        "200013",
        "200038",   // Change (raw value) - based on your previous output, "Change" usually means 200038
        "200039",
        "200041",
        "200042",   // Low
        "200043",   // High
        "200067",
        "200232",
        "800002",
        "800041"
    ]);


    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadingDiv.style.display = 'none'; // Hide loading message

            if (data && data.data && Array.isArray(data.data.items)) {
                const items = data.data.items;

                if (items.length > 0) {
                    // Get all possible keys and filter out the excluded ones
                    let allKeys = new Set();
                    items.forEach(item => {
                        Object.keys(item).forEach(key => {
                            if (!excludedKeys.has(key)) { // Only add if not in excluded list
                                allKeys.add(key);
                            }
                        });
                    });

                    // Define readable names for the remaining keys
                    const readableNames = {
                        "200009": "中文",
                        "200024": "英文",
                        "200026": "當前價",
                        "200040": "變動 (%)",
                        "200045": "漲跌",
                        "200007": "時間",
                        // Add more mappings as you identify what each number represents
                    };

                    // Sort keys for consistent column order
                    let sortedKeys = Array.from(allKeys).sort((a, b) => {
                        // Prioritize specific display order if desired, otherwise alphabetical
                        const order = ["200024", "200009", "200026", "200040", "200045", "200007"]; // Example desired order for displayed columns
                        const indexA = order.indexOf(a);
                        const indexB = order.indexOf(b);

                        if (indexA !== -1 && indexB !== -1) {
                            return indexA - indexB;
                        }
                        if (indexA !== -1) return -1;
                        if (indexB !== -1) return 1;

                        return a.localeCompare(b);
                    });

                    // Create table headers based on sorted and filtered keys
                    sortedKeys.forEach(key => {
                        const th = document.createElement('th');
                        th.textContent = readableNames[key] || key; // Use readable name or the key itself
                        tableHeaders.appendChild(th);
                    });

                    // Populate table rows, ensuring only allowed keys are used
                    items.forEach(item => {
                        const tr = document.createElement('tr');
                        sortedKeys.forEach(key => { // Iterate over sortedKeys (which are already filtered)
                            const td = document.createElement('td');
                            if (key == 200007) {
                                td.textContent = item[key] !== undefined && item[key] !== null ? unixConvert(item[key]) : '';
                            } else {
                                td.textContent = item[key] !== undefined && item[key] !== null ? item[key] : '';
                            }
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
