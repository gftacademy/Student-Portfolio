// Load documents from local storage or initialize with default documents
let docs = JSON.parse(localStorage.getItem('docs')) || {
    "doc1.md": { title: "Document 1", content: "# Document 1\n\n## Section 1.1\n\nContent of section 1.1.\n\n## Section 1.2\n\nContent of section 1.2." },
    "doc2.md": { title: "Document 2", content: "# Document 2\n\n## Introduction\n\nIntroduction content.\n\n## Details\n\nDetails content." }
};

const sidebar = document.getElementById('sidebar');
const contentSection = document.getElementById('contentSection');
const contentDisplay = document.getElementById('contentDisplay');
const editorSection = document.getElementById('editorSection');
const tocSidebar = document.getElementById('tocSidebar');
const toc = document.getElementById('toc');
const docTitle = document.getElementById('docTitle');
const docTitleInput = document.getElementById('docTitleInput');
const dropdownBtn = document.getElementById('dropdownBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

// Initialize
const easyMDE = new EasyMDE({ element: document.getElementById("markdownEditor") });

// Initialize Showdown converter
const converter = new showdown.Converter();

// Toggle dropdown menu
dropdownBtn.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
});

function loadSidebar() {
    sidebar.innerHTML = "";
    for (const doc in docs) {
        const docItem = document.createElement('div');
        docItem.className = "document-item";

        const link = document.createElement('a');
        link.href = "#";
        link.textContent = docs[doc].title;
        link.className = "text-blue-600 hover:underline flex items-center";
        link.onclick = () => {
            displayContent(doc);
            return false;
        };

        const docIcon = document.createElement('i');
        docIcon.className = "fas fa-file-alt document-icon"; // Icon for each document

        const controls = document.createElement('div');

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.className = "text-sm text-yellow-600 hover:underline mx-2";
        editBtn.onclick = () => {
            editDocument(doc);
            return false;
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.className = "text-sm text-red-600 hover:underline";
        deleteBtn.onclick = () => {
            deleteDocument(doc);
            return false;
        };

        controls.appendChild(editBtn);
        controls.appendChild(deleteBtn);

        docItem.appendChild(docIcon);
        docItem.appendChild(link);
        docItem.appendChild(controls);

        sidebar.appendChild(docItem);
    }
}

function generateTOC() {
    toc.innerHTML = "";
    const headings = contentDisplay.querySelectorAll("h1, h2, h3");
    headings.forEach(heading => {
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        link.className = "block text-gray-600 hover:text-blue-600 ml-" + (parseInt(heading.tagName.charAt(1)) * 2);
        
        const listItem = document.createElement('li');
        listItem.appendChild(link);
        toc.appendChild(listItem);
    });
}

function displayContent(doc) {
    contentSection.style.display = "block";
    editorSection.style.display = "none";
    docTitle.textContent = docs[doc].title;
    const htmlContent = converter.makeHtml(docs[doc].content);
    contentDisplay.innerHTML = htmlContent;

    // Add IDs to headings for TOC linking
    const headings = contentDisplay.querySelectorAll("h1, h2, h3");
    headings.forEach(heading => {
        heading.id = heading.textContent.toLowerCase().replace(/\s+/g, '-');
    });

    generateTOC(); // Generate TOC after content is rendered
}

function editDocument(doc) {
    contentSection.style.display = "none";
    editorSection.style.display = "block";
    docTitleInput.value = docs[doc].title; // Set the document title in the input field
    easyMDE.value(docs[doc].content); // Set the content in EasyMDE Editor

    document.getElementById('saveDocBtn').onclick = () => {
        const newTitle = docTitleInput.value.trim();
        if (!newTitle) {
            alert("Title cannot be empty.");
            return;
        }

        docs[doc].title = newTitle;
        docs[doc].content = easyMDE.value();

        // Save the updated docs object to local storage
        localStorage.setItem('docs', JSON.stringify(docs));

        loadSidebar();
        displayContent(doc);
    };
}

function deleteDocument(doc) {
    if (confirm(`Are you sure you want to delete "${docs[doc].title}"?`)) {
        delete docs[doc];
        localStorage.setItem('docs', JSON.stringify(docs)); // Update local storage after deletion
        loadSidebar();
        contentSection.style.display = "none";
        editorSection.style.display = "none";
    }
}

document.getElementById('addDocBtn').onclick = () => {
    const docName = prompt("Enter document name (e.g., doc3.md):");
    if (docName) {
        docs[docName] = {
            title: docName, // Automatically use the entered name as the document title
            content: `# ${docName}\n\nStart editing...`
        };
        localStorage.setItem('docs', JSON.stringify(docs)); // Save new document to local storage
        loadSidebar();
        editDocument(docName);
    }
};

loadSidebar();
