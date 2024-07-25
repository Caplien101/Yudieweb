// script.js

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzBGEUeX9bXNV1ii17EFwTB6vwH9VfpnlHv0pta7SF69A1-jKRNIOyr02DRMJoOEMvZvg/exec';

async function fetchDataFromSheets() {
    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
            throw new Error('Gagal mengambil data');
        }
        const data = await response.json();
        displayData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        // Tampilkan pesan error atau lakukan tindakan lain jika perlu
    }
}

function displayData(data) {
    var tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Clear the table body before inserting new data

    if (data.length === 0) {
        console.log("Data kosong");
        return;
    }

    data.forEach(function(row) {
        var newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${row.TANGGAL}</td>
            <td>${row.SHIFT}</td>
            <td>${row.STD}</td>
            <td>${row.PSM}</td>
            <td>${row.PWP}</td>
            <td>${row.SERBA}</td>
            <td>${row.MEMBER}</td>
            <td>${row['NAMA CREW']}</td>
        `;
        tableBody.appendChild(newRow);
    });
}

// Panggil fetchDataFromSheets saat halaman dimuat
window.onload = fetchDataFromSheets;
