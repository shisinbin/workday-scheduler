// constants - their total should not be >=24
// so if I introduced a feature that allowed user to set these values
// then I'd need to have this check somewhere
const WORK_HOURS = 9; // upping this to 9 so that I get a row for 5pm
const START_TIME = 9;

// audio stuff for feedback
var successSfx = new Audio('./assets/sfx/powerup-success.wav');
var trashSfx = new Audio('./assets/sfx/trash-fall.wav');
// var failureSfx = new Audio('.assets/sfx/failure-01.wav');

// grab html elements
var currentDayEl = $('#current-day');
var scheduleEl = $('main');
var clearScheduleBtn = $('#clear-schedule');
var feedbackEl = $('.feedback');

// global schedule object for tracking stored events
var schedule = {};

// moment stuff
var rightNow = moment();
var thisHour = Number(rightNow.format('H')); // get the 'military' hour

// display current date at top of page
currentDayEl.text(rightNow.format('dddd, MMMM Do'));

// function to deal with feedback
function showFeedback(message) {
  feedbackEl.css('display', ''); // show feedback element
  feedbackEl.append(message); // need to append to get code tags to work

  // a timeout to hide the message after 2 secs
  setTimeout(function () {
    feedbackEl.empty();
    feedbackEl.css('display', 'none');
  }, 2000);
}

// function to return context for each hour
function getContext(scheduleHour) {
  if (thisHour > scheduleHour) {
    return 'past';
  } else if (thisHour === scheduleHour) {
    return 'present';
  } else {
    return 'future';
  }
}

// function to clear schedule
function clearSchedule() {
  schedule = {};
  localStorage.removeItem('schedule');
  for (var i = 0; i < WORK_HOURS; i++) {
    // empty textarea's
    $('.row').children('textarea').val('');
  }
}

// helper function for storing to local
function updateStorage(obj) {
  localStorage.setItem('schedule', JSON.stringify(obj));
}

// function for creating the layout
function createLayout() {
  // for each hour, add a row
  for (var i = 0; i < WORK_HOURS; i++) {
    // grab the hour moment
    var hourMoment = moment(START_TIME + i, 'HH');

    // create a new row
    var timeRowEl = $('<div>').addClass('row time-block');

    // adding an id representing the hour onto each row (e.g. id='hour-14' reps 2pm)
    timeRowEl.attr('id', `hour-${hourMoment.format('H')}`);

    // coloring the row
    timeRowEl.addClass(getContext(Number(hourMoment.format('H'))));

    // i can just append the rest
    timeRowEl.append(
      `<div class="col-md-1 hour">${hourMoment.format('hA')}</div>
      <textarea class="col-md-10 description"></textarea>
      <button class="col-md-1 btn saveBtn"><i class="fas fa-save"></i></button>`
    );

    // append to main
    timeRowEl.appendTo(scheduleEl);
  }
}

function init() {
  // create layout
  createLayout();

  // get stored schedule
  schedule = JSON.parse(localStorage.getItem('schedule'));

  // check that storage is not empty
  if (schedule !== null) {
    for (var hour in schedule) {
      // check that there is a stored event for this hour
      if (schedule[hour] !== '') {
        // grab the corresponding html hour element
        var thisHourEl = $(`#hour-${hour}`);

        // set the value inside textarea to whatever is stored for this hour
        thisHourEl.children('textarea').val(schedule[hour]);
      }
    }

    // display the clear button
    clearScheduleBtn.css('display', '');
  } else {
    // set schedule to appropriately 'empty' object
    schedule = {};
    for (var i = 0; i < WORK_HOURS; i++) {
      schedule[START_TIME + i] = '';
    }
  }
}

// event listener for clicking save button
scheduleEl.on('click', 'button', function () {
  // grab the text
  var hourEvent = $(this).parent().children('textarea').val();

  // if the text is empty, exit
  if (hourEvent === '') {
    showFeedback('No text entered!');
    return;
  }

  // grab the hour
  var hourIndex = $(this).closest('.row').attr('id');
  var hour = Number(hourIndex.split('-')[1]);

  // check the event hasn't already been stored
  if (schedule[hour] === hourEvent) {
    showFeedback('Event already stored!');
    return;
  }

  // make the necessary change in tracking schedule object
  schedule[hour] = hourEvent;

  // update storage with this amended schedule
  updateStorage(schedule);

  // show some feedback
  showFeedback('Event added to <code>localStorage</code> ✔️');
  successSfx.play();

  // also quick check to ensure clear button is showing
  if (clearScheduleBtn.css('display') === 'none') {
    clearScheduleBtn.css('display', '');
  }
});

// event listener for clearing schedule
clearScheduleBtn.on('click', function () {
  var confirmClear = confirm(
    "Are you sure you want to clear today's schedule?"
  );
  if (confirmClear) {
    clearSchedule();

    showFeedback('Events cleared from <code>localStorage</code> ✔️');
    trashSfx.play();

    // also hide the clear button
    clearScheduleBtn.css('display', 'none');
  }
});

init();
