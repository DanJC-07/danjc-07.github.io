const path = '/styles/templates/';
const styles = '/styles/';
const scripts = '/_scripts/'
document.addEventListener("DOMContentLoaded", function () {
    addMeta();
    var headerInject = new XMLHttpRequest();
    var sideBarInject = new XMLHttpRequest();
    var footerInject = new XMLHttpRequest();
    var pageOrigin = window.location.pathname.split("/");
    pageOrigin[0] = window.location.host;
    var configLoc = `/${pageOrigin[1]}/${pageOrigin[2]}/config.json`;
    console.log(configLoc);

    // Function to add metadata to html
    function addMeta() {
        const head = document.querySelector('head');
        var googleFont = document.createElement('link');
        var themeTrigger = document.createElement('script');
        googleFont.rel = "stylesheet";
        googleFont.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0";
        themeTrigger.src = `${scripts}wiki_themeMgr.js`;
        head.appendChild(themeTrigger);
        head.appendChild(googleFont);
    }

    // Function to handle JSON config file
    function JSONnavLinks() {
        const navPanel = document.querySelector('.wiki-nav__main');
        fetch(configLoc)
            .then(response => response.json())
            .then(data => {
                var pages = data.pages;
                var repo = data.repo;
                var repoIconPath = data.repoIcon;
                const repoIcon = document.querySelector('.wiki-nav-header__icon');
                repoIcon.src = repoIconPath;
                repoIcon.alt = repo;
                for (var group in pages) {
                    var groupElement = document.createElement('div');
                    var groupTitle = document.createElement('div');
                    var groupLinks = pages[group];
                    groupElement.classList.add('wiki-nav-item-group');
                    groupTitle.classList.add('wiki-nav-group__title');
                    groupTitle.textContent = group;
                    navPanel.appendChild(groupElement);
                    groupElement.appendChild(groupTitle);
                    for (var link in groupLinks) {
                        var linkElement = document.createElement('a');
                        linkElement.href = `${window.location.origin}/${pageOrigin[1]}/${pageOrigin[2]}/${groupLinks[link]}`
                        linkElement.classList.add('wiki-nav-item');
                        if (`/${pageOrigin[1]}/${pageOrigin[2]}/${groupLinks[link]}` == window.location.pathname ||
                            `/${pageOrigin[1]}/${pageOrigin[2]}/${groupLinks[link]}` == `${window.location.pathname}index.html`) {
                            linkElement.classList.add('current-page');
                            document.title = `${link} - ${repo} Wiki | itsdanjc.com Documentation`
                        }
                        linkElement.textContent = link;
                        groupElement.appendChild(linkElement);
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching the JSON file:', error);
            });
    }

    // Function to handle injection failure
    function handleInjectionError(xhr, elementType) {
        console.error(`${elementType} Failed to inject, Ready State: ${xhr.readyState}, Status: ${xhr.status}.`);
    }

    // Header injection
    headerInject.open('GET', `${path}header.html`, true);
    headerInject.onreadystatechange = function () {
        if (headerInject.readyState === 4) {
            if (headerInject.status === 200) {
                var existingHeader = document.querySelector(".wiki-container");
                if (existingHeader) {
                    console.log(`header Injected Successfully`);
                    var newElement = document.createElement("header");
                    newElement.classList.add(`wiki-${"header"}-container`)
                    newElement.innerHTML = headerInject.responseText;
                    existingHeader.parentNode.insertBefore(newElement, existingHeader);
                } else {
                    handleInjectionError(headerInject, "Header");
                }
            } else {
                handleInjectionError(headerInject, "Header");
            }
        }
    };

    // Sidebar injection
    sideBarInject.open('GET', `${path}nav.html`, true);
    sideBarInject.onreadystatechange = function () {
        if (sideBarInject.readyState === 4) {
            if (sideBarInject.status === 200) {
                var existingSidebar = document.querySelector(".wiki-content-area");
                if (existingSidebar) {
                    console.log(`nav Injected Successfully`);
                    var newElement = document.createElement("nav");
                    newElement.classList.add(`wiki-nav-container`);
                    newElement.innerHTML = sideBarInject.responseText;
                    existingSidebar.parentNode.insertBefore(newElement, existingSidebar);
                    adjustSidebarHeight()
                } else {
                    handleInjectionError(sideBarInject, "Sidebar");
                }
            } else {
                handleInjectionError(sideBarInject, "Sidebar");
            }
        }
    };

    // Footer injection
    footerInject.open('GET', `${path}footer.html`, true);
    footerInject.onreadystatechange = function () {
        if (footerInject.readyState === 4) {
            if (footerInject.status === 200) {
                var existingFooter = document.querySelector(".wiki-container");
                if (existingFooter) {
                    console.log(`footer Injected Successfully`);
                    var newElement = document.createElement("footer");
                    newElement.classList.add(`wiki-footer-container`);
                    newElement.innerHTML = footerInject.responseText;
                    existingFooter.parentNode.insertBefore(newElement, existingFooter.nextSibling);
                } else {
                    handleInjectionError(footerInject, "Footer");
                }
            } else {
                handleInjectionError(footerInject, "Footer");
            }
        }
    };

    headerInject.send();
    sideBarInject.send();
    footerInject.send();

    // Function to adjust sidebar height
    function adjustSidebarHeight() {
        const windowHeight = window.innerHeight;
        const headerHeight = getComputedStyle(document.querySelector('header')).height;
        const nav = document.querySelector('.wiki-nav');
        if (nav) {
            var height = windowHeight - parseInt(headerHeight) + 'px'; // Convert headerHeight to number
            nav.style.height = height;
            JSONnavLinks()
        } else {
            console.error("Sidebar element not found.");
        }
    }

    window.addEventListener('scroll', function () {
        const navContainer = document.querySelector('.wiki-nav-container');
        const body = document.querySelector('body');
        const nav = document.querySelector('.wiki-nav');
        const header = document.querySelector('header');

        if (!nav || !header) {
            console.error("Navigation or header element not found!");
            return; // exit early if required elements are not found
        }

        const viewportHeight = window.innerHeight;
        const headerRect = header.getBoundingClientRect();
        const visibleHeaderHeight = Math.max(0, headerRect.bottom);
        const containerHeight = navContainer.offsetHeight;
        const remainingContainerHeight = containerHeight - window.scrollY + header.offsetHeight;

        if (visibleHeaderHeight > 0) {
            const visibleHeight = viewportHeight - visibleHeaderHeight;
            nav.style.height = visibleHeight + 'px';
        } else if (viewportHeight > remainingContainerHeight) {
            nav.style.height = remainingContainerHeight + 'px';
        } else {
            nav.style.height = '100vh';
        }
    });
});
