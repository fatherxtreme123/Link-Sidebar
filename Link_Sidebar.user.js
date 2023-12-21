// ==UserScript==
// @name         Link Sidebar
// @version      0.5
// @description  A tampermonkey script that creates a sidebar for storing links
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

// Some constants for the sidebar
const SIDEBAR_WIDTH = 200; // The width of the sidebar in pixels
const SIDEBAR_COLOR = '#f0f0f0'; // The background color of the sidebar
const SIDEBAR_FONT = 'Arial, sans-serif'; // The font family of the sidebar
const SIDEBAR_TOGGLE = '<<'; // The text for the toggle button
const SIDEBAR_ADD = '+'; // The text for the add button
const SIDEBAR_REMOVE = '-'; // The text for the remove button
const SIDEBAR_EDIT = '✎'; // The text for the edit button
const SIDEBAR_STORAGE = 'link_sidebar'; // The key for storing the link list

// A function to create an element with some attributes and styles
function createElement(tag, attrs, styles) {
  let element = document.createElement(tag);
  for (let key in attrs) {
    element.setAttribute(key, attrs[key]);
  }
  for (let key in styles) {
    element.style[key] = styles[key];
  }
  return element;
}

// A function to get the link list from the storage
function getLinkList() {
  let linkList = GM_getValue(SIDEBAR_STORAGE, []);
  return linkList;
}

// A function to set the link list to the storage
function setLinkList(linkList) {
  GM_setValue(SIDEBAR_STORAGE, linkList);
}

// A function to update the sidebar with the link list
function updateSidebar() {
  // Clear the sidebar content
  sidebarContent.innerHTML = '';
  // Get the link list from the storage
  let linkList = getLinkList();
  // Loop through the link list and create the list items
  for (let i = 0; i < linkList.length; i++) {
    let link = linkList[i];
    // Create a list item element
    let listItem = createElement('li', {}, {
      listStyle: 'none',
      margin: '5px',
      padding: '5px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      cursor: 'move'
    });
    // Create a link element
    let linkElement = createElement('a', {
      href: link.url,
      target: '_blank'
    }, {
      textDecoration: 'none',
      color: 'black'
    });
    // Set the link text to the link name
    linkElement.textContent = link.name;
    // Append the link element to the list item
    listItem.appendChild(linkElement);
    // Create a remove button element
    let removeButton = createElement('button', {}, {
      float: 'right',
      margin: '0 5px',
      padding: '0 5px',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#f00',
      color: 'white',
      cursor: 'pointer'
    });
    // Set the remove button text to the remove symbol
    removeButton.textContent = SIDEBAR_REMOVE;
    // Add an event listener to the remove button
    removeButton.addEventListener('click', function() {
      // Remove the link from the link list
      linkList.splice(i, 1);
      // Set the link list to the storage
      setLinkList(linkList);
      // Update the sidebar
      updateSidebar();
    });
    // Append the remove button to the list item
    listItem.appendChild(removeButton);
    // Create an edit button element
    let editButton = createElement('button', {}, {
      float: 'right',
      margin: '0 5px',
      padding: '0 5px',
      border: 'none',
      borderRadius: '5px',
      backgroundColor: '#0ff',
      color: 'black',
      cursor: 'pointer'
    });
    // Set the edit button text to the edit symbol
    editButton.textContent = SIDEBAR_EDIT;
    // Add an event listener to the edit button
    editButton.addEventListener('click', function() {
      // Prompt the user to enter a new link name
      let newName = prompt('Enter a new link name', link.name);
      // If the new name is not empty
      if (newName) {
        // Update the link name in the link list
        linkList[i].name = newName;
        // Set the link list to the storage
        setLinkList(linkList);
        // Update the sidebar
        updateSidebar();
      }
    });
    // Append the edit button to the list item
    listItem.appendChild(editButton);
    // Append the list item to the sidebar content
    sidebarContent.appendChild(listItem);
  }
  // Initialize the sortable library on the sidebar content
  Sortable.create(sidebarContent, {
    // Set the option to store the order of the list items
    store: {
      // Get the order of the list items from the storage
      get: function(sortable) {
        return getLinkList().map(function(link) {
          return link.url;
        });
      },
      // Set the order of the list items to the storage
      set: function(sortable) {
        let order = sortable.toArray();
        let linkList = getLinkList();
        linkList.sort(function(a, b) {
          return order.indexOf(a.url) - order.indexOf(b.url);
        });
        setLinkList(linkList);
      }
    }
  });
}

// A function to get the website name from a link url
function getWebsiteName(url) {
  // Use a regular expression to extract the domain name from the url
  let domain = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/)[1];
  // Return the domain name as the website name
  return domain;
}

