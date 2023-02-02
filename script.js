const API_URL = "https://jsonplaceholder.typicode.com/users";

const tableRowTemplate = document.querySelector("#table-row-template");
const actionBtnsTemplate = document.querySelector("#action-buttons-template");

const tableHead = document.querySelector(".table__head");
const tableBody = document.querySelector(".table__body");
const modal = document.querySelector(".modal__overlay");
const mainBtnsContainer = document.querySelector(".buttons__container");
const errorsContainer = document.querySelector(".table__errors-container");

let usersDataGlobal;
let isEditing = false;

(function () {
	const usersDataLS = JSON.parse(localStorage.getItem("usersDATA"));

	if (!usersDataLS || !usersDataLS.length) {
		for (let i = 0; i < 10; i++) {
			tableBody.appendChild(tableRowTemplate.content.cloneNode(true));
		}
		fetchUsersData();
	} else {
		usersDataGlobal = usersDataLS;
		initTable(usersDataGlobal);
	}
})();

async function fetchUsersData() {
	try {
		const res = await fetch(API_URL);
		const data = await res.json();

		if (res.ok) {
			usersDataGlobal = data;
			initTable(data);
			setDataToLS(data);
		} else {
			throw new Error(
				`Status code: ${res.status}.
				Something went wrong. Try again later.`
			);
		}
	} catch (error) {
		errorsContainer.innerText = error.message;
		tableBody
			.querySelectorAll(".skeleton")
			.forEach((element) => (element.style.animationIterationCount = 3));
	}
}

function setDataToLS(value, name = "usersDATA") {
	if (typeof value !== "object") return;
	localStorage.setItem(name, JSON.stringify(value));
}

function initTable(data) {
	tableBody.innerHTML = "";
	data.forEach((user) => {
		const row = initTableRow(user);
		tableBody.appendChild(row);
	});
}

function initTableRow(user) {
	const tableRow = tableRowTemplate.content.cloneNode(true);
	const actionBtns = actionBtnsTemplate.content.cloneNode(true);
	const actionBtnsCell = tableRow.querySelector(
		"[data-column-name = action-buttons]"
	);

	// TODO: Optimize by creating function wich inits table row content based on object properties

	actionBtnsCell.innerHTML = "";
	actionBtnsCell.appendChild(actionBtns);

	tableRow.querySelector("tr").setAttribute("data-row-id", user.id);
	tableRow.querySelector("[data-column-name = id]").textContent = user.id;
	tableRow.querySelector("[data-column-name = name]").textContent = user.name;
	tableRow.querySelector("[data-column-name = email]").textContent = user.email;
	tableRow.querySelector("[data-nested-prop = city]").textContent =
		user.address.city;
	tableRow.querySelector("[data-nested-prop = street]").textContent =
		user.address.street;
	tableRow.querySelector("[data-nested-prop = suite]").textContent =
		user.address.suite;
	tableRow.querySelector("[data-column-name = company]").textContent =
		user.company.name;
	tableRow.querySelector("[data-column-name = zipcode]").textContent =
		user.address.zipcode;

	return tableRow;
}

function handleSorting(e) {
	e.stopPropagation();
	console.dir(e.target);

	if (e.target.hasAttribute("colspan")) return;

	const order = e.target.dataset.order;
	const columnName = e.target.dataset.columnName;
	const nestedProp = e.target.dataset.nestedProp;

	// TODO: save data-order values to LS and implement function wich sets data-order values on each column after page reloading

	switch (order) {
		case "asc":
			if (nestedProp === undefined) {
				usersDataGlobal.sort((a, b) =>
					a[columnName] > b[columnName] ? 1 : -1
				);
			} else {
				usersDataGlobal.sort((a, b) =>
					a[columnName][nestedProp] > b[columnName][nestedProp] ? 1 : -1
				);
			}
			e.target.setAttribute("data-order", "desc");
			break;

		case "desc":
			if (nestedProp === undefined) {
				usersDataGlobal.sort((a, b) =>
					a[columnName] < b[columnName] ? 1 : -1
				);
			} else {
				usersDataGlobal.sort((a, b) =>
					a[columnName][nestedProp] < b[columnName][nestedProp] ? 1 : -1
				);
			}
			e.target.setAttribute("data-order", "asc");
			break;
	}

	initTable(usersDataGlobal);
	setDataToLS(usersDataGlobal);
}

function handleMainBtnsClick(e) {
	e.stopPropagation();
	if (e.target.closest(".buttons__btn-clear-storage")) {
		localStorage.removeItem("usersDATA");
	}
	if (e.target.closest(".buttons__btn-add-user")) {
		handleAddUser();
	}
}

