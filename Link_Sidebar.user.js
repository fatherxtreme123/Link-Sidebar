// ==UserScript==
// @name         Link Sidebar
// @version      0.7
// @description  A Tampermonkey script that creates a sidebar for storing links with search functionality
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @icon         https://github.com/fatherxtreme123/Link-Sidebar/blob/main/icon.png?raw=true
// ==/UserScript==

const SIDEBAR_WIDTH = 200;
const SIDEBAR_TEXT_COLOR = '#fff'; // Set to white
const SIDEBAR_BACKGROUND_COLOR = '#000'; // Set to black
const SIDEBAR_TOGGLE = '<<';
const SIDEBAR_ADD = '+';
const SIDEBAR_REMOVE = '-';
const SIDEBAR_EDIT = '✎';
const SIDEBAR_SEARCH = '🔍'; // Added search icon
const SIDEBAR_STORAGE = 'link_sidebar';

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

function getLinkList() {
  let linkList = GM_getValue(SIDEBAR_STORAGE, []);
  return linkList;
}

function setLinkList(linkList) {
  GM_setValue(SIDEBAR_STORAGE, linkList);
}

function moveLinkUp(index) {
  let linkList = getLinkList();
  if (index > 0 && index < linkList.length) {
    [linkList[index], linkList[index - 1]] = [linkList[index - 1], linkList[index]];
    setLinkList(linkList);
    updateSidebar();
  }
}

function moveLinkDown(index) {
  let linkList = getLinkList();
  if (index >= 0 && index < linkList.length - 1) {
    [linkList[index], linkList[index + 1]] = [linkList[index + 1], linkList[index]];
    setLinkList(linkList);
    updateSidebar();
  }
}

async function getWebpageTitle(url) {
  try {
    let response = await fetch(url);
    if (response.ok) {
      let text = await response.text();
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, 'text/html');
      let title = doc.querySelector('title');
      if (title) {
        return title.textContent;
      } else {
        return getWebsiteName(url);
      }
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    return error.message;
  }
}

function updateSidebar() {
  sidebarContent.innerHTML = '';
  let linkList = getLinkList();
  let searchInputValue = searchInput.value.toLowerCase(); // Added search input value

  for (let i = 0; i < linkList.length; i++) {
    let link = linkList[i];
    let truncatedName = link.name.length > 5 ? link.name.substring(0, 5) + '...' : link.name;

    // Added search functionality
    if (
      link.name.toLowerCase().includes(searchInputValue) ||
      link.url.toLowerCase().includes(searchInputValue)
    ) {
      let listItem = createElement('li', {}, {
        listStyle: 'none',
        margin: '5px',
        padding: '5px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        cursor: 'move'
      });

      let linkElement = createElement('a', {
        href: link.url,
        target: '_blank'
      }, {
        textDecoration: 'none',
        color: SIDEBAR_TEXT_COLOR,
      });
      linkElement.textContent = truncatedName;
      listItem.appendChild(linkElement);

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
      removeButton.textContent = SIDEBAR_REMOVE;
      removeButton.addEventListener('click', function () {
        linkList.splice(i, 1);
        setLinkList(linkList);
        updateSidebar();
      });
      listItem.appendChild(removeButton);

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
      editButton.textContent = SIDEBAR_EDIT;
      editButton.addEventListener('click', function () {
        let newName = prompt('Enter a new link name', link.name);
        if (newName) {
          linkList[i].name = newName;
          setLinkList(linkList);
          updateSidebar();
        }
      });
      listItem.appendChild(editButton);

      let upButton = createElement('button', {}, {
        float: 'right',
        margin: '0 5px',
        padding: '0 5px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#00f',
        color: 'white',
        cursor: 'pointer'
      });
      upButton.textContent = '↑';
      upButton.addEventListener('click', function () {
        moveLinkUp(i);
      });
      listItem.appendChild(upButton);

      let downButton = createElement('button', {}, {
        float: 'right',
        margin: '0 5px',
        padding: '0 5px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#00f',
        color: 'white',
        cursor: 'pointer'
      });
      downButton.textContent = '↓';
      downButton.addEventListener('click', function () {
        moveLinkDown(i);
      });
      listItem.appendChild(downButton);

      sidebarContent.appendChild(listItem);
    }
  }

  Sortable.create(sidebarContent, {
    store: {
      get: function (sortable) {
        return getLinkList().map(function (link) {
          return link.url;
        });
      },
      set: function (sortable) {
        let order = sortable.toArray();
        let linkList = getLinkList();
        linkList.sort(function (a, b) {
          return order.indexOf(a.url) - order.indexOf(b.url);
        });
        setLinkList(linkList);
      }
    }
  });
}

