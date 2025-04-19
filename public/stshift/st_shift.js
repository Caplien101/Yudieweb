document.addEventListener("DOMContentLoaded", () => {
  const lokasiSelect = document.getElementById("lokasi");
  const descriptionInput = document.getElementById("description");
  const suggestionList = document.getElementById("suggestionList");
  const dataTableBody = document.querySelector("#dataTable tbody");
  const sendToGoogleSheetButton = document.getElementById("sendToGoogleSheet");
  const modal = new bootstrap.Modal(document.getElementById("modal")); // Initialize Bootstrap modal
  const modalDescription = document.getElementById("modalDescription");
  const modalQty = document.getElementById("modalQty");
  const saveModalButton = document.getElementById("saveModal");

  let googleSheetData = [];
  let currentSelectedItem = null;

  // Simulate fetching data from Google Sheet
  async function fetchDataFromGoogleSheet() {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzrZjKWWgOxXa17nu62ny6ZgV5gPnIgKIWCrMqVpRYWMnwpC8IeXTwHioKbSyQ2hZ0WUA/exec"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Data from Google Sheet:", data);
    return data;
  }

  // Save data to local storage
  function saveDataToLocal(data) {
    localStorage.setItem("googleSheetData", JSON.stringify(data));
  }

  // Load data from local storage
  function loadDataFromLocal() {
    const data = localStorage.getItem("googleSheetData");
    return data ? JSON.parse(data) : [];
  }

  // Initialize data
  async function initializeData() {
    googleSheetData = await fetchDataFromGoogleSheet();
    saveDataToLocal(googleSheetData);
  }

  // Filter suggestions based on input
  function filterSuggestions(query) {
    return googleSheetData.filter((item) =>
      item.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Show suggestions
  function showSuggestions(suggestions) {
    suggestionList.innerHTML = "";
    if (suggestions.length > 0) {
      suggestions.forEach((item) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = item.description;
        div.onclick = () => selectSuggestion(item);
        suggestionList.appendChild(div);
      });
      suggestionList.style.display = "block";
    } else {
      suggestionList.style.display = "none";
    }
  }

  // Select a suggestion
  function selectSuggestion(item) {
    currentSelectedItem = item;
    descriptionInput.value = item.description;
    suggestionList.style.display = "none";

    // Show modal
    modalDescription.textContent = item.description;
    modalQty.value = 1; // Default qty
    modal.show(); // Show Bootstrap modal
  }

  // Save modal data
  function saveModalData() {
    const qty = parseInt(modalQty.value, 10);
    if (!isNaN(qty)) {
      const row = document.createElement("tr");
row.innerHTML = `
  <td class="d-none">${lokasiSelect.value}</td> <!-- Sembunyikan -->
  <td class="d-none">${currentSelectedItem.rak}</td> <!-- Sembunyikan -->
  <td>${currentSelectedItem.plu}</td>
  <td class="d-none">${currentSelectedItem.barcode}</td> <!-- Sembunyikan -->
  <td>${currentSelectedItem.description}</td>
  <td>${qty}</td>
`;
dataTableBody.appendChild(row);

      // Update local storage
      googleSheetData = googleSheetData.map((item) =>
        item.description === currentSelectedItem.description
          ? { ...item, qty }
          : item
      );
      saveDataToLocal(googleSheetData);

      // Hide modal and clear field
      modal.hide(); // Hide Bootstrap modal
      descriptionInput.value = ""; // Clear description field
    }
  }

  // Send data to Google Sheet
  async function sendDataToGoogleSheet(data) {
    try {
      const body = Object.entries(data)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzrZjKWWgOxXa17nu62ny6ZgV5gPnIgKIWCrMqVpRYWMnwpC8IeXTwHioKbSyQ2hZ0WUA/exec",
        {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: body,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Data successfully sent to Google Sheet");
    } catch (error) {
      console.error("Error sending data:", error);
      throw error;
    }
  }

  // Event listeners
  lokasiSelect.addEventListener("change", async () => {
    if (!lokasiSelect.value) return;

    const spinner = document.getElementById("spinner");
    spinner.classList.remove("d-none");
    lokasiSelect.disabled = true;

    try {
      googleSheetData = loadDataFromLocal();
      if (googleSheetData.length === 0) {
        googleSheetData = await fetchDataFromGoogleSheet();
        saveDataToLocal(googleSheetData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal mengambil data. Silakan coba lagi.");
    } finally {
      spinner.classList.add("d-none");
      lokasiSelect.disabled = false;
    }
  });

  descriptionInput.addEventListener("input", () => {
    const query = descriptionInput.value.trim();
    if (query) {
      const suggestions = filterSuggestions(query);
      showSuggestions(suggestions);
    } else {
      suggestionList.style.display = "none";
    }
  });

  saveModalButton.addEventListener("click", saveModalData);

  sendToGoogleSheetButton.addEventListener("click", async () => {
    const rows = Array.from(dataTableBody.children).map((row) => ({
      lokasi: row.cells[0].textContent,
      rak: row.cells[1].textContent,
      plu: row.cells[2].textContent,
      barcode: row.cells[3].textContent,
      description: row.cells[4].textContent,
      qty: row.cells[5].textContent,
    }));

    if (rows.length === 0) {
      alert("Tidak ada data untuk dikirim.");
      return;
    }

    const spinner = document.getElementById("spinner");
    const progressContainer = document.getElementById("progressContainer");
    const progressText = document.getElementById("progressText");
    const progressBar = document.getElementById("progressBar");

    spinner.classList.remove("d-none");
    sendToGoogleSheetButton.disabled = true;
    progressContainer.classList.remove("d-none");

    try {
      let completed = 0;
      const total = rows.length;

      for (const row of rows) {
        await sendDataToGoogleSheet(row);

        completed++;
        const progressPercentage = Math.round((completed / total) * 100);
        progressText.textContent = `Progress: ${completed}/${total}`;
        progressBar.style.width = `${progressPercentage}%`;
      }

      // Show success notification
      const notification = document.getElementById("notification");
      notification.classList.remove("d-none");
      setTimeout(() => {
        notification.classList.add("d-none");
      }, 3000);

      dataTableBody.innerHTML = "";
      localStorage.removeItem("googleSheetData");
    } catch (error) {
      console.error("Error sending data:", error);
      alert("Gagal mengirim data. Silakan coba lagi.");
    } finally {
      spinner.classList.add("d-none");
      sendToGoogleSheetButton.disabled = false;
      progressContainer.classList.add("d-none");
      progressBar.style.width = "0%";
      progressText.textContent = "Progress: 0/0";
    }
  });

  // Initial load
  googleSheetData = loadDataFromLocal();
});