// A function to get the title of a webpage from a link url
async function getWebpageTitle(url) {
  try {
    // Use fetch to get the response from the url
    let response = await fetch(url);
    // If the response is ok
    if (response.ok) {
      // Get the text from the response
      let text = await response.text();
      // Use DOMParser to parse the text as HTML
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, 'text/html');
      // Get the title element from the document
      let title = doc.querySelector('title');
      // If the title element exists
      if (title) {
        // Return the title text as the webpage title
        return title.textContent;
      } else {
        // Otherwise, return the website name as the webpage title
        return getWebsiteName(url);
      }
    } else {
      // Otherwise, throw an error with the status text
      throw new Error(response.statusText);
    }
  } catch (error) {
    // If there is an error, return the error message as the webpage title
    return error.message;
  }
}

// Create a sidebar element
let sidebar = createElement('div', {}, {
  position: 'fixed',
  top: '0',
  left: '-' + SIDEBAR_WIDTH + 'px', // default closed
  width: SIDEBAR_WIDTH + 'px',
  height: '100%',
  overflowY: 'auto',
  backgroundColor: SIDEBAR_COLOR,
  fontFamily: SIDEBAR_FONT,
  zIndex: '9999',
  transition: 'left 0.3s ease-in-out'
});

// Create a sidebar header element
let sidebarHeader = createElement('div', {}, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '5px',
  padding: '5px',
  borderBottom: '1px solid #ccc'
});

// Create a sidebar title element
let sidebarTitle = createElement('h3', {}, {
  margin: '0',
  padding: '0',
  fontWeight: 'normal'
});
// Set the sidebar title text to 'Link Sidebar'
sidebarTitle.textContent = 'Link Sidebar';

// Create a sidebar toggle element
let sidebarToggle = createElement('button', {}, {
  margin: '0 5px',
  padding: '0 5px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: '#ccc',
  color: 'black',
  cursor: 'pointer'
});

// Set the sidebar toggle text to the toggle symbol
sidebarToggle.textContent = SIDEBAR_TOGGLE;
// Add an event listener to the sidebar toggle
sidebarToggle.addEventListener('click', function() {
  // Toggle the sidebar width between 0 and the sidebar width constant
  sidebar.style.left = sidebar.style.left === '0px' ? '-' + SIDEBAR_WIDTH + 'px' : '0px';
});

// Create a sidebar add element
let sidebarAdd = createElement('button', {}, {
  margin: '0 5px',
  padding: '0 5px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: '#0f0',
  color: 'white',
  cursor: 'pointer'
});
// Set the sidebar add text to the add symbol
sidebarAdd.textContent = SIDEBAR_ADD;
// Add an event listener to the sidebar add
sidebarAdd.addEventListener('click', async function() {
  // Prompt the user to enter a link url
  let linkUrl = prompt('Enter a link url');
  // If the link url is not empty
  if (linkUrl) {
    // Get the webpage title from the link url
    let linkName = await getWebpageTitle(linkUrl);
    // Get the link list from the storage
    let linkList = getLinkList();
    // Create a link object with the url and name
    let link = {
      url: linkUrl,
      name: linkName
    };
    // Push the link object to the link list
    linkList.push(link);
    // Set the link list to the storage
    setLinkList(linkList);
    // Update the sidebar
    updateSidebar();
  }
});

// Append the sidebar title and toggle button elements to the sidebar header
sidebarHeader.appendChild(sidebarTitle);
sidebarHeader.appendChild(sidebarToggle);
sidebarHeader.appendChild(sidebarAdd);

// Create a sidebar content element
let sidebarContent = createElement('ul', {}, {
  margin: '0',
  padding: '0'
});

// Append the sidebar header and content elements to the sidebar
sidebar.appendChild(sidebarHeader);
sidebar.appendChild(sidebarContent);

// Append the sidebar element to the document body
document.body.appendChild(sidebar);

// Create a button to toggle the sidebar
let showSidebarButton = createElement('button', {}, {
  position: 'fixed',
  top: '50%',
  left: '0',
  transform: 'translateY(-50%)',
  zIndex: '9999',
  padding: '10px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: '#ccc',
  color: 'black',
  cursor: 'pointer',
  display: sidebar.style.left === '-' + SIDEBAR_WIDTH + 'px' ? 'block' : 'none'
});

// Set the button text to the toggle symbol
showSidebarButton.textContent = SIDEBAR_TOGGLE;

// Add an event listener to show the sidebar when the button is clicked
showSidebarButton.addEventListener('click', function() {
  // Open the sidebar
  sidebar.style.left = '0px';
  // Hide the button
  showSidebarButton.style.display = 'none';
});

// Append the button to the document body
document.body.appendChild(showSidebarButton);

// Add an event listener to show the toggle button when the sidebar is closed
sidebar.addEventListener('transitionend', function() {
  if (sidebar.style.left === '-' + SIDEBAR_WIDTH + 'px') {
    showSidebarButton.style.display = 'block';
  }
});

// Update the sidebar with the link list
updateSidebar();