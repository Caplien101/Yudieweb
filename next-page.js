document.addEventListener("DOMContentLoaded", () => {
    // Select elements
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    // Check if elements exist
    if (hamburger && navLinks) {
        // Toggle active class on hamburger and navLinks when hamburger is clicked
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from propagating to the document
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });

        // Smooth scroll for navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default anchor behavior

                // Remove active classes after navigation
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');

                // Add smooth scroll logic here if needed
                const targetId = item.textContent.toLowerCase().trim();
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    } else {
        console.error("Hamburger or navLinks element not found in the DOM.");
    }
});

// Global variable to track all cards data
let allCardsData = [];

// Function to load data from local storage on page load
function loadDataFromLocalStorage() {
    const storedData = localStorage.getItem("cardData");
    if (storedData) {
        try {
            allCardsData = JSON.parse(storedData);
            console.log("Data loaded from localStorage:", allCardsData);
            renderCards(allCardsData);
        } catch (error) {
            console.error("Error parsing localStorage data:", error);
            alert("Terjadi kesalahan saat memuat data.");
        }
    } else {
        document.getElementById("noResults").style.display = "block";
    }
}

function renderCards(data) {
    const container = document.getElementById("resultContainer");
    container.innerHTML = "";
    if (data.length === 0) {
        document.getElementById("noResults").style.display = "block";
        return;
    }
    data.forEach((item) => {
        item.onHand = item.onHand || "0"; // Default jika kosong
        item.autoOnHand = item.autoOnHand || false; // Tambahkan autoOnHand ke data

        // **Hitung Selisih (Qty - OnHand)**
        item.selisih = (parseInt(item.qty || "0", 10) - parseInt(item.onHand || "0", 10)); 

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-row">
                <div class="badge">${item.rak}</div>
                <div class="badge">${item.plu}</div>
                <div class="badge">${item.barcode}</div>
            </div>
            <div class="card-row">
                <div class="description">${item.description}</div>
                <div class="qty" hidden>${item.qty || "0"}</div>
                <div class="on-hand">
                    <label for="onHand-${item.plu}"></label>
                    <input type="number" id="onHand-${item.plu}" class="on-hand-input" value="${item.onHand}" min="0">
                </div>
            </div>
            <div class="card-row">
                <div class="checkbox-container">
                    <input type="checkbox" id="autoOnHand-${item.plu}" class="auto-onhand-checkbox" ${item.autoOnHand ? "checked" : ""}>
                    <label for="autoOnHand-${item.plu}" class="checkbox-label"></label>
                </div>
                <div class="timestamp">Updated: ${item.timestamp || "No timestamp"}</div>
            </div>
        `;

        // Dapatkan elemen checkbox dan input
        const onHandInput = card.querySelector(".on-hand-input");
        const autoOnHandCheckbox = card.querySelector(".auto-onhand-checkbox");

        // Pastikan status checkbox sesuai dengan data
        autoOnHandCheckbox.checked = item.autoOnHand;

        // Event listener untuk checkbox
        autoOnHandCheckbox.addEventListener("change", (event) => {
            item.autoOnHand = event.target.checked; // Simpan status ke data

            if (item.autoOnHand) {
                onHandInput.value = item.qty || "0";
                item.onHand = item.qty || "0";
                onHandInput.disabled = true;
            } else {
                onHandInput.disabled = false;
            }

            // **Update Selisih (Qty - OnHand)**
            item.selisih = (parseInt(item.qty || "0", 10) - parseInt(item.onHand || "0", 10)); 

            item.timestamp = getCurrentTimestamp();
            saveDataToLocalStorage();
        });

        // Event listener untuk input On Hand
        onHandInput.addEventListener("change", (event) => {
            item.onHand = event.target.value;

            // **Update Selisih (Qty - OnHand)**
            item.selisih = (parseInt(item.qty || "0", 10) - parseInt(item.onHand || "0", 10)); 

            item.timestamp = getCurrentTimestamp();
            saveDataToLocalStorage();
        });

        container.appendChild(card);
    });
}

// Helper function to get the current timestamp
function getCurrentTimestamp() {
    const now = new Date();
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };
    return now.toLocaleString(undefined, options);
}

// Save updated data to local storage
function saveDataToLocalStorage() {
    localStorage.setItem("cardData", JSON.stringify(allCardsData));
}
function redirectTo(url) {
    window.location.href = url;
}

// Load data from local storage when the page loads
window.addEventListener("load", loadDataFromLocalStorage);
