class Handler {
    constructor(a) {
        this.oldgroupsID = a;
        this.tabsOld;
        this.tabsCreated;
    };

    setOldgroupsID(v) {
        this.OldgroupsID = v;
    }

    setTabsOld(v) {
        this.tabsOld = v;
    }

    setTabsCreated(v) {
        this.tabsCreated = v;
    }

    getGroupsAndTabs() {
        chrome.tabGroups.query({}, (groups) => {
            chrome.storage.local.set({ groups });
        });
        chrome.tabs.query({}, (tabs) => {
            chrome.storage.local.set({ tabs });
        });
    }

    grouper() {
        console.log("Paused");
        this.OldgroupsID.forEach((group) => {
            var indexes = {};
            tabsOld.forEach(tab => {
                if (tab.groupId == "") {} else if (groups.groupId === tab.groupId) {
                    indexes += tab.index;
                }
            });
            var toGroup = {};
            tabsCreated.forEach(tNew => {
                indexes.forEach(i => {
                    if (i === tNew) {
                        toGroup += tNew.TAB_ID_NONE;
                    }
                });
            });
            chrome.tabs.group({ "title": group.title, "color": group.color, "collapsed": group.collapsed }, toGroup);
        });
    }
};

isPaused = false;

this.handler = new Handler();

function groupSetup(groups) {
    console.log(groups);
    this.handler.setOldgroupsID(groups);
}

function tabsSetup(tabs) {
    this.handler.setTabsOld(tabs);
    var tabsCreated;
    tabs.forEach(element => {
        createProperty = {
            "active": element.active,
            "index": element.index,
            "pinned": element.pinned,
            "url": element.url,
        }
        chrome.tabs.create(createProperty, (tab) => {
            tabsCreated += tab;
        });
    });
    this.handler.setTabsCreated(tabsCreated);
    console.log('salve');
    isPaused = false;
}

function setup() {
    isPaused = true;
    chrome.storage.local.get(['groups'], ({ groups }) => {
        groupSetup(groups);
    });
    chrome.storage.local.get(['tabs'], ({ tabs }) => {
        tabsSetup(tabs);
    });
}

chrome.windows.onCreated.addListener(() => {
    console.log(isPaused);
    setup();

    function waitForIt() {
        if (isPaused) {
            console.log(isPaused);
            setTimeout(function() { waitForIt() }, 100);
        } else {
            console.log('fatto');
            this.handler.grouper();
        };
    }
});

chrome.tabGroups.onCreated.addListener(() => {
    this.handler.getGroupsAndTabs();
});

chrome.tabGroups.onUpdated.addListener(() => {
    this.handler.getGroupsAndTabs();
});