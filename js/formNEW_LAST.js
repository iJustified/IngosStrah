; (function () {
   'use strict';

   class Form {
      static patternName = /^[а-яёА-ЯЁ]+ [а-яёА-ЯЁ]+ [а-яёА-ЯЁ]*$/;
      static patternMail = /^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z])+$/;
      static patternPhone = /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/;
      static errorMess = [
         'Заполните поле', // 0
         'Проверьте поле на правильность заполения', // 1
         'Номер не найден', // 2
         'Почта не найдена' // 3
      ];

      constructor(form) {
         this.form = form;
         this.fields = document.querySelectorAll('.form-control');
         this.btn = this.form.querySelector('[type=submit]');
         this.btn = this.form.querySelector('[type=submit]');
         this.checkBox = document.querySelector('[type=checkbox]');
         this.popup = document.querySelector('.popup_bg');
         this.closepopupBtn = document.querySelector('.close_popup');
         this.iserror = false;
         this.registerEventsHandler();
         this.clearForm();
      }

      static getElement(el) {
         return el.parentElement.nextElementSibling;
      }

      clickCheckbox() {
         let objectsThis = this;
         this.checkBox.addEventListener('click', function() {
            (this.value === 'yes') ? this.value = 'no' : this.value = 'yes';
            objectsThis.addClassSubmit();
         })
      }

      registerEventsHandler() {
         this.clickCheckbox();
         this.btn.addEventListener('click', this.validForm.bind(this));
         this.form.addEventListener('focus', () => {
            const el = document.activeElement;
            if (el === this.btn) return;
            this.cleanError(el);
         }, true);
         for (let field of this.fields) {
            field.addEventListener('blur', this.validBlurField.bind(this));
         }
      }

      validForm(e) {
         e.preventDefault();
         const formData = new FormData(this.form);
         let error;

         for (let property of formData.keys()) {
            error = this.getError(formData, property);
            if (error.length == 0) continue;
            this.iserror = true;
            this.showError(property, error);
         }

         if (this.iserror) return;
         if (this.checkBox.value === 'yes') this.sendFormData(formData);
      }

      validBlurField(e) {
         const target = e.target;
         const property = target.getAttribute('name');
         const value = target.value;

         const formData = new FormData();
         formData.append(property, value);

         const error = this.getError(formData, property);
         if (error.length == 0) return;
         this.showError(property, error);
      }

      getError(formData, property) {
         let error = '';
         const validate = {
            username: () => {
               if (formData.get('username').length == 0) {
                  error = Form.errorMess[0];
                  this.cleanSuccess(property);
               } else if (Form.patternName.test(formData.get('username')) == false) {
                  error = Form.errorMess[1];
                  this.cleanSuccess(property);
               } else {
                  this.showSuccess(property);
               }
            },
            usermail: () => {
               if (formData.get('usermail').length == 0) {
                  error = Form.errorMess[0];
                  this.cleanSuccess(property);
               } else if (Form.patternMail.test(formData.get('usermail')) == false) {
                  error = Form.errorMess[3];
                  this.cleanSuccess(property);
               } else {
                  this.showSuccess(property);
               }
            },
            userphone: () => {
               if (formData.get('userphone').length == 0) {
                  error = Form.errorMess[0];
                  this.cleanSuccess(property);
               } else if (Form.patternPhone.test(formData.get('userphone')) == false) {
                  error = Form.errorMess[2];
                  this.cleanSuccess(property);
               } else {
                  this.showSuccess(property);
               }
            }
         }

         if (property in validate) {
            validate[property]();
         }
         return error;
      }

      showError(property, error) {
         const el = this.form.querySelector(`[name=${property}]`);
         const errorBox = Form.getElement(el);

         el.classList.add('form-control_error');
         errorBox.innerHTML = error;
         errorBox.style.display = 'block';
      }

      showSuccess(property) {
         var formElement = document.querySelector('[name=' + property + ']');
         formElement.classList.add('form-control_success');
         this.addClassSubmit();
      }

      cleanSuccess(property) {
         var formElement = document.querySelector('[name=' + property + ']');
         formElement.classList.remove('form-control_success');
         this.addClassSubmit();
      }

      addClassSubmit() {
         let getInputAll = document.querySelectorAll('.form-control_success');
         let sendMess = document.querySelector('#send_mess');
         (getInputAll.length === 3 && this.checkBox.value === 'yes') ? sendMess.classList.add('button_success') : sendMess.classList.remove('button_success');
      }

      cleanError(el) {
         const errorBox = Form.getElement(el);
         el.classList.remove('form-control_error');
         errorBox.removeAttribute('style');
         this.iserror = false;
      }

      clearForm() {
         let i = 0;
         while (i < this.fields.length) {
            (this.fields[i] === this.checkBox) ? this.fields[i].checked  = false : this.fields[i].value = '';
            this.fields[i].classList.remove('form-control_success');
            i++;
         }

      }

      sendWithForm() {
         this.closepopupBtn.addEventListener('click', () => this.popup.classList.remove('open_popup'));
         this.popup.classList.add('open_popup');
         this.clearForm();
      }

      sendFormData(formData) {

         this.sendWithForm();

         let xhr = new XMLHttpRequest();
         xhr.open('POST', '/sendmail.php', true);
         // xhr.onreadystatechange содержит обработчик события,
         // вызываемый когда происходит событие readystatechange
         xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
               if (xhr.status === 200) {
                  // здесь расположен код вашей callback-функции
                  // например, она может выводить сообщение об успешной отправке письма
               } else {
                  // здесь расположен код вашей callback-функции
                  // например, она может выводить сообщение об ошибке
               }
            } else {
               // здесь расположен код вашей callback-функции
               // например, она может выводить сообщение об ошибке
            }
         }
         xhr.send(formData);
      }
   }

   const forms = document.querySelectorAll('[name=feedback]');
   if (!forms) return;
   for (let form of forms) {
      const f = new Form(form);
   }

})();