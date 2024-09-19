//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

window.GOVUKPrototypeKit.documentReady(() => {
  // Add JavaScript here
  const radioButtons = document.querySelectorAll('.star-rating .govuk-radios__input');

  radioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
      // Remove "before-selected" class from all labels
      document.querySelectorAll('.govuk-label').forEach(label => label.classList.remove('govuk-radios__label_before_selected'));

      // Add "before-selected" class to all previous labels
      let previousSibling = this.closest('.govuk-radios__item').previousElementSibling;
      while (previousSibling) {
        previousSibling.querySelector('.govuk-label').classList.add('govuk-radios__label_before_selected');
        previousSibling = previousSibling.previousElementSibling;
      }
    });
  });
})
