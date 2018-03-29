var modal = document.querySelector('.modal');
var closeButton = document.querySelector('.close-button');

function toggleModal() {
  modal.classList.toggle('show-modal');
}

function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}

closeButton.addEventListener('click', toggleModal);
window.addEventListener('click', windowOnClick);

/*
  OPTIONS TOGGLE
*/
const slider = document.getElementById('options-rail');
const softwareRadio = document.getElementById('radio-software');
const hardwareRadio = document.getElementById('radio-hardware');

// TODO: Change the buttons to radios and use selected state!
softwareRadio.addEventListener('click', function() {
  slider.setAttribute('data-active', "software");
  softwareRadio.classList.add('selected');
  hardwareRadio.classList.remove('selected');
});
hardwareRadio.addEventListener('click', function() {
  slider.setAttribute('data-active', "hardware");
  softwareRadio.classList.remove('selected');
  hardwareRadio.classList.add('selected');
});

/*
  MESSAGE RECEIVER
*/
window.addEventListener('message', function(e) {
  var message = e.data;
  console.log('TEST', e);
});


window.parent.postMessage('TEST POST MESSAGE FROM IFRAME', '*');