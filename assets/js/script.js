// constants - their total should not be >=24
// so maybe need to code this check
const WORK_HOURS = 9; // upping this to 9 so that I get a row for 5pm
const START_TIME = 9;

// grab html elements
var currentDayEl = $('#current-day');
var scheduleEl = $('main');
var clearScheduleBtn = $('#clear-schedule');
var feedbackEl = $('.feedback');

// global schedule object
var schedule = {};

// moment stuff
var rightNow = moment();
var thisHour = Number(rightNow.format('H')); // get the 'military' hour

// display current date at top of page
currentDayEl.text(rightNow.format('dddd, MMMM Do'));

// function to deal with feedback

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
    // because i only need to keep track of each time block
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
      // hour = Number(hour); // not sure I need this
      if (schedule[hour] !== '') {
        // grab the hour element
        var thisHourEl = $(`#hour-${hour}`);

        // set the value/text to whatever is stored for this hour
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
    console.log('no text, buddy!'); // put this in feedback
    return;
  }

  // grab the hour
  var hourIndex = $(this).closest('.row').attr('id');
  var hour = Number(hourIndex.split('-')[1]);

  // make the necessary change in tracking schedule object
  schedule[hour] = hourEvent;

  // update storage with this amended schedule
  updateStorage(schedule);

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

    // also hide the clear button
    clearScheduleBtn.css('display', 'none');
  }
});

init();
