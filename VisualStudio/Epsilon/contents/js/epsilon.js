// This is whare common functions should go
var db = getLocalStorage() || dispError('Local Storage not supported!');
var session = new Session();

function Session() {
    this.Session = null;
    this.StroageName = "Session";
    this.SessionExists = function(){

        if (db.getItem(this.StroageName) == null || db.getItem(this.StroageName) == undefined) {
            return false;
        }
        return true;
    };
    this.Load = function () {
        if (this.SessionExists()) {
            var ob = db.getItem(this.StroageName);
            ob = JSON.parse(ob);
            this.Session = ob;
            return true;
        }
        return false;
    };
    this.Save = function () {
        try {
            var ob = JSON.stringify(this.Session);
            db.setItem(this.StroageName, ob);
            return true;
        }
        catch (e) {
            return false;
        };        
    };
    this.Export = function () {

    };
    this.EndSession = function () {

    };
    this.ClearSession = function () {
        try{
            this.Session = null;
            db.removeItem(this.StroageName);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    this.CreateSession = function () {
        var Session = {};
        Session.ID = 0;
        Session.Date = new Date();
        Session.Child = {};
        Session.Supervisor = {};
        Session.Levels = [];
        this.Session = Session;
    };
    this.SetSessionInfo = function (ID, Date) {
        this.Session.ID = ID;
        this.Session.Date = Date;
    };
    this.SetChild = function (Child) {
        this.Session.Child = Child;
    };
    this.CreateChild = function (ID, Age) {
        var Child = {};
        Child.ID = ID;
        Child.Age = Age;
        return Child;
    };
    this.SetSupivisor = function (Supervisor) {
        this.Session.Supervisor = Supervisor;
    };
    this.CreateSupervisor = function (ID) {
        var Supervisor = {};
        Supervisor.ID = ID;
        return Supervisor;
    };
    this.SetUpLevels = function () {
        this.AddLevel(this.CreateLevel(1, "Level 1"));
        this.AddLevel(this.CreateLevel(2, "Level 2"));
        this.AddLevel(this.CreateLevel(3, "Level 3"));
    };
    this.AddLevel = function (Level) {
        this.Session.Levels.push(Level);
    };
    this.CreateLevel = function (ID, Name) {
        var Level = {};
        Level.ID = ID;
        Level.Name = Name;
        Level.SubLevels = [];
        return Level;
    };
    this.AddSubLevel = function (SubLevel, LevelID) {
        for (var i = 0; i < this.Session.Levels.length; i++) {
            var Level = this.Session.Levels[i];
            if (Level.ID == LevelID) {
                Level.SubLevels.push(SubLevel);
                return true;
            }
        }
        return false;
    };
    this.CreateSubLevel = function (Name) {
        var SubLevel = {};
        SubLevel.Name = Name;
        SubLevel.StartTime = new Date();
        SubLevel.EndTime = null;
        SubLevel.Success = null;
        SubLevel.Movements = [];
        return SubLevel;
    };
    this.SetSubLevelDetails = function (SubLevel, StartTime, EndTime, Success) {
        SubLevel.StartTime = StartTime;
        SubLevel.EndTime = EndTime;
        SubLevel.Success = Success;
    };
    this.AddMovement = function (SubLevel , Movement) {
        SubLevel.Movements.push(Movement);
    };
    this.CreateMovement = function (StartTime, EndTime, ImageID, From , Too, Failed) {
        var Movement = {};
        Movement.StartTime = StartTime;
        Movement.EndTime = EndTime;
        Movement.ImageID = ImageID;
        Movement.From = From;
        Movement.Too = Too;
        Movement.Failed = Failed;
        return Movement;
    };
}

function getLocalStorage() {
    try {
        if ( !! window.localStorage ) return window.localStorage;
        else return undefined;
    } catch (e) {
        return undefined;
    }
}

function parseURLParams(url) {
    var i, n, nv, pairs, parms, query, queryEnd, queryStart, v;
    queryStart = url.indexOf("?") + 1;
    queryEnd = url.indexOf("#") + 1 || url.length + 1;
    query = url.slice(queryStart, queryEnd - 1);
    pairs = query.replace(/\+/g, " ").split("&");
    parms = {};
    i = void 0;
    n = void 0;
    v = void 0;
    nv = void 0;
    if (query === url || query === "") {
        return parms;
    }
    i = 0;
    while (i < pairs.length) {
        nv = pairs[i].split("=");
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);
        if (!parms.hasOwnProperty(n)) {
            parms[n] = [];
        }
        parms[n].push((nv.length === 2 ? v : null));
        i++;
    }
    return parms;
};