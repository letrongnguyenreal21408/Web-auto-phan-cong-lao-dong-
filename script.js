// Danh sách công việc cố định
const tasks = [
    "Quét tổ 1",
    "Quét tổ 2",
    "Quét tổ 3",
    "Quét tổ 4",
    "Hành lang",
    "Bục giảng",
    "Lau bàn GV, giặt khăn",
    "Lau bảng",
    "Đổ rác"
];

// Danh sách ngày (bỏ Chủ nhật)
const days = ["Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Thứ 2", "Thứ 3"];

// Mảng lưu vi phạm
let violations = [];

// Mảng lưu bảng phân công
let schedule = [];

// Thêm người vi phạm
function addViolation() {
    const name = document.getElementById("nameInput").value.trim();
    const count = parseInt(document.getElementById("violationsInput").value);

    if (!name || isNaN(count) || count <= 0) {
        alert("Vui lòng nhập đúng thông tin!");
        return;
    }

    violations.unshift({ name, count });
    document.getElementById("nameInput").value = "";
    document.getElementById("violationsInput").value = "";
    renderViolations();
    document.getElementById("listSection").style.display = "block";
}

// Hiển thị danh sách vi phạm
function renderViolations() {
    const list = document.getElementById("violationsList");
    list.innerHTML = "";

    violations.forEach((v, i) => {
        const item = document.createElement("div");
        item.className = "violation-item";
        item.innerHTML = `
            <div class="violation-display">${v.name.toUpperCase()} | VI PHẠM: ${v.count}</div>
            <div>
                <button class="edit-btn" onclick="editViolation(${i})">Sửa</button>
                <button class="delete-btn" onclick="deleteViolation(${i})">Xoá</button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Xóa người vi phạm
function deleteViolation(index) {
    violations.splice(index, 1);
    renderViolations();
}

// Sửa người vi phạm
function editViolation(index) {
    const item = violations[index];
    const name = prompt("Nhập lại tên:", item.name);
    const count = prompt("Nhập lại số lần vi phạm:", item.count);

    if (!name || isNaN(count) || count <= 0) return;
    violations[index] = { name, count: parseInt(count) };
    renderViolations();
}

// Tạo bảng phân công
function generateSchedule() {
    if (violations.length === 0) {
        alert("Chưa có dữ liệu vi phạm!");
        return;
    }

    schedule = [];
    const peopleList = [];

    // Tạo danh sách người lặp theo số lần vi phạm
    violations.forEach(v => {
        for (let i = 0; i < v.count; i++) {
            peopleList.push(v.name);
        }
    });

    // Xáo trộn danh sách
    for (let i = peopleList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [peopleList[i], peopleList[j]] = [peopleList[j], peopleList[i]];
    }

    // Phân công từng ngày
    let index = 0;
    days.forEach(day => {
        const dayTasks = [];
        tasks.forEach(task => {
            const person = peopleList[index] || "(Chưa phân)";
            dayTasks.push({ task, person });
            index++;
        });
        schedule.push({ day, dayTasks });
    });

    renderScheduleTable();
    renderSaturdayCleaningTable(); // ✅ thêm bảng lau lớp
    addEditButton();
    document.getElementById("tableSection").style.display = "block";
}

// Hiển thị bảng phân công chính
function renderScheduleTable() {
    const tableHead = document.getElementById("tableHead");
    const tableBody = document.getElementById("tableBody");

    tableHead.innerHTML = `
        <tr>
            <th>Nhiệm vụ</th>
            ${days.map(day => `<th>${day}</th>`).join("")}
        </tr>
    `;

    let bodyHTML = "";
    tasks.forEach((task, taskIndex) => {
        bodyHTML += `<tr class="task-row"><td>${task}</td>`;
        days.forEach(day => {
            const foundDay = schedule.find(d => d.day === day);
            const person = foundDay.dayTasks[taskIndex]?.person || "(Chưa phân)";
            bodyHTML += `<td>${person}</td>`;
        });
        bodyHTML += `</tr>`;
    });

    tableBody.innerHTML = bodyHTML;
}

// ✅ Hàm tạo bảng "Thứ 7 Lau Lớp"
function renderSaturdayCleaningTable() {
    // Xóa bảng cũ nếu có
    const oldTable = document.getElementById("lauLopSection");
    if (oldTable) oldTable.remove();

    // Lọc người vi phạm từ 3 lần trở lên
    const heavyViolators = violations.filter(v => v.count >= 3).map(v => v.name);

    const jobs = ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4", "Hành lang"];
    const assigned = [];

    if (heavyViolators.length === 0) {
        assigned.push({ job: "Không có ai vi phạm ≥3 lần", person: "—" });
    } else {
        for (let i = 0; i < jobs.length; i++) {
            const person = heavyViolators[i % heavyViolators.length] || "(Chưa có ai)";
            assigned.push({ job: jobs[i], person });
        }
    }

    // Tạo HTML bảng phụ
    const section = document.createElement("div");
    section.id = "lauLopSection";
    section.className = "table-section";
    section.innerHTML = `
        <h2 style="text-align:center; color:#2c3e50;">THỨ 7 LAU LỚP</h2>
        <table>
            <thead>
                <tr><th>Công việc</th><th>Tên</th></tr>
            </thead>
            <tbody>
                ${assigned.map(a => `
                    <tr>
                        <td>Lau lớp – ${a.job}</td>
                        <td>${a.person}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;

    document.getElementById("tableSection").appendChild(section);
}

// Nút sửa bảng
function addEditButton() {
    if (!document.getElementById("editScheduleBtn")) {
        const btn = document.createElement("button");
        btn.id = "editScheduleBtn";
        btn.className = "generate-btn";
        btn.textContent = "Sửa Bảng";
        btn.onclick = openEditSchedule;
        document.getElementById("tableSection").appendChild(btn);
    }
}

// ✅ Mở form sửa bảng
function openEditSchedule() {
    const dayInput = prompt(`Nhập ngày muốn sửa (${days.join(", ")}):`);
    if (!dayInput) return;

    const normalizedDay = dayInput.trim().toLowerCase();
    const matchedDay = days.find(d => d.toLowerCase() === normalizedDay);

    if (!matchedDay) {
        alert("Ngày không hợp lệ!");
        return;
    }

    const selectedDay = schedule.find(d => d.day.toLowerCase() === normalizedDay);
    if (!selectedDay) {
        alert("Không tìm thấy ngày này trong bảng!");
        return;
    }

    const unassignedTasks = selectedDay.dayTasks.filter(t => t.person === "(Chưa phân)");
    if (unassignedTasks.length === 0) {
        alert("Ngày này đã phân đủ công việc!");
        return;
    }

    let taskOptions = unassignedTasks.map(t => t.task).join("\n");
    const taskInput = prompt(`Công việc chưa phân:\n${taskOptions}\n\nNhập công việc muốn gán:`);
    if (!taskInput) return;

    const normalizedTask = taskInput.trim().toLowerCase();
    const taskToEdit = selectedDay.dayTasks.find(t => t.task.toLowerCase() === normalizedTask);
    if (!taskToEdit) {
        alert("Công việc không hợp lệ!");
        return;
    }

    const personInput = prompt("Nhập tên người muốn phân công:");
    if (!personInput) return;

    const normalizedPerson = personInput.trim();
    const alreadyAssigned = selectedDay.dayTasks.some(
        t => t.person.toLowerCase() === normalizedPerson.toLowerCase()
    );
    if (alreadyAssigned) {
        alert(`${normalizedPerson} đã được phân công trong ngày này rồi!`);
        return;
    }

    taskToEdit.person = normalizedPerson;
    renderScheduleTable();
    renderSaturdayCleaningTable(); // Cập nhật luôn bảng lau lớp nếu có thay đổi
    alert(`Đã cập nhật ${taskToEdit.task} cho ${normalizedPerson} vào ${matchedDay}!`);
}