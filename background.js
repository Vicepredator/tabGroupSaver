class Handler {
    constructor() {
        this.oldgroupsID;
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
        this.OldgroupsID.forEach((group) => {
            var indexes = {};
            this.tabsOld.forEach(tab => {
                if (tab.groupId == "") {} else if (group.groupId === tab.groupId) {
                    indexes += tab.index;
                }
            });
            var toGroup = {};
            this.tabsCreated.forEach(tNew => {
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

var isPaused = false;

this.handler = new Handler();


function waitForIt() {
    console.log(this.isPaused);
    if (isPaused) {
        console.log("Aspettando");
        setTimeout(function() { waitForIt() }, 100);
    } else {
        console.log('fatto');
        console.log("Grouping started");
        this.handler.grouper();
        console.log("Grouping ended");
    };
}

function groupSetup(groups) {
    console.log(groups);
    this.handler.setOldgroupsID(groups);
    console.log('Retrieved groups');
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
            console.log("Added");
        });
    });
    console.log("Finish");
    this.handler.setTabsCreated(tabsCreated);
    console.log('Retrieved tabs');
    isPaused = false;
}

function setup() {
    isPaused = true;
    waitForIt();
    console.log('Retiving groups');
    chrome.storage.local.get(['groups'], ({ groups }) => {
        groupSetup(groups);
    });
    console.log('Retiving tabs');
    chrome.storage.local.get(['tabs'], ({ tabs }) => {
        tabsSetup(tabs);
    });
}

chrome.windows.onCreated.addListener(() => {
    console.log("Setup started");
    setup();
    console.log("Setup ended");
});

chrome.tabGroups.onCreated.addListener(() => {
    this.handler.getGroupsAndTabs();
});

chrome.tabGroups.onUpdated.addListener(() => {
    this.handler.getGroupsAndTabs();
});