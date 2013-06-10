"use strict";

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
            document.getElementById(that.id).innerHTML = 'EXPIRED!';

            return;
        }
        var hours = Math.floor((distance % that.day) / that.hour),
            minutes = Math.floor((distance % that.hour) / that.minute),
            seconds = Math.floor((distance % that.minute) / that.second),
            string = hours + 'hrs ' + minutes + 'mins ' + seconds + 'secs';

        document.getElementById(that.id).innerHTML = string;
    },
    calculateDate: function (hour, minute, tomorrow) {
        var now = new Date(),
            day = (tomorrow === 0) ? now.getDate() : now.getDate() +1,
            result = new Date(now.getFullYear(), now.getMonth(), day, hour, minute);
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
        storage: window.localStorage,
        fieldH: document.getElementById('myHour'),
        fieldM: document.getElementById('myMinute')
    },
    getFeierabend: function () {
        var that = feierabend.config,
            time = that.storage.getItem(that.title);
        if (time === null) {
            that.storage.setItem(that.title, that.defaults.hour + ':' + that.defaults.minute);
            return [that.defaults.hour, that.defaults.minute];
        }
        else {
            return time.split(':');
        }
    },
    setFeierabend: function (feierabend) {
        var that = feierabend.config;
        that.storage.setItem(that.title, feierabend);
    },
    fillForm: function (time) {
        var that = feierabend.config;
        that.fieldH.value = time[0];
        that.fieldM.value = time[1];
    },
    processForm: function(e) {
        e.preventDefault();
        e.stopPropagation();
        var that = feierabend.config,
            h = that.fieldH.value,
            m = that.fieldM.value;
        that.storage.setItem(that.title, h + ':' + m);
        countdown.stop();
        countdown.init(h, m, 0, 'countdown');
    },
    init: function () {
        addEvent(document.forms.feierabend, 'submit', feierabend.processForm);
        var time = feierabend.getFeierabend();
        feierabend.fillForm(time);
        countdown.init(time[0], time[1], 0, 'countdown');
    }
};

if ('localStorage' in window) {
    feierabend.init();
}
else {
    document.getElementById('countdown').innerHTML = 'handy zu alt.';
}