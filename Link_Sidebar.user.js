// ==UserScript==
// @name         Link Sidebar
// @version      1.0
// @description  A Tampermonkey script that creates a sidebar for storing links with search functionality and resizable sidebar
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @icon         https://github.com/fatherxtreme123/Link-Sidebar/blob/main/icon.png?raw=true
// ==/UserScript==

const SIDEBAR_WIDTH = 200;
const SIDEBAR_TEXT_COLOR = '#fff'; // Set to white
const SIDEBAR_BACKGROUND_COLOR = '#000'; // Set to black
const SIDEBAR_TOGGLE = 'Toggle';
const SIDEBAR_ADD = '+';
const SIDEBAR_REMOVE = '-';
const SIDEBAR_EDIT = '✎';
const SIDEBAR_SEARCH = '🔍'; // Added search icon
const SIDEBAR_STORAGE = 'link_sidebar';

let sidebarWidth = SIDEBAR_WIDTH;

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

function getWebsiteName(url) {
  let urlObject = new URL(url);
  return urlObject.host;
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
    console.error('Failed to fetch page title:', error.message);
    return getWebsiteName(url);
  }
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

function closeSidebar() {
  if (iframe.style.left === '0px') {
    document.body.style.transition = 'margin-left 0.3s ease-in-out';
    document.body.style.marginLeft = '0';
    iframe.style.left = '-' + SIDEBAR_WIDTH + 'px';
    showSidebarButton.style.display = 'block';
  }
}

function openLinkInNewTab(url) {
  window.open(url, '_blank');
}

function createLinkClickHandler(link) {
  return function (event) {
    event.preventDefault();
    closeSidebar();
    openLinkInNewTab(link.url);
  };
}