function handleAddUser() {
	modal.innerHTML = "";

	// TODO: Optimize by creating function wich inits modal content based on object properties

	const modalBody = `
	<div class="modal__body">
		<button class="modal__close-btn btn">&times;</button>
		<form class="modal__form">
			<fieldset>
				<div class="modal__header">
					<legend>New User Data</legend>
				</div>
				<label for="id">id:</label>
				<input value="${usersDataGlobal.length + 1}" type="text" id="id" disabled>
				<label for="name">name:</label>
				<input value="" type="text" id="name" required>
				<label for="email">email:</label>
				<input value="" type="email" id="email" required>
				<label for="city">city:</label>
				<input value="" type="text" id="city" required>
				<label for="street">street:</label>
				<input value="" type="text" id="street" required>
				<label for="suite">suite:</label>
				<input value="" type="text" id="suite" required>
				<label for="company">company name:</label>
				<input value="" type="text" id="company" required>
				<label for="zipcode">zipcode:</label>
				<input value="" type="text" id="zipcode" required>
				<button type="submit" class="buttons__save-btn btn">Save</button>
			</fieldset>
		</form>
	</div>
	`;

	modal.innerHTML = modalBody;
	modal.classList.add("opened");
	modal.querySelector("#name").focus();

	modal
		.querySelector(".modal__form")
		.addEventListener("submit", handleSubmitNewUser);
}

// TODO: Optimize by creating common function for saving Edited and New user

function handleSubmitNewUser(e) {
	e.preventDefault();
	const newUser = {
		id: +modal.querySelector("#id").value,
		name: modal.querySelector("#name").value,
		email: modal.querySelector("#email").value,
		address: {
			city: modal.querySelector("#city").value,
			street: modal.querySelector("#street").value,
			suite: modal.querySelector("#suite").value,
			zipcode: modal.querySelector("#zipcode").value,
		},
		company: {
			name: modal.querySelector("#company").value,
		},
	};

	const newRow = initTableRow(newUser);
	tableBody.appendChild(newRow);
	modal.classList.remove("opened");
	usersDataGlobal.push(newUser);
	setDataToLS(usersDataGlobal);
}

function findUserById(id) {
	return usersDataGlobal.find((user) => user.id === +id);
}

function handleRemoveUser(e) {
	e.target.closest("tr").remove();
	const userId = e.target.closest("tr").dataset.rowId;
	usersDataGlobal = usersDataGlobal.filter((user) => user.id !== +userId);
	setDataToLS(usersDataGlobal);
}

function handleEditUser(e) {
	isEditing = true;
	const currentRow = e.target.closest("tr");
	const userId = e.target.closest("tr").dataset.rowId;
	const currentUser = findUserById(userId);

	// TODO: Optimize by creating function wich inits modal's content based on object properties

	currentRow.innerHTML = `
		<th data-column-name="id">${currentUser.id}</th>
		<td>
			<label for="name">name:</label>
			<input value='${currentUser.name}' type="text" id="name">
		</td>
		<td>
			<label for="email">email:</label>
			<input value='${currentUser.email}' type="text" id="email">
		</td>
		<td>
			<label for="city">city:</label>
			<input value='${currentUser.address.city}' type="text" id="city">
		</td>
		<td>
			<label for="street">street:</label>
			<input value='${currentUser.address.street}' type="text" id="street">
		</td>
		<td>
			<label for="suite">suite:</label>
			<input value='${currentUser.address.suite}' type="text" id="suite">
		</td>
		<td>
			<label for="company">company name:</label>
			<input value='${currentUser.company.name}' type="text" id="company">
		</td>
		<td>
			<label for="zipcode">zipcode:</label>
			<input value='${currentUser.address.zipcode}' type="text" id="zipcode">
		</td>
		<td data-column-name="action-buttons">
			<div class="buttons__container">
				<button class="buttons__cancel-btn btn">Cancel</button>
				<button type="submit" class="buttons__save-btn btn">Save</button>
			</div>
		</td>
	`;

	const cancelBtn = currentRow.querySelector(".buttons__cancel-btn");
	const saveBtn = currentRow.querySelector(".buttons__save-btn");

	const nameInput = currentRow.querySelector("#name");
	nameInput.setSelectionRange(nameInput.value.length, nameInput.value.length);
	nameInput.focus();

	// setting cursor position to the end of an input
	currentRow.addEventListener("click", (e) => {
		e.stopPropagation();
		e.preventDefault();
		if (e.target.closest(".buttons__container")) return;
		if (e.target.tagName === "LABEL") {
			const input = e.target.nextElementSibling;
			const end = input.value.length;
			if (!end) return;
			input.setSelectionRange(end, end);
			input.focus();
		}
	});

	cancelBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		handleEditingResult(e, currentUser, currentRow);
	});

	saveBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		const editedUser = {
			...currentUser,
			name: currentRow.querySelector("#name").value,
			email: currentRow.querySelector("#email").value,
			address: {
				...currentUser.address,
				city: currentRow.querySelector("#city").value,
				street: currentRow.querySelector("#street").value,
				suite: currentRow.querySelector("#suite").value,
				zipcode: currentRow.querySelector("#zipcode").value,
			},
			company: {
				...currentUser.company,
				name: currentRow.querySelector("#company").value,
			},
		};

		handleEditingResult(e, currentUser, currentRow, editedUser);
	});
}

