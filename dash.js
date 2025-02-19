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
        

        // console.log(allCardsData); // Baris ini bisa dihapus atau dikomentari
        let allCardsData = [];
        console.log(allCardsData); // Akan mencetak array kosong []
        

        function getData() {
            const rakValue = document.getElementById("rakInput").value;
            const button = document.querySelector(".search-input");
            const spinner = document.querySelector(".spinner");
            const url =
                "https://script.google.com/macros/s/AKfycbz5rdCmyjdxJJ8Xw2Af3ZzJ1HLspHTu8cdP3qViSRj0pLc0bn5FlUSLwJRA4dg6kPtU/exec";
        
            if (!rakValue) {
                alert("Silahkan masukkan kode rak");
                return;
            }
        
            // Clear local storage *before* fetching new data
            localStorage.removeItem("cardData");
        
            button.disabled = true;
            spinner.style.display = "inline-block";
            document.getElementById("noResults").style.display = "none";
        
            fetch(`${url}?rak=${encodeURIComponent(rakValue)}`)
                .then((response) => response.json())
                .then((data) => {
                    allCardsData = data;
        
                    // Save data to local storage *after* successful fetch
                    localStorage.setItem("cardData", JSON.stringify(data));
        
                    renderCards(data);
                    document.getElementById("dataFilter").value = "";
                })
                .catch((error) => {
                    console.error("Error:", error);
                    alert("Terjadi kesalahan saat mengambil data");
                })
                .finally(() => {
                    button.disabled = false;
                    spinner.style.display = "none";
                });
        }
        

      function renderCards(data) {
        const container = document.getElementById("resultContainer");
        container.innerHTML = "";

        if (data.length === 0) {
          document.getElementById("noResults").style.display = "block";
          return;
        }

        data.forEach((item) => {
          const card = document.createElement("div");
          card.className = "card";

          // Updated Card Structure
          card.innerHTML = `
            <!-- Row 1: Rak, PLU, Barcode -->
            <div class="card-row">
                <div class="badge">${item.rak}</div>
                <div class="badge">${item.plu}</div>
                <div class="badge">${item.barcode}</div>
            </div>

            <!-- Row 2: Description and Quantity -->
            <div class="card-row">
                <div class="description">${item.description}</div>
                <div class="qty"> ${item.qty || "0"}</div>
            </div>

            <!-- Row 3: Timestamp and Plus Icon with Circle -->
            <div class="card-row">
                <div class="timestamp">${item.timestamp || "No timestamp"}</div>
                <div class="edit-icon-circle">
                <i class="bi bi-plus"></i> <!-- Ikon plus dari Bootstrap Icons -->
            </div>
        `;

          container.appendChild(card);
        });
      }

      function filterCards() {
        const searchTerm = document
          .getElementById("dataFilter")
          .value.toLowerCase();
        const cards = document.getElementsByClassName("card");
        let visibleCount = 0;

        Array.from(cards).forEach((card) => {
          const text = card.textContent.toLowerCase();
          const match = text.includes(searchTerm);
          card.style.display = match ? "block" : "none";
          if (match) visibleCount++;
        });

        document.getElementById("noResults").style.display =
          visibleCount === 0 ? "block" : "none";
      }

      // Global variable to track the currently edited card
      let currentCard = null;

      // Function to open the modal and populate it with data
      function openEditModal(cardData) {
        const modal = document.getElementById("editModal");
        const pluInput = document.getElementById("plu");
        const barcodeInput = document.getElementById("barcode");
        const descriptionInput = document.getElementById("description");
        const oldQtyInput = document.getElementById("oldQty");
        const newQtyInput = document.getElementById("newQty");

        // Populate modal fields
        pluInput.value = cardData.plu;
        barcodeInput.value = cardData.barcode;
        descriptionInput.value = cardData.description;
        oldQtyInput.value = cardData.qty || "0";
        newQtyInput.value = "";

        // Show the modal
        modal.style.display = "block";

        // Store the current card data
        currentCard = cardData;
      }

      // Function to close the modal
      function closeEditModal() {
        const modal = document.getElementById("editModal");
        modal.style.display = "none";
      }

      // Add event listener to close modal when clicking the close button
      document
        .querySelector(".close")
        .addEventListener("click", closeEditModal);

      // Add event listener to close modal when clicking outside of it
      window.addEventListener("click", (event) => {
        const modal = document.getElementById("editModal");
        if (event.target === modal) {
          closeEditModal();
        }
      });

      // Reset button functionality
      document.getElementById("resetButton").addEventListener("click", () => {
        const oldQtyInput = document.getElementById("oldQty");
        const newQtyInput = document.getElementById("newQty");

        // Reset Old Qty and New Qty in the modal
        oldQtyInput.value = "0";
        newQtyInput.value = "";

        // Reset Qty on the card and update timestamp
        if (currentCard) {
          currentCard.qty = "0"; // Reset Qty to 0
          currentCard.timestamp = getCurrentTimestamp(); // Update timestamp

          // Re-render the cards to reflect the updated quantity and timestamp
          renderCards(allCardsData);
        }
      });

      // Cancel button functionality
      document
        .getElementById("cancelButton")
        .addEventListener("click", closeEditModal);

      // Save button functionality
      document.getElementById("saveButton").addEventListener("click", () => {
        const newQtyInput = document.getElementById("newQty");
        const newQty = parseInt(newQtyInput.value, 10);

        if (isNaN(newQty) || newQty < 0) {
          alert("Please enter a valid positive number for New Qty.");
          return;
        }

        // Update the current card's quantity
        const oldQty = parseInt(currentCard.qty || "0", 10);
        currentCard.qty = (oldQty + newQty).toString();

        // Update the timestamp
        currentCard.timestamp = getCurrentTimestamp();

        // Find the index of the current card in allCardsData
        const cardIndex = allCardsData.findIndex(
          (item) =>
            item.plu === currentCard.plu && item.barcode === currentCard.barcode
        );

        if (cardIndex !== -1) {
          allCardsData[cardIndex] = { ...currentCard }; // Update allCardsData
          localStorage.setItem("cardData", JSON.stringify(allCardsData)); // Update local storage
        }

        // Re-render the cards to reflect the updated quantity and timestamp
        renderCards(allCardsData);

        // Close the modal
        closeEditModal();
      });

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

      // Add click event listener to edit icon circles
      document
        .getElementById("resultContainer")
        .addEventListener("click", (event) => {
          if (event.target.closest(".edit-icon-circle")) {
            const card = event.target.closest(".card");
            const cardIndex = Array.from(card.parentNode.children).indexOf(
              card
            );
            const cardData = allCardsData[cardIndex];
            openEditModal(cardData);
          }
        });

      // Load data from local storage on page load
      window.addEventListener("DOMContentLoaded", (event) => {
        const storedData = localStorage.getItem("cardData");
        if (storedData) {
          allCardsData = JSON.parse(storedData);
          renderCards(allCardsData);
        }
      });

      // Prevent zooming on input focus
      document.querySelectorAll("input").forEach((input) => {
        input.addEventListener("focus", () => {
          document
            .querySelector("meta[name=viewport]")
            .setAttribute(
              "content",
              "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
            );
        });

        input.addEventListener("blur", () => {
          document
            .querySelector("meta[name=viewport]")
            .setAttribute(
              "content",
              "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
            );
        });
      });


      function redirectTo(url) {
        window.location.href = url;
      }