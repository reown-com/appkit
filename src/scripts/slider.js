/*
  OPTIONS TOGGLE
*/
const slider        = document.getElementById('options-rail');
const softwareRadio = document.getElementById('radio-software');
const hardwareRadio = document.getElementById('radio-hardware');

// TODO: Change the buttons to radios and use selected state!
softwareRadio.addEventListener('click', () => {
    slider.setAttribute('data-active', "software");
});
hardwareRadio.addEventListener('click', () => {
    slider.setAttribute('data-active', "hardware");
});