function handleEditingResult(e, currentUser, currentRow, editedUser = null) {
	isEditing = false;

	if (e.target.closest(".buttons__cancel-btn")) {
		const newRow = initTableRow(currentUser);
		tableBody.replaceChild(newRow, currentRow);
	}

	if (e.target.closest(".buttons__save-btn")) {
		const newRow = initTableRow(editedUser);
		tableBody.replaceChild(newRow, currentRow);

		const index = usersDataGlobal.findIndex(
			(user) => editedUser.id === user.id
		);
		usersDataGlobal.splice(index, 1, editedUser);
		setDataToLS(usersDataGlobal);
	}
}

function handleShowUserInfo(e) {
	modal.innerHTML = "";

	const userId = e.target.parentNode.dataset.rowId;
	const currentUser = findUserById(userId);

	// TODO: Optimize by creating function wich inits modal content based on object properties

	const modalBody = `
		<div class="modal__body">
		<button class="modal__close-btn btn">&times;</button>
		<div class="modal__header">
		${
			currentUser.username
				? `<h4 class="modal__title user-name">${currentUser.username}</h4>`
				: ""
		}
			<h3 class="modal__title name">${currentUser.name}</h3>
		</div>
		<div class="modal__main">
			<ul>
				<li class="id">id: ${currentUser.id}</li>
				${currentUser.phone ? `<li class="phone">${currentUser.phone}</li>` : ""}
				${currentUser.email ? `<li class="phone">${currentUser.email}</li>` : ""}
				${currentUser.website ? `<li class="website">${currentUser.website}</li>` : ""}
				<hr>
				<li class="adress">
					<h4>Address:</h4>
				</li>
				<li class="city">${currentUser.address.city}</li>
								${
									currentUser.address.geo?.lat
										? `<li class="geo-lat">${currentUser.address.geo.lat}</li>`
										: ""
								}
								${
									currentUser.address.geo?.lng
										? `<li class="geo-lng">${currentUser.address.geo.lng}</li>`
										: ""
								}
				<li class="street">${currentUser.address.street}</li>
				<li class="suite">${currentUser.address.suite}</li>
				<li class="zipcode">${currentUser.address.zipcode}</li>
				<hr>
				<li class="company">
					<h4>Company:</h4>
				</li>
				<li class="company-name">${currentUser.company.name}</li>
												${
													currentUser.company.catchPhrase
														? `<li class="catch-phrase">${currentUser.company.catchPhrase}</li>`
														: ""
												}
												${currentUser.company.bs ? `<li class="bs">${currentUser.company.bs}</li>` : ""}
			</ul>
		</div>
		</div>
	</div>
	`;

	modal.innerHTML = modalBody;
	modal.classList.add("opened");
}

mainBtnsContainer.addEventListener("click", handleMainBtnsClick);
tableHead.addEventListener("click", handleSorting);
tableBody.addEventListener("click", (e) => {
	if (e.target.closest(".buttons__edit-btn")) {
		e.stopPropagation();
		if (isEditing) return;
		handleEditUser(e);
		return;
	}
	if (e.target.closest(".buttons__remove-btn")) {
		e.stopPropagation();
		handleRemoveUser(e);
		return;
	}
	if (e.target.closest(".table__body-row")) {
		e.stopPropagation();
		if (isEditing) return;
		if (e.target.querySelector("button") != null) return;
		handleShowUserInfo(e);
		return;
	}
});

window.addEventListener("click", (e) => {
	if (
		!e.target.closest(".modal__body") ||
		e.target.classList.contains("modal__close-btn")
	)
		modal.classList.remove("opened");
});
