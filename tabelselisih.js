let allCardsData = [];

function loadDataFromLocalStorage() {
    const storedData = localStorage.getItem("cardData");
    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData);
            return parsedData.map(item => ({
                plu: Number(item.plu),
                description: String(item.description || ""),
                qty: parseInt(item.qty || 0, 10),
                onHand: parseInt(item.onHand || 0, 10)
            }));
        } catch (error) {
            console.error("Error parsing localStorage data:", error);
        }
    }
    return [];
}

function saveDataToLocalStorage() {
    const dataToSave = allCardsData.map(item => ({
        ...item,
        qty: Number(item.qty),
        onHand: Number(item.onHand)
    }));
    localStorage.setItem("cardData", JSON.stringify(dataToSave));
}

function showToastMessage(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    
    // Styling untuk posisi atas dengan margin kiri-kanan sama
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%) translateY(-100%)";
    toast.style.padding = "15px 25px";
    toast.style.background = "#4CAF50";
    toast.style.color = "white";
    toast.style.borderRadius = "25px";
    toast.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    toast.style.opacity = "0";
    toast.style.transition = "all 0.3s ease-in-out";
    toast.style.zIndex = "1000";
    toast.style.fontFamily = "Arial, sans-serif";
    toast.style.fontSize = "14px";
    toast.style.textAlign = "center";
    toast.style.minWidth = "300px";
    toast.style.maxWidth = "calc(100% - 40px)"; // 20px margin kiri + 20px kanan
    
    document.body.appendChild(toast);

    // Animasi masuk
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
    }, 50);

    // Animasi keluar
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(-100%)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function renderSelisihTable() {
    const tableBody = document.querySelector("#selisihTable tbody");
    tableBody.innerHTML = "";

    const filteredData = allCardsData.filter(item => {
        const selisih = item.qty - item.onHand;
        return selisih !== 0;
    });

    if (filteredData.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='5'>Tidak ada data dengan selisih bukan nol</td></tr>";
        return;
    }

    filteredData.forEach((item) => {
        const row = document.createElement("tr");
        row.setAttribute("data-plu", item.plu.toString());
        row.innerHTML = `
            <td>${item.plu}</td>
            <td>${item.description}</td>
            <td><input type="number" class="qty-input" value="${item.qty}" min="0"></td>
            <td>${item.onHand}</td>
            <td class="selisih">${item.qty - item.onHand}</td>
        `;

        const qtyInput = row.querySelector(".qty-input");
        qtyInput.addEventListener("input", (event) => {
            const newQty = parseInt(event.target.value) || 0;
            const plu = parseInt(row.getAttribute("data-plu"));
            
            const cardData = allCardsData.find(card => card.plu === plu);
            if (!cardData) {
                console.warn("PLU tidak ditemukan:", plu);
                return;
            }

            cardData.qty = Math.max(newQty, 0);
            saveDataToLocalStorage();

            const newSelisih = cardData.qty - cardData.onHand;
            row.querySelector(".selisih").textContent = newSelisih;

            if (newSelisih === 0) {
                row.style.transition = "all 0.5s ease-in-out";
                row.style.backgroundColor = "#e8f5e9";
                
                setTimeout(() => {
                    row.style.opacity = "0";
                    row.style.transform = "translateX(100%)";
                    setTimeout(() => {
                        row.remove();
                        if (!tableBody.hasChildNodes()) {
                            renderSelisihTable();
                        }
                        showToastMessage(`⌛ Item ${plu} (${cardData.description}) telah mencapai selisih 0`);
                    }, 500);
                }, 2000);
            }
        });

        tableBody.appendChild(row);
    });
}

window.addEventListener("load", () => {
    allCardsData = loadDataFromLocalStorage();
    renderSelisihTable();
});