let sidebar = createElement('div', {}, {
  position: 'fixed',
  top: '0',
  left: '-' + SIDEBAR_WIDTH + 'px',
  width: SIDEBAR_WIDTH + 'px',
  height: '100%',
  overflowY: 'auto',
  backgroundColor: SIDEBAR_BACKGROUND_COLOR,
  fontFamily: 'Arial, sans-serif',
  color: SIDEBAR_TEXT_COLOR,
  zIndex: '9999',
  transition: 'left 0.3s ease-in-out'
});

let sidebarHeader = createElement('div', {}, {
  display: 'flex',
  flexDirection: 'column', // Adjusted flex direction
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '5px',
  padding: '5px',
  borderBottom: '1px solid #ccc'
});

let sidebarTitle = createElement('h3', {}, {
  margin: '0',
  padding: '0',
  fontWeight: 'normal'
});
sidebarTitle.textContent = 'Link Sidebar';

let sidebarToggle = createElement('button', {}, {
  margin: '5px 0', // Adjusted margin
  padding: '0 5px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: '#ccc',
  color: SIDEBAR_TEXT_COLOR,
  cursor: 'pointer'
});
sidebarToggle.textContent = SIDEBAR_TOGGLE;
sidebarToggle.addEventListener('click', function () {
  sidebar.style.left = sidebar.style.left === '0px' ? '-' + SIDEBAR_WIDTH + 'px' : '0px';
});

let sidebarAdd = createElement('button', {}, {
  margin: '0 5px',
  padding: '0 5px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: '#0f0',
  color: SIDEBAR_TEXT_COLOR,
  cursor: 'pointer'
});
sidebarAdd.textContent = SIDEBAR_ADD;
sidebarAdd.addEventListener('click', async function () {
  let linkUrl = prompt('Enter a link URL');
  if (linkUrl) {
    let linkName = await getWebpageTitle(linkUrl);
    let linkList = getLinkList();
    let link = {
      url: linkUrl,
      name: linkName
    };
    linkList.push(link);
    setLinkList(linkList);
    updateSidebar();
  }
});

// Added search functionality
let searchInput = createElement('input', {
  type: 'text',
  placeholder: 'Search',
});
searchInput.addEventListener('input', updateSidebar);

sidebarHeader.appendChild(sidebarTitle);
sidebarHeader.appendChild(sidebarToggle);
sidebarHeader.appendChild(sidebarAdd);
sidebarHeader.appendChild(createElement('hr', {}, {
  width: '100%', // Added separating line
  margin: '5px 0',
  border: 'none',
  borderTop: '1px solid #ccc',
}));

sidebarHeader.appendChild(searchInput); // Added search input

let sidebarContent = createElement('ul', {}, {
  margin: '0',
  padding: '0'
});

sidebar.appendChild(sidebarHeader);
sidebar.appendChild(sidebarContent);

document.body.appendChild(sidebar);

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
  color: SIDEBAR_TEXT_COLOR,
  cursor: 'pointer',
  display: sidebar.style.left === '-' + SIDEBAR_WIDTH + 'px' ? 'block' : 'none'
});

showSidebarButton.textContent = SIDEBAR_TOGGLE;

showSidebarButton.addEventListener('click', function () {
  sidebar.style.left = '0px';
  showSidebarButton.style.display = 'none';
});

document.body.appendChild(showSidebarButton);

sidebar.addEventListener('transitionend', function () {
  if (sidebar.style.left === '-' + SIDEBAR_WIDTH + 'px') {
    showSidebarButton.style.display = 'block';
  }
});

updateSidebar();
