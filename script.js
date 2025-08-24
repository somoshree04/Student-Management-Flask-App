const API_URL = "http://127.0.0.1:5000/students";
let studentsData = []; // full data
let currentSort = { key: null, asc: true };
let currentDisplayed = []; // tracks filtered/sorted table

// Load students
async function loadStudents() {
  let res = await fetch(API_URL);
  studentsData = await res.json();
  renderTable(studentsData);
}

// Render table
function renderTable(data) {
  currentDisplayed = data; // save current table view
  let table = document.getElementById("studentTable");
  table.innerHTML = "";
  data.forEach(st => {
    table.innerHTML += `
      <tr>
        <td>${st.id}</td>
        <td>${st.name}</td>
        <td>${st.roll}</td>
        <td>${st.marks}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="updateStudent(${st.roll})">
            ✏️ Update
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteStudent(${st.roll})">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
  });
}

// Sort function
function sortTable(key) {
  if (currentSort.key === key) {
    currentSort.asc = !currentSort.asc; // toggle order
  } else {
    currentSort.key = key;
    currentSort.asc = true;
  }

  let sorted = [...studentsData].sort((a, b) => {
    if (typeof a[key] === "string") {
      return currentSort.asc
        ? a[key].localeCompare(b[key])
        : b[key].localeCompare(a[key]);
    } else {
      return currentSort.asc ? a[key] - b[key] : b[key] - a[key];
    }
  });

  renderTable(sorted);
}

// Add student
document.getElementById("studentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  let name = document.getElementById("name").value;
  let roll = document.getElementById("roll").value;
  let marks = document.getElementById("marks").value;

  await fetch(API_URL, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({name, roll, marks})
  });

  e.target.reset();
  loadStudents();
});

// Update student marks
async function updateStudent(roll) {
  let marks = prompt("Enter new marks:");
  if (marks) {
    await fetch(`${API_URL}/${roll}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({marks})
    });
    loadStudents();
  }
}

// Delete student
async function deleteStudent(roll) {
  if (confirm("Are you sure you want to delete this student?")) {
    await fetch(`${API_URL}/${roll}`, {method: "DELETE"});
    loadStudents();
  }
}

// Live Search
document.getElementById("searchBox").addEventListener("input", function() {
  let q = this.value.toLowerCase();
  let filtered = studentsData.filter(st =>
    st.name.toLowerCase().includes(q) || String(st.roll).includes(q)
  );
  renderTable(filtered);
});

// Download CSV
function downloadCSV() {
  if (!currentDisplayed.length) {
    alert("No data to export!");
    return;
  }
  let csv = "ID,Name,Roll,Marks\n";
  currentDisplayed.forEach(st => {
    csv += `${st.id},${st.name},${st.roll},${st.marks}\n`;
  });

  let blob = new Blob([csv], {type: "text/csv"});
  let url = window.URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();

  window.URL.revokeObjectURL(url);
}

// Load initially
loadStudents();

