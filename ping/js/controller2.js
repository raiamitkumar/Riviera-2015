if (typeof(AN) === "undefined") {
    var AN = {}
}
AN.instances = {
    symbols: [],
    controllers: []
};
AN.apiVersion = 1;
AN.Controller = function() {
    return {
        currentScene: false,
        userData: {},
        setConfig: function(a) {
            AN.instances.controllers.push(this);
            this.events = a.events;
            this.prefix = a.cssPrefix;
            this.projectActions = a.projectActions;
            this.basePath = a.basePath ? a.basePath : "";
            this.olElement = document.querySelector("#" + a.parentId + " ol");
            var d = this.olElement.children;
            this.useOrmma = a.ormma;
            this.scenes = [];
            this.scenesById = {};
            this.sceneByName = {};
            var g;
            for (var e = 0; e < a.scenes.length; e++) {
                g = a.scenes[e];
                g.element = d[e];
                g.timelinesById = {};
                g.timelinesByName = {};
                for (var c = 0; c < g.timelines.length; c++) {
                    g.timelinesById[g.timelines[c].id] = g.timelines[c];
                    g.timelinesByName[g.timelines[c].name] = g.timelines[c]
                }
                this.scenesById[g.id] = g;
                this.scenes.push(g);
                if (g.name) {
                    this.sceneByName[g.name] = g
                }
            }
            this.setupListeners();
            this.startSceneByName = this.goToSceneByName;
            this.startSceneById = this.goToSceneById;
            this.startSceneByID = this.startSceneById;
            this.symbolInstancesByHtmlId = {};
            this.symbolInstancesById = {};
            this.symbols = [];
            var h, b, f;
            for (var e = 0; e < a.symbols.length; e++) {
                h = a.symbols[e];
                this.symbolInstancesById[h.id] = [];
                b = this.olElement.querySelectorAll(".an-symbol-container-" + h.id);
                for (var c = 0; c < b.length; c++) {
                    f = new AN.Symbol();
                    f.setConfig(b[c], h, this);
                    this.symbolInstancesByHtmlId[b[c].id] = f;
                    this.symbolInstancesById[h.id].push(f);
                    this.symbols.push(f)
                }
            }
            this.fireAction(this.projectActions, "init");
            this.goToScene(this.scenes[0])
        },
        setupListeners: function() {
            var l = this;
            this.browser = "unknown";
            if (document.body.style.MozAnimationName !== undefined) {
                this.browser = "moz"
            }

            function h(j) {
                var i;
                if (l.browser === "moz") {
                    i = j.target;
                    while (i = i.parentNode) {
                        if (i === l.currentScene.element) {
                            l.onAnimationEnd();
                            return
                        }
                    }
                } else {
                    l.onAnimationEnd()
                }
            }
            this.olElement.addEventListener("webkitAnimationEnd", h, false);
            this.olElement.addEventListener("animationend", h, false);

            function c(i) {
                i.element.addEventListener("mousemove", function(j) {
                    i.mousemoveAction.call(l.userData, l, j)
                }, false)
            }
            var g;
            for (var e = 0; e < this.scenes.length; e++) {
                g = this.scenes[e];
                if (g.mousemoveAction) {
                    c(g)
                }
            }

            function a(m, j, i) {
                m.addEventListener(j, function(n) {
                    i.call(l.userData, l, n)
                }, false)
            }
            var f, b, k;
            for (var e = 0; e < this.events.length; e++) {
                b = this.events[e];
                k = b.type;
                f = document.getElementById(b.id);
                for (var d = 0; d < k.length; d++) {
                    a(f, k[d], b.handler)
                }
            }
        },
        onAnimationEnd: function() {
            this.runningAnimationCount--;
            if (this.runningAnimationCount === 0) {
                this.onAllAnimationEnd()
            }
        },
        onAllAnimationEnd: function() {
            var a = this.currentScene.currentTimeline.endWaitTime;
            if (a) {
                var b = this;
                this.sceneTimeout = setTimeout(function() {
                    b.onSceneFinish()
                }, a * 1000)
            } else {
                this.onSceneFinish()
            }
        },
        forceRefresh: function(a) {
            this.forceRefreshValue = a.element.offsetHeight
        },
        fireAction: function(b, a) {
            if (b && b[a]) {
                b[a].call(this.userData, this)
            }
        },
        getSymbolByHtmlId: function(a) {
            return this.symbolInstancesByHtmlId[a]
        },
        getSymbolByInstanceId: function(b) {
            var a = this.olElement.querySelector(".an-symbol-container.an-symbol-" + b);
            return this.getSymbolByHtmlId(a.id)
        },
        getSymbols: function() {
            return this.symbols
        },
        getSymbolsBySymbolMasterId: function(a) {
            return this.symbolInstancesById[a]
        },
        getUserData: function() {
            return this.userData
        },
        getTimelineByIndex: function(a) {
            return this.currentScene.timelines[a]
        },
        getTimelineById: function(a) {
            return this.currentScene.timelinesById[a]
        },
        getTimelineByName: function(a) {
            return this.currentScene.timelinesByName[a]
        },
        getCurrentTimeline: function() {
            return this.currentScene.currentTimeline
        },
        getCurrentScene: function() {
            return this.currentScene
        },
        getSceneByIndex: function(a) {
            return this.scenes[a]
        },
        getSceneById: function(a) {
            return this.scenesById[a]
        },
        getSceneByName: function(a) {
            return this.sceneByName[a]
        },
        goToNextTimeline: function() {
            var b = this.currentScene.timelines.indexOf(this.currentScene.currentTimeline);
            var a = Math.min(b + 1, this.currentScene.timelines.length - 1);
            if (a === b) {
                return
            }
            this.goToTimelineByIndex(a)
        },
        goToPreviousTimeline: function() {
            var b = this.currentScene.timelines.indexOf(this.currentScene.currentTimeline);
            var a = Math.max(b - 1, 0);
            if (b === a) {
                return
            }
            this.goToTimelineByIndex(a)
        },
        goToTimelineById: function(a) {
            this.goToScene(this.currentScene, this.currentScene.timelinesById[a])
        },
        goToTimelineByName: function(a) {
            this.goToScene(this.currentScene, this.currentScene.timelinesByName[a])
        },
        goToTimelineByIndex: function(a) {
            this.goToScene(this.currentScene, this.currentScene.timelines[a])
        },
        goToTimeline: function(a) {
            this.goToScene(this.currentScene, a)
        },
        goToNextScene: function() {
            var b = this.scenes.indexOf(this.currentScene);
            var a = Math.min(b + 1, this.scenes.length - 1);
            if (b === a) {
                return
            }
            this.goToSceneByIndex(a)
        },
        goToPreviousScene: function() {
            var a = this.scenes.indexOf(this.currentScene);
            var b = Math.max(a - 1, 0);
            if (a === b) {
                return
            }
            this.goToSceneByIndex(b)
        },
        goToSceneByIndex: function(a) {
            this.goToScene(this.scenes[a])
        },
        goToSceneByName: function(a) {
            this.goToScene(this.sceneByName[a])
        },
        goToSceneById: function(a, b) {
            var c = this.scenesById[a];
            this.goToScene(c, c.timelinesById[b])
        },
        goToScene: function(g, f) {
            var d = g;
            var e = this.currentScene;
            var a = f;
            var c = e ? e.currentTimeline : false;
            if (a === undefined) {
                a = d.timelines[0]
            }
            var b = false;
            if (c === a && e === d) {
                b = true
            } else {
                if (e) {
                    e.element.setAttribute("class", "")
                }
            }
            this.fireAction(c, "exitAction");
            clearTimeout(this.sceneTimeout);
            if (e !== d) {
                this.fireAction(e, "exitAction");
                this.fireAction(d, "initAction")
            }
            this.fireAction(a, "initAction");
            this.runningAnimationCount = a.animationCount;
            this.currentScene = d;
            d.currentTimeline = a;
            var h = "t-" + a.id;
            if (b || this.browser === "moz") {
                d.element.setAttribute("class", "run restart " + h);
                this.forceRefresh(d)
            }
            d.element.setAttribute("class", "run " + h);
            if (!b && this.useOrmma) {
                this.ormmaNextScene(d)
            }
            this.fireAction(a, "startAction");
            if (a.animationCount === 0) {
                this.onAllAnimationEnd()
            }
        },
        replayScene: function() {
            console.warn("replayScene is deprecated. Use restartScene instead.");
            this.restartScene()
        },
        restartScene: function() {
            this.goToScene(this.currentScene)
        },
        restartTimeline: function() {
            this.goToScene(this.currentScene, this.currentScene.currentTimeline)
        },
        onSceneFinish: function() {
            this.fireAction(this.currentScene.currentTimeline, "endAction")
        },
        goToURL: function(a) {
            document.location.href = a
        },
        getElementById: function(a) {
            return document.getElementById(this.getElementIdById(a))
        },
        getElementIdById: function(a) {
            return this.prefix + a
        },
        getUrlForLocalAsset: function(b) {
            var a = "assets/" + b;
            if (this.basePath) {
                a = this.basePath + "/" + a
            }
            return a
        },
        ormmaNextScene: function(c) {
            var a = ormma.getState();
            if (c.dimensions.expanded) {
                var i = ormma.getMaxSize();
                if (a !== "expanded") {
                    ormma.expand({
                        x: 0,
                        y: 0,
                        width: i.width,
                        height: i.height
                    })
                }
                var b = "";
                var d = c.element.offsetHeight;
                var g = c.element.offsetWidth;
                var e = (i.height - d) / 2;
                var h = (i.width - g) / 2;
                b += " translate3d(" + Math.round(h) + "px," + Math.round(e) + "px,0)";
                if (c.dimensions.fit) {
                    var f = Math.min(i.width / g, i.height / d);
                    b += " scale3d(" + f + "," + f + ",1)"
                }
                c.element.style.webkitTransform = b
            } else {
                if (a === "expanded") {
                    ormma.close()
                }
                ormma.resize(c.dimensions.width, c.dimensions.height)
            }
        }
    }
};
window.addEventListener('load', function() {
    var configData = {
        parentId: 'ban-anim',
		
        cssPrefix: '',
        ormma: false,
        mraid: false,
        layout: {
            "type": "absolute",
            "width": 480,
            "height": 320
        },
        scenes: [{
            id: 0,
            dimensions: {
                height: 100,
                width: 100,
                expanded: false,
                fit: false
            },
            timelines: [{
                id: "0",
                name: 'Timeline 1',
                animationCount: 5,
                duration: 0.647,
                lastKeyframeTime: 1.019
            }]
        }],
        symbols: [],
        projectActions: {},
        events: [],
        externalResources: []
    };
    setTimeout(function() {
        var controller = new AN.Controller;
        controller.setConfig(configData);
    }, 0);
}, false);