function updateSidebar() {
  sidebarContent.innerHTML = '';
  let linkList = getLinkList();
  let searchInputValue = searchInput.value.toLowerCase();

  for (let i = 0; i < linkList.length; i++) {
    let link = linkList[i];
    let truncatedName = link.name.length > 3 ? link.name.substring(0, 3) + '...' : link.name;

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
        target: '_blank',
        title: link.name, // Add title attribute here
      }, {
        textDecoration: 'none',
        color: SIDEBAR_TEXT_COLOR,
      });
      linkElement.textContent = truncatedName;
      listItem.appendChild(linkElement);

      let removeButton = createElement('button', {
        title: 'Remove Link',
      }, {
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
        let confirmed = window.confirm('Are you sure you want to delete this link?');
        if (confirmed) {
          linkList.splice(i, 1);
          setLinkList(linkList);
          updateSidebar();
        }
      });

      listItem.appendChild(removeButton);

      let editButton = createElement('button', {
        title: 'Edit Link',
      }, {
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

      let upButton = createElement('button', {
        title: 'Move Link Up',
      }, {
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

      let downButton = createElement('button', {
        title: 'Move Link Down',
      }, {
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

      linkElement.addEventListener('click', createLinkClickHandler(link));

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

let iframe = document.createElement('iframe');
iframe.style.width = SIDEBAR_WIDTH + 'px';
iframe.style.height = '100%';
iframe.style.position = 'fixed';
iframe.style.top = '0';
iframe.style.left = '-' + SIDEBAR_WIDTH + 'px';
iframe.style.backgroundColor = SIDEBAR_BACKGROUND_COLOR;
iframe.style.zIndex = '9999';
iframe.style.transition = 'left 0.3s ease-in-out';
document.body.appendChild(iframe);

iframe.contentDocument.body.innerHTML = `
  <style>
    /* Add your styles here */
  </style>
  <div id="sidebar">
    <!-- Sidebar content goes here -->
  </div>
`;

let iframeSidebar = iframe.contentDocument.getElementById('sidebar');

let sidebarHeader = createElement('div', {}, {
  display: 'flex',
  flexDirection: 'column',
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

let sidebarToggle = createElement('button', {
  title: 'Toggle Sidebar',
}, {
  margin: '5px 0',
  padding: '0 5px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: '#ccc',
  color: SIDEBAR_TEXT_COLOR,
  cursor: 'pointer'
});
sidebarToggle.textContent = SIDEBAR_TOGGLE;
sidebarToggle.addEventListener('click', function () {
  if (iframe.style.left === '0px') {
    document.body.style.transition = 'margin-left 0.3s ease-in-out';
    document.body.style.marginLeft = SIDEBAR_WIDTH + 'px';
  } else {
    document.body.style.transition = 'margin-left 0.3s ease-in-out';
    document.body.style.marginLeft = '0';
  }

  iframe.style.left = iframe.style.left === '0px' ? '-' + SIDEBAR_WIDTH + 'px' : '0px';
});

let sidebarAdd = createElement('button', {
  title: 'Add Link',
}, {
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
    let loadingIndicator = createElement('span', {}, {
      marginLeft: '5px',
      color: '#ccc'
    });
    loadingIndicator.textContent = 'Loading...';
    sidebarAdd.appendChild(loadingIndicator);

    try {
      let linkName = await getWebpageTitle(linkUrl);

      if (!linkName) {
        linkName = 'Untitled Link';
      }

      let linkList = getLinkList();
      let link = {
        url: linkUrl,
        name: linkName
      };
      linkList.push(link);
      setLinkList(linkList);
      updateSidebar();
    } finally {
      loadingIndicator.remove();
    }
  }
});

let searchInput = createElement('input', {
  type: 'text',
  placeholder: 'Search',
  title: 'Search Links',
});
searchInput.addEventListener('input', updateSidebar);

let resizeHandle = createElement('div', {
  title: 'Resize Sidebar',
}, {
  width: '10px',
  height: '100%',
  position: 'absolute',
  top: '0',
  right: '0',
  cursor: 'ew-resize',
});

resizeHandle.addEventListener('mousedown', function(e) {
  e.preventDefault();

  let startX = e.pageX;

  function onMouseMove(event) {
    let delta = event.pageX - startX;
    sidebarWidth = Math.max(100, SIDEBAR_WIDTH + delta);
    updateWidth();
  }

  function onMouseUp(event) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

function updateWidth() {
  iframe.style.width = sidebarWidth + 'px';
  showSidebarButton.style.left = '-' + sidebarWidth + 'px';
}

let sidebarContent = createElement('ul', {}, {
  margin: '0',
  padding: '0'
});

iframeSidebar.appendChild(resizeHandle);

sidebarHeader.appendChild(sidebarTitle);
sidebarHeader.appendChild(sidebarToggle);
sidebarHeader.appendChild(sidebarAdd);
sidebarHeader.appendChild(createElement('hr', {}, {
  width: '100%',
  margin: '5px 0',
  border: 'none',
  borderTop: '1px solid #ccc',
}));

sidebarHeader.appendChild(searchInput);

iframeSidebar.appendChild(sidebarHeader);
iframeSidebar.appendChild(sidebarContent);

let showSidebarButton = createElement('button', {
  title: 'Toggle Sidebar',
}, {
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
  display: iframe.style.left === '-' + SIDEBAR_WIDTH + 'px' ? 'block' : 'none'
});

showSidebarButton.textContent = SIDEBAR_TOGGLE;

showSidebarButton.addEventListener('click', function () {
  if (iframe.style.left === '-' + SIDEBAR_WIDTH + 'px') {
    document.body.style.transition = 'margin-left 0.3s ease-in-out';
    document.body.style.marginLeft = SIDEBAR_WIDTH + 'px';
  } else {
    document.body.style.transition = 'margin-left 0.3s ease-in-out';
    document.body.style.marginLeft = '0';
  }

  iframe.style.left = '0px';
  showSidebarButton.style.display = 'none';
});

document.body.appendChild(showSidebarButton);

iframe.addEventListener('transitionend', function () {
  if (iframe.style.left === '-' + SIDEBAR_WIDTH + 'px') {
    showSidebarButton.style.display = 'block';
    document.body.style.marginLeft = '0px';
  } else {
    showSidebarButton.style.display = 'none';
  }
});

showSidebarButton.style.background = 'rgba(204, 204, 204, 0.5)';

showSidebarButton.addEventListener('mouseenter', () => {
  showSidebarButton.style.background = 'rgb(204, 204, 204)';
});

showSidebarButton.addEventListener('mouseleave', () => {
  showSidebarButton.style.background = 'rgba(204, 204, 204, 0.5)';
});

updateSidebar();
