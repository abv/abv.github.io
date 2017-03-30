var morsecode_letter = '';
var morsecode_map = {
    ".-": "A",
    "-...": "B",
    "-.-.": "C",
    "-..": "D",
    ".": "E",
    "..-.": "F",
    "--.": "G",
    "....": "H",
    "..": "I",
    ".---": "J",
    "-.-": "K",
    ".-..": "L",
    "--": "M",
    "-.": "N",
    "---": "O",
    ".--.": "P",
    "--.-": "Q",
    ".-.": "R",
    "...": "S",
    "-": "T",
    "..-": "U",
    "...-": "V",
    ".--": "W",
    "-..-": "X",
    "-.--": "Y",
    "--..": "Z",
    "-----": "0",
    ".----": "1",
    "..---": "2",
    "...--": "3",
    "....-": "4",
    ".....": "5",
    "-....": "6",
    "--...": "7",
    "---..": "8",
    "----.": "9"
}

var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var log = function(msg) {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  var t = h + ":" + m + ":" + s;
  document.getElementById("log").value = (t + "\t" + msg + "\n") + document.getElementById("log").value;
}

var tracker = new tracking.ObjectTracker(['eye']);
// tracker.setInitialScale(4);
// tracker.setStepSize(2);
// tracker.setEdgesDensity(1);

var saw_eyes = false;
var closed_at = false;

var last_change = false;

var short_ms = 600;
var space_ms = 5000;

var space = function(diff){
  last_change = false;
  var letter = morsecode_map[morsecode_letter];
  if (letter) {
    document.getElementById("word").value += letter;
  }
  log("SPACE " + diff + " " + letter);
  morsecode_letter = '';
  document.getElementById("dots").value = morsecode_letter;
}

var del = function(){
  morsecode_letter = morsecode_letter.substring(0, morsecode_letter.length - 1);
  document.getElementById("dots").value = morsecode_letter;
}

var space_tracker = function(){
  if (last_change) {
    var now = new Date().getTime();
    var diff = now - last_change;
    document.getElementById("last_blink").value = diff + 'ms';
    if (diff >= space_ms) {
      space(diff);
    }
  }
  setTimeout(space_tracker, 100);
}
space_tracker();

tracker.on('track', function(event) {
    if (saw_eyes && !event.data.length) {
      saw_eyes = false;
      var now = new Date().getTime();
      closed_at = now;
      last_change = now;
    }
    if (event.data.length >= 2) {
      if (closed_at) {
        var now = new Date().getTime();
        last_change = now;
        var t = now - closed_at;
        var type = t <= short_ms ? '.' : '-';
        morsecode_letter += type;
        document.getElementById("dots").value = morsecode_letter;
        closed_at = false;
        log('blink opened ' + t + ' ' + type);
      }
      saw_eyes = true;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    event.data.forEach(function(rect) {
      context.strokeStyle = '#ffffff';
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
});

document.body.addEventListener('keypress', function (e) {
    if (e.key == " ") {
      e.preventDefault();
      space();
    }
});

document.body.addEventListener('keydown', function (e) {
    if (e.code == "Backspace") {
      e.preventDefault();
      del();
    }
});

tracking.track('#video', tracker, { camera: true });