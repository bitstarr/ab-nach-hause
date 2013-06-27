"use strict";

var lang = 'de';

// event management by John Resig - http://ejohn.org/projects/flexible-javascript-events/
function addEvent( obj, type, fn ) {
    if ( obj.attachEvent ) {
        obj['e'+type+fn] = fn;
        obj[type+fn] = function(){obj['e'+type+fn]( window.event );};
        obj.attachEvent( 'on'+type, obj[type+fn] );
    } else {
        obj.addEventListener( type, fn, false );
    }
}
function removeEvent( obj, type, fn ) {
    if ( obj.detachEvent ) {
        obj.detachEvent( 'on'+type, obj[type+fn] );
        obj[type+fn] = null;
    } else {
        obj.removeEventListener( type, fn, false );
    }
}

// sweet js for leading zero
Number.prototype.pad = function(n) {
    return ('0000000000' + this).slice((n || 2) * -1);
};

var countdown = {
    config: {
        end: new Date(),
        id: '',
        second: 1000,
        minute: 60000,
        hour: 3600000,
        day: 86400000,
        timer: {}
    },
    showRemaining: function() {
        var that = countdown.config,
            now = new Date(),
            distance = that.end - now;
        if (distance < 0) {

            clearInterval(that.timer);
            document.getElementById(that.id).innerHTML = l10n[lang].expired;

            return;
        }
        var hours = Math.floor((distance % that.day) / that.hour),
            minutes = Math.floor((distance % that.hour) / that.minute),
            seconds = Math.floor((distance % that.minute) / that.second),
            string = '<span class="flip">' + hours.pad() + '</span> ';
            string+= '<span class="flip">' + minutes.pad() + '</span> ';
            string+= '<span class="flip">' + seconds.pad() + '</span>';

        document.getElementById(that.id).innerHTML = string;
    },
    calculateDate: function (hour, minute, tomorrow) {
        if (typeof(tomorrow) === 'boolean') {
            tomorrow = tomorrow.toString();
        }
        var now = new Date(),
            day = (tomorrow === 'false') ? now.getDate() : now.getDate() +1,
            result = new Date(now.getFullYear(), now.getMonth(), day, hour, minute);
            //document.getElementById('debug').innerHTML = typeof(tomorrow) + '/' + now.getDate() + '/' + day;
        return result;
    },
    stop: function () {
        clearInterval(countdown.config.timer);
    },
    init: function(hour, minute, tomorrow, id) {
        this.config.end = this.calculateDate(hour, minute, tomorrow);
        this.config.id = id;
        this.config.timer = setInterval(this.showRemaining, 1000);
    }
};

var feierabend = {
    config : {
        title: 'feierabend',
        defaults : {
            hour: '17',
            minute: '00'
        },
        storage: window.localStorage || false,
        fieldH: document.getElementById('myHour'),
        fieldM: document.getElementById('myMinute'),
        fieldT: document.getElementById('tomorrow')
    },
    getFeierabend: function () {
        var that = feierabend.config,
            time = that.storage.getItem(that.title),
            tomorrow = that.storage.getItem(that.title + 'Tomorrow') || 'false',
            output;
        if (time === null) {
            that.storage.setItem(that.title, that.defaults.hour + ':' + that.defaults.minute);
            output = [that.defaults.hour, that.defaults.minute];
        }
        else {
            output = time.split(':');
        }
        output.push(tomorrow);
        return output;

    },
    setFeierabend: function (time, tomorrow) {
        var that = feierabend.config;
        that.storage.setItem(that.title, time[0] + ':' + time[1]);
        that.storage.setItem(that.title + 'Tomorrow', tomorrow);
    },
    fillForm: function (saveData) {
        var that = feierabend.config;
        that.fieldH.value = saveData[0];
        that.fieldM.value = saveData[1];
        that.fieldT.checked = (saveData[2] === 'true') ? true : false;
    },
    processForm: function(e) {
        e.preventDefault();
        e.stopPropagation();
        if ('vibrate' in navigator) {
            navigator.vibrate(100);
        }
        var that = feierabend.config;
        feierabend.setFeierabend([that.fieldH.value, that.fieldM.value], that.fieldT.checked);
        countdown.stop();
        countdown.init(that.fieldH.value, that.fieldM.value, that.fieldT.checked, 'countdown');
    },
    init: function () {
        addEvent(document.forms.feierabend, 'submit', feierabend.processForm);
        var saveData = feierabend.getFeierabend();
        feierabend.fillForm(saveData);
        countdown.init(saveData[0], saveData[1], saveData[2], 'countdown');
    }
};

if ('localStorage' in window) {
    feierabend.init();
}
else {
    document.getElementById('countdown').innerHTML = l10n[lang].noStorage;
}


var installBtn = document.getElementById('install-btn');

if(installBtn) {
    
    installBtn.style.display = 'none';
    
    // If you want an installation button, add this to your HTML:
    //
    // <button id="install-btn">Install</button>
    //
    // This code shows the button if the apps platform is available
    // and this app isn't already installed.
    if(navigator.mozApps) {

        installBtn.addEventListener('click', function() {
            navigator.mozApps.install(location.href + 'manifest.webapp');
        }, false);

        var req = navigator.mozApps.getSelf();
        req.onsuccess = function() {
            if(!req.result) {
                installBtn.style.display = 'block';
            }
        };

    }
}